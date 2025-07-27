import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-management';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Production-optimized connection options
    const connectionOptions: mongoose.ConnectOptions = {
      // Connection pool settings
      maxPoolSize: isProduction ? 10 : 5, // Maximum number of connections
      minPoolSize: isProduction ? 2 : 1,  // Minimum number of connections
      maxIdleTimeMS: 30000,               // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000,     // How long to try selecting a server
      socketTimeoutMS: 45000,             // How long a send or receive on a socket can take
      
      // Buffering settings
      // bufferMaxEntries: 0,                // Disable mongoose buffering (deprecated)
      bufferCommands: false,              // Disable mongoose buffering
      
      // Retry settings
      retryWrites: true,                  // Enable retryable writes
      retryReads: true,                   // Enable retryable reads
      
      // Heartbeat settings
      heartbeatFrequencyMS: 10000,        // How often to check server status
      
      // Additional production settings
      ...(isProduction && {
        // Enable compression for production
        compressors: ['zlib'],
        zlibCompressionLevel: 6,
        
        // SSL/TLS settings for Atlas
        ssl: true,
        sslValidate: true,
      })
    };
    
    await mongoose.connect(mongoURI, connectionOptions);
    
    logger.info('MongoDB connected successfully', {
      environment: process.env.NODE_ENV,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    });
  } catch (error) {
    logger.error('MongoDB connection error', { 
      error: (error as Error).message,
      stack: (error as Error).stack 
    });
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB', {
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name
  });
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error during MongoDB disconnection', { error: (error as Error).message });
    process.exit(1);
  }
});