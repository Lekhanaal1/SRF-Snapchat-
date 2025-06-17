import { Redis } from '@upstash/redis';

// Get Redis configuration from environment variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Log configuration status (without sensitive data)
console.log('Redis URL configured:', !!redisUrl);
console.log('Redis Token configured:', !!redisToken);

if (!redisUrl || !redisToken) {
  console.error('Redis configuration missing. Please check your .env.local file.');
  throw new Error('Missing Redis environment variables');
}

// Create Redis client with enhanced configuration
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
  automaticDeserialization: true,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000),
  },
});

// Cache helper functions
export const cache = {
  // Get cached data with type safety
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<string>(key);
      return data ? JSON.parse(data) as T : null;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  },

  // Set cached data with expiration
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  },

  // Delete cached data
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
    }
  },

  // Delete multiple cached keys
  async delMultiple(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => redis.del(key)));
    } catch (error) {
      console.error('Error deleting multiple cache keys:', error);
    }
  },

  // Clear all cache (use with caution)
  async clearAll(): Promise<void> {
    try {
      const keys = await redis.keys('*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redis.del(key)));
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}; 