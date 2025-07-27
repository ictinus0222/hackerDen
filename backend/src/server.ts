import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { config, env, isProduction } from './config/environment.js';
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/errorHandler.js';
import { rateLimiters, createWebSocketRateLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput, validateContentType, validateRequestSize } from './middleware/validation.js';
import { logger, requestLogger } from './utils/logger.js';
import monitoring from './config/monitoring.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are loaded in environment.ts

const app = express();
const server = createServer(app);

// Production-ready Socket.io configuration using environment config
const io = new Server(server, config.socket);

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// Production security configurations
if (isProduction()) {
  // Trust proxy for accurate IP addresses (required for Heroku, Railway, etc.)
  app.set('trust proxy', 1);
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
} else {
  app.set('trust proxy', 1);
}

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Request logging middleware
app.use(requestLogger);

// Security middleware
app.use(validateContentType);
app.use(validateRequestSize(5 * 1024 * 1024)); // 5MB limit

// Rate limiting using environment config
if (isProduction()) {
  app.use(rateLimiters.general);
} else {
  // More lenient rate limiting for development
  app.use((req, res, next) => next());
}

// CORS middleware with environment-specific origins
app.use(cors(config.cors));

// Body parsing middleware with error handling
app.use(express.json({ 
  limit: '5mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      const error = new Error('Invalid JSON');
      (error as any).statusCode = 400;
      (error as any).code = 'MALFORMED_JSON';
      throw error;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Input sanitization
app.use(sanitizeInput);

// Initialize monitoring
monitoring.initialize();

// Performance monitoring middleware
app.use(monitoring.performanceMiddleware);

// Health check endpoint
app.get('/health', async (_req, res) => {
  const startTime = Date.now();
  const health: any = {
    success: true,
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    database: { status: 'unknown' },
    redis: { status: 'unknown' },
    memory: process.memoryUsage(),
    responseTime: 0
  };

  try {
    // Import mongoose dynamically to check connection
    const { default: mongoose } = await import('mongoose');
    
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.database = { status: 'connected', name: mongoose.connection.name || 'unknown' };
    } else {
      health.database = { status: 'disconnected' };
      health.success = false;
      health.status = 'DEGRADED';
    }

    // Check Redis connection if available
    try {
      const redisModule = await import('./config/redis.js');
      const redis = redisModule.getRedisClient ? redisModule.getRedisClient() : null;
      if (redis) {
        // Test Redis connection by trying to get a key
        await redis.exists('health-check');
        health.redis = { status: 'connected' };
      } else {
        health.redis = { status: 'not_configured' };
      }
    } catch (redisError: any) {
      health.redis = { status: 'disconnected', error: redisError?.message || 'Unknown error' };
      // Redis is optional, don't fail health check
    }

  } catch (error: any) {
    health.success = false;
    health.status = 'ERROR';
    health.message = error?.message || 'Unknown error';
  }

  health.responseTime = Date.now() - startTime;
  
  const statusCode = health.success ? 200 : 503;
  res.status(statusCode).json(health);
});

// Import and use routes
import projectRoutes, { setSocketService as setProjectSocketService } from './routes/projects.js';
import taskRoutes, { setSocketService as setTaskSocketService } from './routes/tasks.js';
import submissionRoutes, { setSocketService as setSubmissionSocketService } from './routes/submissions.js';

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', submissionRoutes);
app.use('/api/submission', submissionRoutes);

// Serve static files in production
if (isProduction()) {
  // Serve static files from the React app build directory
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
  }));
  
  // Handle React Router - send all non-API requests to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'NOT_FOUND', 
          message: 'API endpoint not found' 
        } 
      });
    }
    
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket.io service
import { SocketService } from './services/socketService.js';
let socketService: SocketService;

// WebSocket rate limiting
const wsRateLimiter = createWebSocketRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // 60 events per minute per connection
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Connect to Redis (optional, will fallback to mock if not available)
    if (config.cache.redis.enabled) {
      try {
        await connectRedis();
        logger.info('Redis connected successfully');
      } catch (error) {
        logger.warn('Redis connection failed, using mock client', { error: (error as Error).message });
      }
    }
    
    // Apply WebSocket rate limiting
    io.use(wsRateLimiter);
    
    // Initialize socket service after database connection
    socketService = new SocketService(io);
    
    // Set socket service references in routes
    setProjectSocketService(() => socketService);
    setTaskSocketService(() => socketService);
    setSubmissionSocketService(() => socketService);
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        import('mongoose').then(mongoose => {
          mongoose.default.connection.close().then(() => {
            logger.info('Database connection closed');
            process.exit(0);
          });
        });
      });
      
      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });
    
    const host = isProduction() ? '0.0.0.0' : 'localhost';
    
    server.listen(PORT, host, () => {
      logger.info(`Server running in ${NODE_ENV} mode on ${host}:${PORT}`);
      logger.info(`Health check: http://${host}:${PORT}/health`);
      
      if (isProduction()) {
        logger.info('Production optimizations enabled');
        logger.info('Serving static files from frontend/dist');
        logger.info('Redis caching enabled:', config.cache.redis.enabled);
      }
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message, stack: (error as Error).stack });
    process.exit(1);
  }
};

// Export app for testing
export { app, server, io, socketService };

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}