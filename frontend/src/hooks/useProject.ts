import { useState, useCallback } from 'react';
import type { ProjectHub, TeamMember } from '../types';
import { projectApi } from '../services/api';

export interface UseProjectState {
  project: ProjectHub | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export interface UseProjectActions {
  loadProject: (projectId: string) => Promise<void>;
  updateProject: (updates: Partial<ProjectHub>) => Promise<void>;
  addTeamMember: (name: string, role?: string) => Promise<void>;
  removeTeamMember: (memberId: string) => Promise<void>;
  clearError: () => void;
  setProject: (project: ProjectHub) => void;
}

export interface UseProjectReturn extends UseProjectState, UseProjectActions {}

export const useProject = (initialProject?: ProjectHub): UseProjectReturn => {
  const [state, setState] = useState<UseProjectState>({
    project: initialProject || null,
    loading: false,
    error: null,
    saving: false,
  });

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false, saving: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setProject = useCallback((project: ProjectHub) => {
    setState(prev => ({ ...prev, project }));
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const project = await projectApi.getById(projectId);
      setState(prev => ({ ...prev, project, loading: false }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to load project';
      setError(message);
    }
  }, [setError]);

  const updateProject = useCallback(async (updates: Partial<ProjectHub>) => {
    if (!state.project) {
      setError('No project loaded');
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const updatedProject = await projectApi.update(state.project.projectId, updates);
      setState(prev => ({ 
        ...prev, 
        project: updatedProject, 
        saving: false 
      }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to update project';
      setError(message);
    }
  }, [state.project, setError]);

  const addTeamMember = useCallback(async (name: string, role?: string) => {
    if (!state.project) {
      setError('No project loaded');
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const newMember = await projectApi.addMember(state.project.projectId, { name, role });
      
      // Update local state with the new member
      setState(prev => ({
        ...prev,
        project: prev.project ? {
          ...prev.project,
          teamMembers: [...prev.project.teamMembers, newMember]
        } : null,
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to add team member';
      setError(message);
    }
  }, [state.project, setError]);

  const removeTeamMember = useCallback(async (memberId: string) => {
    if (!state.project) {
      setError('No project loaded');
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      await projectApi.removeMember(state.project.projectId, memberId);
      
      // Update local state by removing the member
      setState(prev => ({
        ...prev,
        project: prev.project ? {
          ...prev.project,
          teamMembers: prev.project.teamMembers.filter(member => member.id !== memberId)
        } : null,
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to remove team member';
      setError(message);
    }
  }, [state.project, setError]);

  return {
    ...state,
    loadProject,
    updateProject,
    addTeamMember,
    removeTeamMember,
    clearError,
    setProject,
  };
};