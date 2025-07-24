import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProject } from './useProject';
import { projectApi } from '../services/api';
import type { ProjectHub } from '../types';

// Mock the API
vi.mock('../services/api', () => ({
  projectApi: {
    getById: vi.fn(),
    update: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  }
}));

const mockProjectApi = projectApi as any;

const mockProject: ProjectHub = {
  projectId: 'test-project-1',
  projectName: 'Test Project',
  oneLineIdea: 'A test project for testing',
  teamMembers: [
    {
      id: 'member-1',
      name: 'John Doe',
      role: 'Team Lead',
      joinedAt: new Date('2024-01-01T10:00:00Z')
    }
  ],
  deadlines: {
    hackingEnds: new Date('2024-01-02T18:00:00Z'),
    submissionDeadline: new Date('2024-01-02T20:00:00Z'),
    presentationTime: new Date('2024-01-03T09:00:00Z')
  },
  judgingCriteria: [
    {
      id: 'criteria-1',
      name: 'Business Potential',
      description: 'How viable is this as a business?',
      completed: false
    }
  ],
  pivotLog: []
};

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with empty state when no initial project provided', () => {
      const { result } = renderHook(() => useProject());

      expect(result.current.project).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.saving).toBe(false);
    });

    it('should initialize with provided initial project', () => {
      const { result } = renderHook(() => useProject(mockProject));

      expect(result.current.project).toEqual(mockProject);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.saving).toBe(false);
    });
  });

  describe('loadProject', () => {
    it('should load project successfully', async () => {
      mockProjectApi.getById.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProject());

      await act(async () => {
        await result.current.loadProject('test-project-1');
      });

      expect(mockProjectApi.getById).toHaveBeenCalledWith('test-project-1');
      expect(result.current.project).toEqual(mockProject);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle load project errors', async () => {
      const errorMessage = 'Project not found';
      mockProjectApi.getById.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProject());

      await act(async () => {
        await result.current.loadProject('nonexistent-project');
      });

      expect(result.current.project).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state during project load', async () => {
      let resolveLoad: (value: any) => void;
      const loadPromise = new Promise(resolve => {
        resolveLoad = resolve;
      });
      mockProjectApi.getById.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useProject());

      act(() => {
        result.current.loadProject('test-project-1');
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        resolveLoad!(mockProject);
        await loadPromise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.project).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const updatedProject = {
        ...mockProject,
        projectName: 'Updated Project Name'
      };
      mockProjectApi.update.mockResolvedValue(updatedProject);

      const { result } = renderHook(() => useProject(mockProject));

      await act(async () => {
        await result.current.updateProject({ projectName: 'Updated Project Name' });
      });

      expect(mockProjectApi.update).toHaveBeenCalledWith('test-project-1', {
        projectName: 'Updated Project Name'
      });
      expect(result.current.project).toEqual(updatedProject);
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update project errors', async () => {
      const errorMessage = 'Update failed';
      mockProjectApi.update.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProject(mockProject));

      await act(async () => {
        await result.current.updateProject({ projectName: 'New Name' });
      });

      expect(result.current.project).toEqual(mockProject); // Should remain unchanged
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle update when no project is loaded', async () => {
      const { result } = renderHook(() => useProject());

      await act(async () => {
        await result.current.updateProject({ projectName: 'New Name' });
      });

      expect(mockProjectApi.update).not.toHaveBeenCalled();
      expect(result.current.error).toBe('No project loaded');
    });

    it('should set saving state during update', async () => {
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise(resolve => {
        resolveUpdate = resolve;
      });
      mockProjectApi.update.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useProject(mockProject));

      act(() => {
        result.current.updateProject({ projectName: 'New Name' });
      });

      expect(result.current.saving).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        resolveUpdate!(mockProject);
        await updatePromise;
      });

      expect(result.current.saving).toBe(false);
    });
  });

  describe('addTeamMember', () => {
    it('should add team member successfully', async () => {
      const newMember = {
        id: 'member-2',
        name: 'Jane Smith',
        role: 'Developer',
        joinedAt: new Date('2024-01-01T11:00:00Z')
      };
      mockProjectApi.addMember.mockResolvedValue(newMember);

      const { result } = renderHook(() => useProject(mockProject));

      await act(async () => {
        await result.current.addTeamMember('Jane Smith', 'Developer');
      });

      expect(mockProjectApi.addMember).toHaveBeenCalledWith('test-project-1', {
        name: 'Jane Smith',
        role: 'Developer'
      });
      expect(result.current.project?.teamMembers).toHaveLength(2);
      expect(result.current.project?.teamMembers[1]).toEqual(newMember);
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle add member errors', async () => {
      const errorMessage = 'Member already exists';
      mockProjectApi.addMember.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProject(mockProject));

      await act(async () => {
        await result.current.addTeamMember('John Doe');
      });

      expect(result.current.project?.teamMembers).toHaveLength(1); // Should remain unchanged
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle add member when no project is loaded', async () => {
      const { result } = renderHook(() => useProject());

      await act(async () => {
        await result.current.addTeamMember('Jane Smith');
      });

      expect(mockProjectApi.addMember).not.toHaveBeenCalled();
      expect(result.current.error).toBe('No project loaded');
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      const projectWithTwoMembers = {
        ...mockProject,
        teamMembers: [
          ...mockProject.teamMembers,
          {
            id: 'member-2',
            name: 'Jane Smith',
            role: 'Developer',
            joinedAt: new Date('2024-01-01T11:00:00Z')
          }
        ]
      };

      mockProjectApi.removeMember.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProject(projectWithTwoMembers));

      await act(async () => {
        await result.current.removeTeamMember('member-2');
      });

      expect(mockProjectApi.removeMember).toHaveBeenCalledWith('test-project-1', 'member-2');
      expect(result.current.project?.teamMembers).toHaveLength(1);
      expect(result.current.project?.teamMembers[0].id).toBe('member-1');
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle remove member errors', async () => {
      const errorMessage = 'Cannot remove last member';
      mockProjectApi.removeMember.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProject(mockProject));

      await act(async () => {
        await result.current.removeTeamMember('member-1');
      });

      expect(result.current.project?.teamMembers).toHaveLength(1); // Should remain unchanged
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle remove member when no project is loaded', async () => {
      const { result } = renderHook(() => useProject());

      await act(async () => {
        await result.current.removeTeamMember('member-1');
      });

      expect(mockProjectApi.removeMember).not.toHaveBeenCalled();
      expect(result.current.error).toBe('No project loaded');
    });
  });

  describe('Utility functions', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useProject());

      // Set an error first
      act(() => {
        result.current.loadProject('nonexistent-project');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set project', () => {
      const { result } = renderHook(() => useProject());

      act(() => {
        result.current.setProject(mockProject);
      });

      expect(result.current.project).toEqual(mockProject);
    });
  });
});