import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useTeam } from './useTeam';

export const useTasks = () => {
  const { team } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Set up real-time subscription
  useEffect(() => {
    if (!team?.$id) return;

    const unsubscribe = taskService.subscribeToTasks(team.$id, handleTaskUpdate);
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [team?.$id, handleTaskUpdate]);

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
    refetch: fetchTasks
  };
};