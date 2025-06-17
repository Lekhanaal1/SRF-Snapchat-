import { PrismaClient } from '@prisma/client'
import { redis } from './redis'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Cache TTL in seconds
const CACHE_TTL = 60 * 5 // 5 minutes

export const db = {
  // Get all participants with pagination and caching
  async getParticipants(page = 1, limit = 20) {
    const cacheKey = `participants:${page}:${limit}`
    
    // Try to get from cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // If not in cache, get from database
    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.participant.count()
    ])

    const result = {
      participants,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL })
    
    return result
  },

  // Get participant by ID with caching
  async getParticipantById(id: string) {
    const cacheKey = `participant:${id}`
    
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    const participant = await prisma.participant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        status: true,
        createdAt: true
      }
    })

    if (participant) {
      await redis.set(cacheKey, JSON.stringify(participant), { ex: CACHE_TTL })
    }

    return participant
  },

  // Create participant with cache invalidation
  async createParticipant(data: any) {
    const participant = await prisma.participant.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        status: true,
        createdAt: true
      }
    })

    // Invalidate relevant caches
    await Promise.all([
      redis.del('participants:1:20'), // Invalidate first page
      redis.del(`participant:${participant.id}`)
    ])

    return participant
  },

  // Update participant with cache invalidation
  async updateParticipant(id: string, data: any) {
    const participant = await prisma.participant.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        status: true,
        createdAt: true
      }
    })

    // Invalidate relevant caches
    await Promise.all([
      redis.del('participants:1:20'), // Invalidate first page
      redis.del(`participant:${id}`)
    ])

    return participant
  }
} 