import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    console.log('Testing Redis connection...');
    console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL);
    
    // Test Redis connection by setting and getting a value
    const testKey = 'test-connection';
    const testValue = Date.now().toString();
    
    console.log('Setting test value...');
    // Set a test value
    await redis.set(testKey, testValue);
    
    console.log('Getting test value...');
    // Get the test value
    const retrievedValue = await redis.get(testKey);
    
    console.log('Deleting test value...');
    // Delete the test value
    await redis.del(testKey);
    
    console.log('Test completed. Comparing values...');
    console.log('Expected:', testValue);
    console.log('Received:', retrievedValue);
    
    if (retrievedValue === testValue) {
      return NextResponse.json({
        status: 'success',
        message: 'Redis connection is working correctly',
        timestamp: new Date().toISOString(),
        details: {
          testKey,
          testValue,
          retrievedValue
        }
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Redis connection test failed - value mismatch',
        details: {
          expected: testValue,
          received: retrievedValue,
          testKey
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Redis connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 