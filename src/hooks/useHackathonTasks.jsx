import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { realtimeService } from '../services/realtimeService';
import { teamService } from '../services/teamService';
import { useAuth } from './useAuth';

export const useHackathonTasks = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [team, setTeam] = useState(null);

  // Get user's team for this hackathon
  const fetchTeam = useCallback(async () => {
    if (!user?.$id || !hackathonId) {
      setTeam(null);
      return null;
    }

    try {
      const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
      setTeam(userTeam);
      return userTeam;
    } catch (err) {
      console.error('Error fetching team:', err);
      setTeam(null);
      return null;
    }
  }, [user?.$id, hackathonId]);

  // Fetch tasks for the current team and hackathon
  const fetchTasks = useCallback(async () => {
    if (!hackathonId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get team first
      const userTeam = await fetchTeam();
      
      if (!userTeam?.$id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // Validate parameters before making the call
      if (!userTeam.$id || !hackathonId) {
        console.warn('Missing required parameters for getTeamTasks:', { teamId: userTeam.$id, hackathonId });
        setTasks([]);
        setLoading(false);
        return;
      }

      const teamTasks = await taskService.getTeamTasks(userTeam.$id, hackathonId);
      setTasks(teamTasks);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, fetchTeam]);

  // Handle real-time task updates
  const handleTaskUpdate = useCallback((response) => {
    const { events, payload } = response;
    
    // Update last sync time for monitoring
    setLastSyncTime(new Date());
    
    // Clear any subscription errors on successful update
    setSubscriptionError(null);
    
    if (events.includes('databases.*.collections.*.documents.*.create')) {
      // New task created
      setTasks(prev => [payload, ...prev]);
    } else if (events.includes('databases.*.collections.*.documents.*.update')) {
      // Task updated
      setTasks(prev => prev.map(task => 
        task.$id === payload.$id ? payload : task
      ));
    } else if (events.includes('databases.*.collections.*.documents.*.delete')) {
      // Task deleted
      setTasks(prev => prev.filter(task => task.$id !== payload.$id));
    }
  }, []);

  // Set up real-time subscription with enhanced error handling
  useEffect(() => {
    if (!team?.$id || !hackathonId) return;

    const unsubscribe = taskService.subscribeToTasks(
      team.$id,
      hackathonId,
      handleTaskUpdate
    );
    
    return unsubscribe;
  }, [team?.$id, hackathonId, handleTaskUpdate]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    blocked: tasks.filter(task => task.status === 'blocked'),
    done: tasks.filter(task => task.status === 'done')
  };

  return {
    tasks,
    tasksByStatus,
    loading,
    error,
    subscriptionError,
    lastSyncTime,
    team,
    hackathonId,
    refetch: fetchTasks
  };
};