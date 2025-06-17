import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache } from '@/lib/redis'
import { z } from 'zod'

// Input validation schema
const participantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const result = await db.getParticipants(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = participantSchema.parse(body)

    // Create participant
    const participant = await db.createParticipant({
      ...validatedData,
      status: validatedData.status || 'pending'
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing participant ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = participantSchema.parse(body)

    const participant = await db.updateParticipant(id, validatedData)
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(participant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 