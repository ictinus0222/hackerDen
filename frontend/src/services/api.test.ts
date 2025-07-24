import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { projectApi, setAuthToken, getAuthToken, clearAuthToken } from './api';
import type { ProjectHub, TeamMember } from '../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

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

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token management', () => {
    beforeEach(() => {
      // Clear token state before each test
      clearAuthToken();
    });

    it('should set and get auth token', () => {
      const token = 'test-token-123';
      
      setAuthToken(token);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hackerden_token', token);
      expect(getAuthToken()).toBe(token);
    });

    it('should get token from localStorage if not in memory', () => {
      const token = 'stored-token-456';
      mockLocalStorage.getItem.mockReturnValue(token);
      
      expect(getAuthToken()).toBe(token);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('hackerden_token');
    });

    it('should clear auth token', () => {
      // Set a token first
      setAuthToken('test-token');
      
      clearAuthToken();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hackerden_token');
      
      // Mock localStorage to return null after clearing
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('Project API', () => {
    describe('create', () => {
      it('should create project successfully', async () => {
        const createData = {
          projectName: 'New Project',
          oneLineIdea: 'A new project idea',
          creatorName: 'John Doe'
        };

        const responseData = {
          project: mockProject,
          token: 'new-token-123'
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: responseData,
            timestamp: new Date().toISOString()
          })
        });

        const result = await projectApi.create(createData);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(createData)
          })
        );

        expect(result).toEqual(responseData);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hackerden_token', 'new-token-123');
      });

      it('should handle create project errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'CREATION_FAILED',
              message: 'Project name already exists'
            },
            timestamp: new Date().toISOString()
          })
        });

        await expect(projectApi.create({
          projectName: 'Existing Project',
          oneLineIdea: 'Test idea',
          creatorName: 'John Doe'
        })).rejects.toThrow('Project name already exists');
      });
    });

    describe('getById', () => {
      it('should fetch project successfully', async () => {
        const token = 'auth-token-123';
        setAuthToken(token);

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockProject,
            timestamp: new Date().toISOString()
          })
        });

        const result = await projectApi.getById('test-project-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${token}`
            })
          })
        );

        expect(result).toEqual(mockProject);
      });

      it('should handle fetch project errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found'
            },
            timestamp: new Date().toISOString()
          })
        });

        await expect(projectApi.getById('nonexistent-project')).rejects.toThrow('Project not found');
      });
    });

    describe('update', () => {
      it('should update project successfully', async () => {
        const token = 'auth-token-123';
        setAuthToken(token);

        const updates = {
          projectName: 'Updated Project Name',
          oneLineIdea: 'Updated idea'
        };

        const updatedProject = { ...mockProject, ...updates };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: updatedProject,
            timestamp: new Date().toISOString()
          })
        });

        const result = await projectApi.update('test-project-1', updates);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(updates)
          })
        );

        expect(result).toEqual(updatedProject);
      });

      it('should handle update project errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'UPDATE_FAILED',
              message: 'Validation failed'
            },
            timestamp: new Date().toISOString()
          })
        });

        await expect(projectApi.update('test-project-1', {})).rejects.toThrow('Validation failed');
      });
    });

    describe('addMember', () => {
      it('should add team member successfully', async () => {
        const token = 'auth-token-123';
        setAuthToken(token);

        const memberData = {
          name: 'Jane Smith',
          role: 'Developer'
        };

        const newMember: TeamMember = {
          id: 'member-2',
          name: 'Jane Smith',
          role: 'Developer',
          joinedAt: new Date('2024-01-01T11:00:00Z')
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: newMember,
            timestamp: new Date().toISOString()
          })
        });

        const result = await projectApi.addMember('test-project-1', memberData);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1/members',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(memberData)
          })
        );

        expect(result).toEqual(newMember);
      });

      it('should handle add member errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'MEMBER_EXISTS',
              message: 'Team member with this name already exists'
            },
            timestamp: new Date().toISOString()
          })
        });

        await expect(projectApi.addMember('test-project-1', {
          name: 'John Doe'
        })).rejects.toThrow('Team member with this name already exists');
      });
    });

    describe('removeMember', () => {
      it('should remove team member successfully', async () => {
        const token = 'auth-token-123';
        setAuthToken(token);

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            timestamp: new Date().toISOString()
          })
        });

        await projectApi.removeMember('test-project-1', 'member-2');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1/members/member-2',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${token}`
            })
          })
        );
      });

      it('should handle remove member errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'CANNOT_REMOVE_LAST_MEMBER',
              message: 'Cannot remove the last team member'
            },
            timestamp: new Date().toISOString()
          })
        });

        await expect(projectApi.removeMember('test-project-1', 'member-1'))
          .rejects.toThrow('Cannot remove the last team member');
      });
    });
  });

  describe('Date conversion', () => {
    it('should convert date strings to Date objects', async () => {
      const projectWithDateStrings = {
        ...mockProject,
        teamMembers: [{
          ...mockProject.teamMembers[0],
          joinedAt: '2024-01-01T10:00:00.000Z'
        }],
        deadlines: {
          hackingEnds: '2024-01-02T18:00:00.000Z',
          submissionDeadline: '2024-01-02T20:00:00.000Z',
          presentationTime: '2024-01-03T09:00:00.000Z'
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: projectWithDateStrings,
          timestamp: new Date().toISOString()
        })
      });

      const result = await projectApi.getById('test-project-1');

      expect(result.teamMembers[0].joinedAt).toBeInstanceOf(Date);
      expect(result.deadlines.hackingEnds).toBeInstanceOf(Date);
      expect(result.deadlines.submissionDeadline).toBeInstanceOf(Date);
      expect(result.deadlines.presentationTime).toBeInstanceOf(Date);
    });
  });

  describe('Network errors', () => {
    it('should handle network failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(projectApi.getById('test-project-1')).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(projectApi.getById('test-project-1')).rejects.toThrow('Invalid JSON');
    });
  });
});