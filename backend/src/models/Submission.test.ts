import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { Submission, ISubmission } from './Submission.js';

describe('Submission Model', () => {
  beforeEach(async () => {
    // Clear the collection before each test
    await Submission.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await Submission.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid submission', async () => {
      const submissionData = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo',
        presentationUrl: 'https://slides.com/presentation',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const submission = new Submission(submissionData);
      const savedSubmission = await submission.save();

      expect(savedSubmission.projectId).toBe(submissionData.projectId);
      expect(savedSubmission.githubUrl).toBe(submissionData.githubUrl);
      expect(savedSubmission.presentationUrl).toBe(submissionData.presentationUrl);
      expect(savedSubmission.demoVideoUrl).toBe(submissionData.demoVideoUrl);
      expect(savedSubmission.isComplete).toBe(true); // Auto-calculated
      expect(savedSubmission.createdAt).toBeDefined();
      expect(savedSubmission.updatedAt).toBeDefined();
    });

    it('should create submission with minimal required fields', async () => {
      const submissionData = {
        projectId: 'project-1'
      };

      const submission = new Submission(submissionData);
      const savedSubmission = await submission.save();

      expect(savedSubmission.projectId).toBe(submissionData.projectId);
      expect(savedSubmission.githubUrl).toBeUndefined();
      expect(savedSubmission.presentationUrl).toBeUndefined();
      expect(savedSubmission.demoVideoUrl).toBeUndefined();
      expect(savedSubmission.isComplete).toBe(false); // No required URLs
    });

    it('should require projectId', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/user/repo'
      };

      const submission = new Submission(submissionData);
      
      await expect(submission.save()).rejects.toThrow();
    });

    it('should validate URL formats', async () => {
      const submissionData = {
        projectId: 'project-1',
        githubUrl: 'invalid-url'
      };

      const submission = new Submission(submissionData);
      
      await expect(submission.save()).rejects.toThrow('GitHub URL must be a valid URL');
    });

    it('should validate all URL fields', async () => {
      const urlFields = [
        { field: 'githubUrl', error: 'GitHub URL must be a valid URL' },
        { field: 'presentationUrl', error: 'Presentation URL must be a valid URL' },
        { field: 'demoVideoUrl', error: 'Demo video URL must be a valid URL' },
        { field: 'generatedPageUrl', error: 'Generated page URL must be a valid URL' }
      ];

      for (const { field, error } of urlFields) {
        const submissionData = {
          projectId: 'project-1',
          [field]: 'invalid-url'
        };

        const submission = new Submission(submissionData);
        
        await expect(submission.save()).rejects.toThrow(error);
      }
    });

    it('should accept valid URLs', async () => {
      const validUrls = [
        'https://github.com/user/repo',
        'http://example.com',
        'https://slides.google.com/presentation/123',
        'https://youtube.com/watch?v=abc123'
      ];

      for (const url of validUrls) {
        const submissionData = {
          projectId: `project-${validUrls.indexOf(url)}`,
          githubUrl: url
        };

        const submission = new Submission(submissionData);
        const savedSubmission = await submission.save();
        
        expect(savedSubmission.githubUrl).toBe(url);
      }
    });

    it('should enforce unique project IDs', async () => {
      const submissionData1 = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo1'
      };

      const submissionData2 = {
        projectId: 'project-1', // Same project ID
        githubUrl: 'https://github.com/user/repo2'
      };

      const submission1 = new Submission(submissionData1);
      await submission1.save();

      const submission2 = new Submission(submissionData2);
      await expect(submission2.save()).rejects.toThrow();
    });

    it('should auto-calculate completion status', async () => {
      // Test incomplete submission
      const incompleteData = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo'
        // Missing presentationUrl
      };

      const incompleteSubmission = new Submission(incompleteData);
      await incompleteSubmission.save();
      expect(incompleteSubmission.isComplete).toBe(false);

      // Test complete submission
      const completeData = {
        projectId: 'project-2',
        githubUrl: 'https://github.com/user/repo',
        presentationUrl: 'https://slides.com/presentation'
      };

      const completeSubmission = new Submission(completeData);
      await completeSubmission.save();
      expect(completeSubmission.isComplete).toBe(true);
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate completion status virtual', async () => {
      const submissionData = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo',
        presentationUrl: 'https://slides.com/presentation',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      const submission = new Submission(submissionData);
      await submission.save();

      const completionStatus = submission.completionStatus;
      
      expect(completionStatus.completed).toBe(2); // githubUrl and presentationUrl
      expect(completionStatus.total).toBe(2);
      expect(completionStatus.percentage).toBe(100);
      expect(completionStatus.isComplete).toBe(true);
    });

    it('should calculate partial completion status', async () => {
      const submissionData = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo'
        // Missing presentationUrl
      };

      const submission = new Submission(submissionData);
      await submission.save();

      const completionStatus = submission.completionStatus;
      
      expect(completionStatus.completed).toBe(1);
      expect(completionStatus.total).toBe(2);
      expect(completionStatus.percentage).toBe(50);
      expect(completionStatus.isComplete).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    let submission: ISubmission;

    beforeEach(async () => {
      const submissionData = {
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo'
      };

      submission = new Submission(submissionData);
      await submission.save();
    });

    it('should update URLs', async () => {
      const updates = {
        presentationUrl: 'https://slides.com/presentation',
        demoVideoUrl: 'https://youtube.com/watch?v=123'
      };

      await submission.updateUrls(updates);
      
      expect(submission.presentationUrl).toBe(updates.presentationUrl);
      expect(submission.demoVideoUrl).toBe(updates.demoVideoUrl);
      expect(submission.isComplete).toBe(true); // Should be complete now
    });

    it('should generate public URL', async () => {
      const baseUrl = 'https://app.example.com';
      
      await submission.generatePublicUrl(baseUrl);
      
      expect(submission.generatedPageUrl).toBe(`${baseUrl}/submission/${submission.projectId}/public`);
    });

    it('should not regenerate existing public URL', async () => {
      const baseUrl = 'https://app.example.com';
      const existingUrl = 'https://existing.com/page';
      
      submission.generatedPageUrl = existingUrl;
      await submission.save();
      
      await submission.generatePublicUrl(baseUrl);
      
      expect(submission.generatedPageUrl).toBe(existingUrl);
    });

    it('should get public data', () => {
      const publicData = submission.getPublicData();
      
      expect(publicData).toHaveProperty('projectId');
      expect(publicData).toHaveProperty('githubUrl');
      expect(publicData).toHaveProperty('presentationUrl');
      expect(publicData).toHaveProperty('demoVideoUrl');
      expect(publicData).toHaveProperty('isComplete');
      expect(publicData).toHaveProperty('updatedAt');
      
      // Should not include sensitive fields
      expect(publicData).not.toHaveProperty('_id');
      expect(publicData).not.toHaveProperty('createdAt');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create submissions individually to trigger pre-save middleware
      const submission1 = new Submission({
        projectId: 'project-1',
        githubUrl: 'https://github.com/user/repo1',
        presentationUrl: 'https://slides.com/presentation1'
      });
      await submission1.save();

      const submission2 = new Submission({
        projectId: 'project-2',
        githubUrl: 'https://github.com/user/repo2'
        // Missing presentationUrl - incomplete
      });
      await submission2.save();

      const submission3 = new Submission({
        projectId: 'project-3',
        githubUrl: 'https://github.com/user/repo3',
        presentationUrl: 'https://slides.com/presentation3'
      });
      await submission3.save();
    });

    it('should find submission by project ID', async () => {
      const submission = await Submission.findByProjectId('project-1');
      
      expect(submission).toBeDefined();
      expect(submission?.githubUrl).toBe('https://github.com/user/repo1');
    });

    it('should return null for non-existent project', async () => {
      const submission = await Submission.findByProjectId('non-existent');
      
      expect(submission).toBeNull();
    });

    it('should find completed submissions', async () => {
      const completed = await Submission.findCompleted();
      
      expect(completed).toHaveLength(2);
      completed.forEach(submission => {
        expect(submission.isComplete).toBe(true);
      });
    });

    it('should find incomplete submissions', async () => {
      const incomplete = await Submission.findIncomplete();
      
      expect(incomplete).toHaveLength(1);
      expect(incomplete[0].projectId).toBe('project-2');
      expect(incomplete[0].isComplete).toBe(false);
    });

    it('should create new submission', async () => {
      const submissionData = {
        githubUrl: 'https://github.com/user/new-repo',
        presentationUrl: 'https://slides.com/new-presentation'
      };

      const submission = await Submission.createOrUpdate('project-4', submissionData);
      
      expect(submission.projectId).toBe('project-4');
      expect(submission.githubUrl).toBe(submissionData.githubUrl);
      expect(submission.isComplete).toBe(true);
    });

    it('should update existing submission', async () => {
      const updateData = {
        presentationUrl: 'https://slides.com/updated-presentation',
        demoVideoUrl: 'https://youtube.com/watch?v=updated'
      };

      const submission = await Submission.createOrUpdate('project-2', updateData);
      
      expect(submission.projectId).toBe('project-2');
      expect(submission.presentationUrl).toBe(updateData.presentationUrl);
      expect(submission.demoVideoUrl).toBe(updateData.demoVideoUrl);
      expect(submission.isComplete).toBe(true); // Should be complete now
    });
  });
});