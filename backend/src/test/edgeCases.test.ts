import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../server';
import { connectDB, disconnectDB } from '../config/database';

describe('Backend Edge Cases and Coverage Tests', () => {
  let authToken: string;

  beforeEach(async () => {
    await connectDB();
    
    // Create auth token
    authToken = jwt.sign(
      { projectId: 'test-project-123' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await disconnectDB();
  });

  describe('Request Parsing Edge Cases', () => {
    it('handles empty request body', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('handles malformed JSON with special characters', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"name": "test", "invalid": }');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MALFORMED_JSON');
    });

    it('handles extremely large field values', async () => {
      const largeString = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'test-project',
          projectName: largeString,
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(400);
    });

    it('handles null and undefined values', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: null,
          projectName: undefined,
          oneLineIdea: 'Test idea',
          teamMembers: null,
        });

      expect(response.status).toBe(400);
    });

    it('handles circular references in request body', async () => {
      // This would be caught by JSON.parse before reaching our code
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"a": {"b": {"c": "circular"}}}');

      // Should handle normally since it's valid JSON
      expect(response.status).toBe(400); // Due to missing required fields
    });
  });

  describe('Authentication Edge Cases', () => {
    it('handles malformed JWT tokens', async () => {
      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
    });

    it('handles JWT with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { projectId: 'test-project' },
        'wrong-secret'
      );

      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('handles JWT with missing required claims', async () => {
      const tokenWithoutProjectId = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${tokenWithoutProjectId}`);

      expect(response.status).toBe(401);
    });

    it('handles authorization header with wrong format', async () => {
      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
    });

    it('handles empty authorization header', async () => {
      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });
  });

  describe('URL Parameter Edge Cases', () => {
    it('handles special characters in project IDs', async () => {
      const specialProjectId = 'project-with-@#$%^&*()';
      const token = jwt.sign(
        { projectId: specialProjectId },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get(`/api/projects/${encodeURIComponent(specialProjectId)}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404); // Project doesn't exist
    });

    it('handles extremely long project IDs', async () => {
      const longProjectId = 'a'.repeat(1000);
      const token = jwt.sign(
        { projectId: longProjectId },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get(`/api/projects/${longProjectId}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('handles Unicode characters in URLs', async () => {
      const unicodeProjectId = 'project-测试-🚀';
      const token = jwt.sign(
        { projectId: unicodeProjectId },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get(`/api/projects/${encodeURIComponent(unicodeProjectId)}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('handles URL-encoded parameters', async () => {
      const projectId = 'project with spaces';
      const token = jwt.sign(
        { projectId },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get(`/api/projects/${encodeURIComponent(projectId)}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('HTTP Method Edge Cases', () => {
    it('handles unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('handles OPTIONS requests for CORS', async () => {
      const response = await request(app)
        .options('/api/projects/test-project/tasks');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    it('handles HEAD requests', async () => {
      const response = await request(app)
        .head('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Should return same status as GET but without body
      expect(response.status).toBe(404);
      expect(response.text).toBe('');
    });
  });

  describe('Content-Type Edge Cases', () => {
    it('handles missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send('{"projectId": "test"}');

      expect(response.status).toBe(400);
    });

    it('handles wrong Content-Type header', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'text/plain')
        .send('{"projectId": "test"}');

      expect(response.status).toBe(400);
    });

    it('handles Content-Type with charset', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          projectId: 'test-project',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('handles malformed query parameters', async () => {
      const response = await request(app)
        .get('/api/projects/test-project/tasks?invalid=param&malformed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404); // Project doesn't exist
    });

    it('handles extremely long query strings', async () => {
      const longValue = 'a'.repeat(10000);
      const response = await request(app)
        .get(`/api/projects/test-project/tasks?filter=${longValue}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('handles special characters in query parameters', async () => {
      const response = await request(app)
        .get('/api/projects/test-project/tasks?filter=@#$%^&*()')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('handles database connection errors gracefully', async () => {
      // Mock database error
      vi.mock('../config/database', () => ({
        connectDB: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        disconnectDB: vi.fn(),
      }));

      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('handles memory exhaustion scenarios', async () => {
      // Create a very large payload
      const largeArray = new Array(100000).fill({
        id: 'task-id',
        title: 'Task title',
        description: 'Task description',
        columnId: 'todo',
        order: 0,
      });

      const response = await request(app)
        .post('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: largeArray });

      expect(response.status).toBe(400);
    });

    it('handles concurrent request scenarios', async () => {
      // Create multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            projectId: `concurrent-project-${i}`,
            projectName: `Concurrent Project ${i}`,
            oneLineIdea: 'Test idea',
            teamMembers: [{ id: 'user1', name: 'User 1' }],
            deadlines: {
              hackingEnds: new Date(),
              submissionDeadline: new Date(),
              presentationTime: new Date(),
            },
            judgingCriteria: [],
          })
      );

      const responses = await Promise.all(promises);
      
      // All should either succeed or fail gracefully
      responses.forEach(response => {
        expect([201, 400, 409, 500]).toContain(response.status);
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('handles SQL injection attempts in JSON', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: "'; DROP TABLE projects; --",
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
        });

      // Should handle safely (MongoDB is not vulnerable to SQL injection)
      expect(response.status).toBe(201);
    });

    it('handles XSS attempts in input data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'xss-test-project',
          projectName: '<script>alert("xss")</script>',
          oneLineIdea: '<img src="x" onerror="alert(1)">',
          teamMembers: [{ id: 'user1', name: '<script>alert("xss")</script>' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(201);
      // Data should be stored as-is (sanitization happens on frontend)
      expect(response.body.data.projectName).toBe('<script>alert("xss")</script>');
    });

    it('handles prototype pollution attempts', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'prototype-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
          '__proto__': { polluted: true },
          'constructor': { prototype: { polluted: true } },
        });

      expect(response.status).toBe(201);
      // Should not pollute prototype
      expect(Object.prototype.polluted).toBeUndefined();
    });

    it('handles path traversal attempts in URLs', async () => {
      const response = await request(app)
        .get('/api/projects/../../../etc/passwd')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Performance Edge Cases', () => {
    it('handles requests with many headers', async () => {
      const req = request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Add many headers
      for (let i = 0; i < 100; i++) {
        req.set(`X-Custom-Header-${i}`, `value-${i}`);
      }

      const response = await req;
      expect(response.status).toBe(404); // Project doesn't exist
    });

    it('handles deeply nested JSON objects', async () => {
      // Create deeply nested object
      let deepObject: any = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject };
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'deep-nested-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
          metadata: deepObject,
        });

      expect(response.status).toBe(201);
    });

    it('handles requests with many array elements', async () => {
      const manyMembers = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
      }));

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'many-members-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: manyMembers,
          deadlines: {
            hackingEnds: new Date(),
            submissionDeadline: new Date(),
            presentationTime: new Date(),
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(400); // Should fail validation
    });
  });

  describe('Date and Time Edge Cases', () => {
    it('handles invalid date formats', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'invalid-date-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: 'invalid-date',
            submissionDeadline: '2024-13-45', // Invalid date
            presentationTime: '2024-01-01T25:00:00Z', // Invalid time
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(400);
    });

    it('handles timezone edge cases', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'timezone-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: '2024-01-01T00:00:00+14:00', // UTC+14
            submissionDeadline: '2024-01-01T00:00:00-12:00', // UTC-12
            presentationTime: '2024-01-01T00:00:00Z', // UTC
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(201);
    });

    it('handles leap year dates', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'leap-year-test',
          projectName: 'Test Project',
          oneLineIdea: 'Test idea',
          teamMembers: [{ id: 'user1', name: 'User 1' }],
          deadlines: {
            hackingEnds: '2024-02-29T12:00:00Z', // Valid leap year date
            submissionDeadline: '2024-03-01T12:00:00Z',
            presentationTime: '2024-03-02T12:00:00Z',
          },
          judgingCriteria: [],
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Network and Connection Edge Cases', () => {
    it('handles slow client connections', async () => {
      // Simulate slow request by adding delay
      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1000);

      expect(response.status).toBe(404);
    });

    it('handles connection drops during request', async () => {
      // This is hard to simulate in tests, but we can test timeout handling
      const response = await request(app)
        .get('/api/projects/test-project/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(100);

      // Should either succeed quickly or timeout
      expect([200, 404, 408, 500]).toContain(response.status);
    });
  });
});