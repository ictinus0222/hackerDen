import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Environment validation schema
const environmentSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default(3000),
  
  // Database Configuration
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  
  // Frontend Configuration
  FRONTEND_URL: z.string().url('Frontend URL must be a valid URL'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Redis Configuration (optional)
  REDIS_URL: z.string().optional(),
  
  // Security Configuration
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters').optional(),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Optional: Error Tracking
  SENTRY_DSN: z.string().url().optional(),
  
  // Optional: Analytics
  ANALYTICS_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

// Validate and parse environment variables
export const validateEnvironment = (): Environment => {
  try {
    const env = environmentSchema.parse(process.env);
    
    // Additional production validations
    if (env.NODE_ENV === 'production') {
      // Ensure production secrets are strong
      if (env.JWT_SECRET.length < 64) {
        logger.warn('JWT secret should be at least 64 characters in production');
      }
      
      // Ensure MongoDB URI is for Atlas in production
      if (!env.MONGODB_URI.includes('mongodb+srv://')) {
        logger.warn('Consider using MongoDB Atlas (mongodb+srv://) for production');
      }
      
      // Ensure HTTPS frontend URL in production
      if (!env.FRONTEND_URL.startsWith('https://')) {
        logger.warn('Frontend URL should use HTTPS in production');
      }
    }
    
    logger.info('Environment validation successful', {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      hasRedis: !!env.REDIS_URL,
      hasSentry: !!env.SENTRY_DSN,
      logLevel: env.LOG_LEVEL
    });
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment validation failed', {
        errors: (error as any).errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
          received: err.input
        }))
      });
      
      // Provide helpful error messages
      const missingVars = (error as any).errors
        .filter((err: any) => err.code === 'invalid_type' && err.received === 'undefined')
        .map((err: any) => err.path.join('.'));
      
      if (missingVars.length > 0) {
        logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        logger.error('Please check your .env file and ensure all required variables are set');
      }
    }
    
    throw new Error('Environment validation failed. Please check your environment variables.');
  }
};

// Export validated environment
export const env = validateEnvironment();

// Environment-specific configurations
export const config = {
  // Database configuration
  database: {
    uri: env.MONGODB_URI,
    options: {
      maxPoolSize: env.NODE_ENV === 'production' ? 10 : 5,
      minPoolSize: env.NODE_ENV === 'production' ? 2 : 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // JWT configuration
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256' as const,
  },
  
  // CORS configuration
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
    max: env.NODE_ENV === 'production' ? 100 : 1000, // More restrictive in production
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Socket.io configuration
  socket: {
    cors: {
      origin: env.NODE_ENV === 'production' 
        ? env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:4173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket' as const, 'polling' as const],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6, // 1MB
  },
  
  // Security configuration
  security: {
    sessionSecret: env.SESSION_SECRET || env.JWT_SECRET,
    bcryptRounds: env.NODE_ENV === 'production' ? 12 : 10,
    csrfProtection: env.NODE_ENV === 'production',
    helmetOptions: {
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    }
  },
  
  // Logging configuration
  logging: {
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? 'json' : 'simple',
    enableConsole: true,
    enableFile: env.NODE_ENV === 'production',
  },
  
  // Cache configuration
  cache: {
    redis: {
      url: env.REDIS_URL,
      enabled: !!env.REDIS_URL && env.NODE_ENV === 'production',
      ttl: 3600, // 1 hour default TTL
    }
  },
  
  // Monitoring configuration
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN,
      enabled: !!env.SENTRY_DSN && env.NODE_ENV === 'production',
      environment: env.NODE_ENV,
    },
    analytics: {
      key: env.ANALYTICS_KEY,
      enabled: !!env.ANALYTICS_KEY,
    }
  }
};

// Helper function to check if we're in production
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';