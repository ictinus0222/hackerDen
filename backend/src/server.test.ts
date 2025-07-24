import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { authenticateProject, generateProjectToken } from './middleware/auth.js';

// Create test app similar to main server
const createTestApp = () => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  // Rate limiting
  app.use(createRateLimiter(15 * 60 * 1000, 100));

  // CORS middleware
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      success: true,
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date()
    });
  });

  // Test auth endpoint
  app.get('/test-auth', authenticateProject, (req, res) => {
    res.json({ 
      success: true,
      message: 'Authenticated successfully',
      projectId: (req as any).projectId
    });
  });

  // Test error endpoint
  app.get('/test-error', () => {
    throw new Error('Test error');
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, server, io };
};

describe('Server Setup Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let io: Server;

  beforeAll(() => {
    const testApp = createTestApp();
    app = testApp.app;
    server = testApp.server;
    io = testApp.io;
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Basic Server Setup', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        status: 'OK',
        message: 'Server is running'
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should parse JSON body', async () => {
      // Since we don't have a POST endpoint yet, we'll test this indirectly
      // by ensuring the middleware is set up correctly
      const response = await request(app)
        .post('/nonexistent')
        .send({ test: 'data' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/test-auth')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.'
        }
      });
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/test-auth')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token.'
        }
      });
    });

    it('should accept requests with valid token', async () => {
      const projectId = 'test-project-123';
      const token = generateProjectToken(projectId);

      const response = await request(app)
        .get('/test-auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Authenticated successfully',
        projectId
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route /nonexistent-route not found'
        }
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle server errors', async () => {
      const response = await request(app)
        .get('/test-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      // Make a few requests that should be allowed
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.headers['x-ratelimit-limit']).toBe('100');
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      }
    });

    // Note: Testing rate limit exceeded would require making 100+ requests
    // which is impractical for unit tests. This would be better tested
    // in load testing or with a lower limit in test environment.
  });

  describe('WebSocket Setup', () => {
    it('should handle socket connections', (done) => {
      const port = 3001; // Use different port for test
      server.listen(port, () => {
        const clientSocket = new Client(`http://localhost:${port}`);
        
        clientSocket.on('connect', () => {
          expect(clientSocket.connected).toBe(true);
          clientSocket.disconnect();
          server.close(done);
        });

        clientSocket.on('connect_error', (error: any) => {
          server.close(() => done(error));
        });
      });
    });
  });
});