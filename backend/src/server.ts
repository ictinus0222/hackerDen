import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/errorHandler.js';
import { rateLimiters, createWebSocketRateLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput, validateContentType, validateRequestSize } from './middleware/validation.js';
import { logger, requestLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Request logging middleware
app.use(requestLogger);

// Security middleware
app.use(validateContentType);
app.use(validateRequestSize(5 * 1024 * 1024)); // 5MB limit

// Rate limiting
app.use(rateLimiters.general);

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

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

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
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
    await connectDB();
    
    // Apply WebSocket rate limiting
    io.use(wsRateLimiter);
    
    // Initialize socket service after database connection
    socketService = new SocketService(io);
    
    // Set socket service references in routes
    setProjectSocketService(() => socketService);
    setTaskSocketService(() => socketService);
    setSubmissionSocketService(() => socketService);
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
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