import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { Project } from '../models/Project.js';
import { Submission } from '../models/Submission.js';
import { generateProjectToken } from '../middleware/auth.js';
import { connectDB, disconnectDB } from '../test/setup.js';

describe('Submission API Routes', () => {
  let projectId: string;
  let authToken: string;
  let projectData: any;

  beforeEach(async () => {
    await connectDB();
    
    // Create a test project
    projectId = 'test-project-id';
    projectData = {
      projectId,
      projectName: 'Test Hackathon Project',
      oneLineIdea: 'A revolutionary app that changes everything',
      teamMembers: [{
        id: 'member-1',
        name: 'John Doe',
        role: 'Team Lead',
        joinedAt: new Date()
      }],
      deadlines: {
        hackingEnds: new Date(Date.now() + 24 * 60 * 60 * 1000),
        submissionDeadline: new Date(Date.now() + 25 * 60 * 60 * 1000),
        presentationTime: new Date(Date.now() + 26 * 60 * 60 * 1000)
      },
      judgingCriteria: [],
      pivotLog: []
    };

    const project = new Project(projectData);
    await project.save();

    // Generate auth token
    authToken = generateProjectToken(projectId);
  });

  afterEach(async () => {
    await Project.deleteMany({});
    await Submission.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/projects/:id/submission', () => {
    it('should create a new submission package', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        githubUrl: submissionData.githubUrl,
        presentationUrl: submissionData.presentationUrl,
        demoVideoUrl: submissionData.demoVideoUrl,
        isComplete: true // Should be complete with GitHub and presentation URLs
      });
      expect(response.body.data.generatedPageUrl).toContain(`/submission/${projectId}/public`);
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should update existing submission package', async () => {
      // Create initial submission
      const initialData = {
        githubUrl: 'https://github.com/team/project-v1'
      };

      await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(initialData)
        .expect(200);

      // Update submission
      const updateData = {
        githubUrl: 'https://github.com/team/project-v2',
        presentationUrl: 'https://docs.google.com/presentation/d/456',
        demoVideoUrl: 'https://youtube.com/watch?v=456'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        githubUrl: updateData.githubUrl,
        presentationUrl: updateData.presentationUrl,
        demoVideoUrl: updateData.demoVideoUrl,
        isComplete: true
      });
    });

    it('should create submission with partial data', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        githubUrl: submissionData.githubUrl,
        isComplete: false // Should be incomplete without presentation URL
      });
      expect(response.body.data.presentationUrl).toBeUndefined();
      expect(response.body.data.demoVideoUrl).toBeUndefined();
    });

    it('should validate URL formats', async () => {
      const invalidData = {
        githubUrl: 'not-a-valid-url',
        presentationUrl: 'also-invalid',
        demoVideoUrl: 'still-not-valid'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveLength(3);
    });

    it('should require authentication', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .send(submissionData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should prevent access to other projects', async () => {
      const otherProjectId = 'other-project-id';
      const submissionData = {
        githubUrl: 'https://github.com/team/project'
      };

      const response = await request(app)
        .post(`/api/projects/${otherProjectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 404 for non-existent project', async () => {
      const nonExistentProjectId = 'non-existent-project';
      const nonExistentToken = generateProjectToken(nonExistentProjectId);
      const submissionData = {
        githubUrl: 'https://github.com/team/project'
      };

      const response = await request(app)
        .post(`/api/projects/${nonExistentProjectId}/submission`)
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .send(submissionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  describe('GET /api/projects/:id/submission', () => {
    beforeEach(async () => {
      // Create a submission for testing
      const submissionData = {
        projectId,
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const submission = new Submission(submissionData);
      await submission.save();
    });

    it('should retrieve submission package', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123',
        demoVideoUrl: 'https://youtube.com/watch?v=123',
        isComplete: true
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/submission`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should prevent access to other projects', async () => {
      const otherProjectId = 'other-project-id';

      const response = await request(app)
        .get(`/api/projects/${otherProjectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 404 for non-existent project', async () => {
      const nonExistentProjectId = 'non-existent-project';
      const nonExistentToken = generateProjectToken(nonExistentProjectId);

      const response = await request(app)
        .get(`/api/projects/${nonExistentProjectId}/submission`)
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should return 404 for non-existent submission', async () => {
      // Delete the submission
      await Submission.deleteMany({});

      const response = await request(app)
        .get(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SUBMISSION_NOT_FOUND');
    });
  });

  describe('GET /api/submission/:id/public', () => {
    beforeEach(async () => {
      // Create a submission for testing
      const submissionData = {
        projectId,
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const submission = new Submission(submissionData);
      await submission.save();
    });

    it('should retrieve public submission page', async () => {
      const response = await request(app)
        .get(`/api/submission/${projectId}/public`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectName: 'Test Hackathon Project',
        oneLineIdea: 'A revolutionary app that changes everything',
        teamMembers: [{
          name: 'John Doe',
          role: 'Team Lead'
        }],
        submission: {
          projectId,
          githubUrl: 'https://github.com/team/project',
          presentationUrl: 'https://docs.google.com/presentation/d/123',
          demoVideoUrl: 'https://youtube.com/watch?v=123',
          isComplete: true
        }
      });
      expect(response.body.data.generatedAt).toBeDefined();
    });

    it('should not require authentication', async () => {
      const response = await request(app)
        .get(`/api/submission/${projectId}/public`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent submission', async () => {
      const nonExistentProjectId = 'non-existent-project';

      const response = await request(app)
        .get(`/api/submission/${nonExistentProjectId}/public`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SUBMISSION_NOT_FOUND');
    });

    it('should return 404 if project is deleted but submission exists', async () => {
      // Delete the project but keep the submission
      await Project.deleteMany({});

      const response = await request(app)
        .get(`/api/submission/${projectId}/public`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should handle submission with minimal data', async () => {
      // Delete existing submission and create minimal one
      await Submission.deleteMany({});
      
      const minimalSubmissionData = {
        projectId,
        githubUrl: 'https://github.com/team/project'
      };

      const submission = new Submission(minimalSubmissionData);
      await submission.save();

      const response = await request(app)
        .get(`/api/submission/${projectId}/public`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.submission).toMatchObject({
        projectId,
        githubUrl: 'https://github.com/team/project',
        isComplete: false
      });
      expect(response.body.data.submission.presentationUrl).toBeUndefined();
      expect(response.body.data.submission.demoVideoUrl).toBeUndefined();
    });
  });

  describe('URL validation', () => {
    it('should accept valid HTTP URLs', async () => {
      const submissionData = {
        githubUrl: 'http://github.com/team/project',
        presentationUrl: 'http://docs.google.com/presentation/d/123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept valid HTTPS URLs', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid URL formats', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'file:///etc/passwd',
        ''
      ];

      for (const invalidUrl of invalidUrls) {
        const response = await request(app)
          .post(`/api/projects/${projectId}/submission`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ githubUrl: invalidUrl })
          .expect(400);

        expect(response.body.success).toBe(false);
        // Some URLs are caught by Zod validation, others by Mongoose validation
        expect(['VALIDATION_ERROR', 'SUBMISSION_FAILED']).toContain(response.body.error.code);
      }
    });
  });

  describe('Completion status logic', () => {
    it('should mark as complete with GitHub and presentation URLs', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.data.isComplete).toBe(true);
    });

    it('should mark as incomplete with only GitHub URL', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/team/project'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.data.isComplete).toBe(false);
    });

    it('should mark as incomplete with only presentation URL', async () => {
      const submissionData = {
        presentationUrl: 'https://docs.google.com/presentation/d/123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.data.isComplete).toBe(false);
    });

    it('should remain complete when adding demo video to complete submission', async () => {
      // Create complete submission
      const initialData = {
        githubUrl: 'https://github.com/team/project',
        presentationUrl: 'https://docs.google.com/presentation/d/123'
      };

      await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(initialData)
        .expect(200);

      // Add demo video
      const updateData = {
        ...initialData,
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.isComplete).toBe(true);
    });
  });
});