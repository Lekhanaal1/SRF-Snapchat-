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

// Create Redis client with the correct configuration
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
  automaticDeserialization: true,
}); 