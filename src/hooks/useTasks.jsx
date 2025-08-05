import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { realtimeService } from '../services/realtimeService';
import { useTeam } from './useTeam';

export const useTasks = () => {
  const { team } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Fetch tasks for the current team
  const fetchTasks = useCallback(async () => {
    if (!team?.$id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const teamTasks = await taskService.getTeamTasks(team.$id);
      setTasks(teamTasks);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [team?.$id]);

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
    if (!team?.$id) return;

    const unsubscribe = realtimeService.subscribeToTasks(
      team.$id, 
      handleTaskUpdate,
      {
        onError: (error, retryCount) => {
          console.error(`Task subscription error (attempt ${retryCount}):`, error);
          setSubscriptionError(`Connection issue (attempt ${retryCount}): ${error.message}`);
        },
        onReconnect: (retryCount) => {
          console.log(`Task subscription reconnected after ${retryCount} attempts`);
          setSubscriptionError(null);
          // Refetch tasks to ensure we have the latest data
          fetchTasks();
        }
      }
    );
    
    return unsubscribe;
  }, [team?.$id, handleTaskUpdate, fetchTasks]);

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
    refetch: fetchTasks
  };
};