import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { Project, IProject } from './Project.js';
import { TeamMember, JudgingCriterion, PivotEntry } from '../types/index.js';

describe('Project Model', () => {
  beforeEach(async () => {
    // Clear the collection before each test
    await Project.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await Project.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid project', async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A revolutionary test project',
        teamMembers: [
          {
            id: 'member-1',
            name: 'John Doe',
            role: 'Developer'
          }
        ],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        },
        judgingCriteria: [
          {
            id: 'criteria-1',
            name: 'Innovation',
            description: 'How innovative is the solution?',
            completed: false
          }
        ]
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.projectId).toBe(projectData.projectId);
      expect(savedProject.projectName).toBe(projectData.projectName);
      expect(savedProject.oneLineIdea).toBe(projectData.oneLineIdea);
      expect(savedProject.teamMembers).toHaveLength(1);
      expect(savedProject.teamMembers[0].name).toBe('John Doe');
      expect(savedProject.judgingCriteria).toHaveLength(1);
      expect(savedProject.pivotLog).toHaveLength(0);
      expect(savedProject.createdAt).toBeDefined();
      expect(savedProject.updatedAt).toBeDefined();
    });

    it('should require projectId', async () => {
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [{ id: 'member-1', name: 'John Doe' }],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow();
    });

    it('should require at least one team member', async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow('At least one team member is required');
    });

    it('should validate deadline order', async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [{ id: 'member-1', name: 'John Doe' }],
        deadlines: {
          hackingEnds: new Date('2024-12-01T20:00:00Z'),
          submissionDeadline: new Date('2024-12-01T18:00:00Z'), // Before hacking ends
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow('Hacking end time must be before submission deadline');
    });

    it('should enforce unique team member IDs', async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [
          { id: 'member-1', name: 'John Doe' },
          { id: 'member-1', name: 'Jane Doe' } // Duplicate ID
        ],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow('Team member IDs must be unique');
    });

    it('should enforce unique project IDs', async () => {
      const projectData1 = {
        projectId: 'project-1',
        projectName: 'Test Project 1',
        oneLineIdea: 'First test project',
        teamMembers: [{ id: 'member-1', name: 'John Doe' }],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const projectData2 = {
        projectId: 'project-1', // Same ID
        projectName: 'Test Project 2',
        oneLineIdea: 'Second test project',
        teamMembers: [{ id: 'member-2', name: 'Jane Doe' }],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project1 = new Project(projectData1);
      await project1.save();

      const project2 = new Project(projectData2);
      await expect(project2.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let project: IProject;

    beforeEach(async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [
          {
            id: 'member-1',
            name: 'John Doe',
            role: 'Developer'
          }
        ],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        },
        judgingCriteria: [
          {
            id: 'criteria-1',
            name: 'Innovation',
            completed: false
          }
        ]
      };

      project = new Project(projectData);
      await project.save();
    });

    it('should add a team member', async () => {
      const newMember = {
        id: 'member-2',
        name: 'Jane Smith',
        role: 'Designer'
      };

      await project.addTeamMember(newMember);
      
      expect(project.teamMembers).toHaveLength(2);
      expect(project.teamMembers[1].name).toBe('Jane Smith');
      expect(project.teamMembers[1].joinedAt).toBeDefined();
    });

    it('should remove a team member', async () => {
      // Add another team member first so we don't violate the minimum requirement
      await project.addTeamMember({
        id: 'member-2',
        name: 'Jane Smith',
        role: 'Designer'
      });
      
      await project.removeTeamMember('member-1');
      
      expect(project.teamMembers).toHaveLength(1);
      expect(project.teamMembers[0].name).toBe('Jane Smith');
    });

    it('should add a pivot entry', async () => {
      const pivot = {
        id: 'pivot-1',
        description: 'Changed from mobile to web',
        reason: 'Mobile development was too complex'
      };

      await project.addPivotEntry(pivot);
      
      expect(project.pivotLog).toHaveLength(1);
      expect(project.pivotLog[0].description).toBe(pivot.description);
      expect(project.pivotLog[0].timestamp).toBeDefined();
    });

    it('should update judging criterion completion', async () => {
      await project.updateJudgingCriterion('criteria-1', true);
      
      expect(project.judgingCriteria[0].completed).toBe(true);
    });

    it('should throw error for non-existent judging criterion', async () => {
      try {
        await project.updateJudgingCriterion('non-existent', true);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Judging criterion not found');
      }
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      const projectData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
        teamMembers: [
          {
            id: 'member-1',
            name: 'John Doe',
            role: 'Developer'
          }
        ],
        deadlines: {
          hackingEnds: new Date('2024-12-01T18:00:00Z'),
          submissionDeadline: new Date('2024-12-01T20:00:00Z'),
          presentationTime: new Date('2024-12-02T10:00:00Z')
        }
      };

      const project = new Project(projectData);
      await project.save();
    });

    it('should find project by projectId', async () => {
      const foundProject = await Project.findByProjectId('project-1');
      
      expect(foundProject).toBeDefined();
      expect(foundProject?.projectName).toBe('Test Project');
    });

    it('should find projects by team member', async () => {
      const projects = await Project.findByTeamMember('member-1');
      
      expect(projects).toHaveLength(1);
      expect(projects[0].projectName).toBe('Test Project');
    });

    it('should return null for non-existent project', async () => {
      const foundProject = await Project.findByProjectId('non-existent');
      
      expect(foundProject).toBeNull();
    });
  });
});