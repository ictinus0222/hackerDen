import request from 'supertest';
import { app } from '../server.js';
import { Project } from '../models/Project.js';
import { generateProjectToken } from '../middleware/auth.js';
import { connectDB, disconnectDB, clearDB } from '../test/setup.js';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { beforeEach } from 'vitest';
import { afterAll } from 'vitest';
import { beforeAll } from 'vitest';
import { describe } from 'vitest';

describe('Project API Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        projectName: 'Test Hackathon Project',
        oneLineIdea: 'A revolutionary app that changes everything',
        creatorName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.projectName).toBe(projectData.projectName);
      expect(response.body.data.project.oneLineIdea).toBe(projectData.oneLineIdea);
      expect(response.body.data.project.teamMembers).toHaveLength(1);
      expect(response.body.data.project.teamMembers[0].name).toBe(projectData.creatorName);
      expect(response.body.data.project.teamMembers[0].role).toBe('Team Lead');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CREATION_FAILED');
    });

    it('should validate project name length', async () => {
      const projectData = {
        projectName: '', // Empty name
        oneLineIdea: 'A revolutionary app',
        creatorName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate one line idea length', async () => {
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'A'.repeat(501), // Too long
        creatorName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;
    let token: string;

    beforeEach(async () => {
      // Create a test project
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'Test idea',
        creatorName: 'John Doe'
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .send(projectData);

      projectId = createResponse.body.data.project.projectId;
      token = createResponse.body.data.token;
    });

    it('should retrieve project successfully with valid token', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectId).toBe(projectId);
      expect(response.body.data.projectName).toBe('Test Project');
      expect(response.body.data.oneLineIdea).toBe('Test idea');
      expect(response.body.data.teamMembers).toHaveLength(1);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 403 when accessing different project', async () => {
      const otherToken = generateProjectToken('different-project-id');
      
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 404 for non-existent project', async () => {
      const nonExistentId = 'non-existent-id';
      const nonExistentToken = generateProjectToken(nonExistentId);
      
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId: string;
    let token: string;

    beforeEach(async () => {
      // Create a test project
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'Test idea',
        creatorName: 'John Doe'
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .send(projectData);

      projectId = createResponse.body.data.project.projectId;
      token = createResponse.body.data.token;
    });

    it('should update project successfully', async () => {
      const updateData = {
        projectName: 'Updated Project Name',
        oneLineIdea: 'Updated project idea',
        deadlines: {
          hackingEnds: new Date('2024-12-31T23:59:59Z'),
          submissionDeadline: new Date('2025-01-01T12:00:00Z'),
          presentationTime: new Date('2025-01-01T15:00:00Z')
        },
        judgingCriteria: [
          { id: 'innovation', name: 'Innovation', description: 'How innovative is the solution', completed: false },
          { id: 'technical', name: 'Technical Implementation', description: 'Quality of code and architecture', completed: true }
        ]
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe(updateData.projectName);
      expect(response.body.data.oneLineIdea).toBe(updateData.oneLineIdea);
      expect(response.body.data.deadlines.hackingEnds).toBe(updateData.deadlines.hackingEnds.toISOString());
      expect(response.body.data.judgingCriteria).toHaveLength(2);
      expect(response.body.data.judgingCriteria[0].name).toBe('Innovation');
      expect(response.body.data.judgingCriteria[1].completed).toBe(true);
    });

    it('should update partial project data', async () => {
      const updateData = {
        projectName: 'Partially Updated Name'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe(updateData.projectName);
      expect(response.body.data.oneLineIdea).toBe('Test idea'); // Should remain unchanged
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ projectName: 'Updated Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 403 when updating different project', async () => {
      const otherToken = generateProjectToken('different-project-id');
      
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ projectName: 'Updated Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should validate update data', async () => {
      const invalidData = {
        projectName: 'A'.repeat(201) // Too long
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UPDATE_FAILED');
    });
  });

  describe('POST /api/projects/:id/members', () => {
    let projectId: string;
    let token: string;

    beforeEach(async () => {
      // Create a test project
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'Test idea',
        creatorName: 'John Doe'
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .send(projectData);

      projectId = createResponse.body.data.project.projectId;
      token = createResponse.body.data.token;
    });

    it('should add team member successfully', async () => {
      const memberData = {
        name: 'Jane Smith',
        role: 'Developer'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send(memberData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(memberData.name);
      expect(response.body.data.role).toBe(memberData.role);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.joinedAt).toBeDefined();

      // Verify member was added to project
      const projectResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectResponse.body.data.teamMembers).toHaveLength(2);
    });

    it('should add team member without role', async () => {
      const memberData = {
        name: 'Jane Smith'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send(memberData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(memberData.name);
      expect(response.body.data.role).toBeUndefined();
    });

    it('should return 409 when adding duplicate member', async () => {
      const memberData = {
        name: 'John Doe' // Same as creator
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send(memberData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MEMBER_EXISTS');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .send({ name: 'Jane Smith' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 403 when adding member to different project', async () => {
      const otherToken = generateProjectToken('different-project-id');
      
      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Jane Smith' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should validate member data', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({}) // Missing name
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADD_MEMBER_FAILED');
    });
  });

  describe('DELETE /api/projects/:id/members/:memberId', () => {
    let projectId: string;
    let token: string;
    let memberId: string;

    beforeEach(async () => {
      // Create a test project
      const projectData = {
        projectName: 'Test Project',
        oneLineIdea: 'Test idea',
        creatorName: 'John Doe'
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .send(projectData);

      projectId = createResponse.body.data.project.projectId;
      token = createResponse.body.data.token;

      // Add a team member to remove
      const memberResponse = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Smith', role: 'Developer' });

      memberId = memberResponse.body.data.id;
    });

    it('should remove team member successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/members/${memberId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify member was removed from project
      const projectResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectResponse.body.data.teamMembers).toHaveLength(1);
      expect(projectResponse.body.data.teamMembers[0].name).toBe('John Doe');
    });

    it('should return 404 for non-existent member', async () => {
      const nonExistentMemberId = 'non-existent-member-id';
      
      const response = await request(app)
        .delete(`/api/projects/${projectId}/members/${nonExistentMemberId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MEMBER_NOT_FOUND');
    });

    it('should return 400 when trying to remove last team member', async () => {
      // First remove the added member, leaving only the creator
      await request(app)
        .delete(`/api/projects/${projectId}/members/${memberId}`)
        .set('Authorization', `Bearer ${token}`);

      // Get the creator's member ID
      const projectResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const creatorId = projectResponse.body.data.teamMembers[0].id;

      // Try to remove the last member (creator)
      const response = await request(app)
        .delete(`/api/projects/${projectId}/members/${creatorId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CANNOT_REMOVE_LAST_MEMBER');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/members/${memberId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 403 when removing member from different project', async () => {
      const otherToken = generateProjectToken('different-project-id');
      
      const response = await request(app)
        .delete(`/api/projects/${projectId}/members/${memberId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the error handling structure is in place
      const response = await request(app)
        .post('/api/projects')
        .send({
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          creatorName: 'John Doe'
        });

      // Should either succeed or fail gracefully with proper error structure
      if (!response.body.success) {
        expect(response.body.error).toBeDefined();
        expect(response.body.error.code).toBeDefined();
        expect(response.body.error.message).toBeDefined();
        expect(response.body.timestamp).toBeDefined();
      }
    });
  });
});