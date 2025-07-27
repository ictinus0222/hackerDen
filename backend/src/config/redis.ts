import { logger } from '../utils/logger.js';

// Redis client interface for type safety
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  disconnect(): Promise<void>;
}

// Mock Redis client for development
class MockRedisClient implements RedisClient {
  private store = new Map<string, { value: string; expires?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires && Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    const expires = options?.EX ? Date.now() + (options.EX * 1000) : undefined;
    this.store.set(key, { value, expires });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async disconnect(): Promise<void> {
    this.store.clear();
  }
}

let redisClient: RedisClient | null = null;

export const connectRedis = async (): Promise<RedisClient> => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!redisUrl || !isProduction) {
    // Use mock Redis client for development
    logger.info('Using mock Redis client for development');
    redisClient = new MockRedisClient();
    return redisClient;
  }

  try {
    // Dynamic import for Redis (only in production)
    let createClient: any;
    try {
      // Use eval to avoid TypeScript checking the import
      const redisModule = await eval('import("redis")');
      createClient = redisModule.createClient;
    } catch (importError) {
      logger.warn('Redis module not available, using mock client');
      redisClient = new MockRedisClient();
      return redisClient;
    }
    
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      },
      // Production optimizations
      ...(isProduction && {
        retry_unfulfilled_commands: true,
        enable_offline_queue: false,
      })
    });

    // Error handling
    client.on('error', (err: Error) => {
      logger.error('Redis client error', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('end', () => {
      logger.info('Redis client disconnected');
    });

    client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    await client.connect();
    
    redisClient = client as unknown as RedisClient;
    logger.info('Redis connected successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error', { 
      error: (error as Error).message,
      stack: (error as Error).stack 
    });
    
    // Fallback to mock client
    logger.info('Falling back to mock Redis client');
    redisClient = new MockRedisClient();
    return redisClient;
  }
};

export const getRedisClient = (): RedisClient | null => {
  return redisClient;
};

// Cache utility functions
export const cacheService = {
  async get(key: string): Promise<string | null> {
    const client = await connectRedis();
    return client.get(key);
  },

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    const client = await connectRedis();
    await client.set(key, value, { EX: ttlSeconds });
  },

  async del(key: string): Promise<void> {
    const client = await connectRedis();
    await client.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const client = await connectRedis();
    const result = await client.exists(key);
    return result === 1;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      logger.info('Redis connection closed through app termination');
    } catch (error) {
      logger.error('Error during Redis disconnection', { error: (error as Error).message });
    }
  }
});