import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const momentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  center_id: z.string().uuid()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('center_id')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('convocation_moments')
      .select(`
        *,
        centers (
          name,
          city,
          country
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (centerId) {
      query = query.eq('center_id', centerId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching moments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = momentSchema.parse(body)

    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('convocation_moments')
      .insert({
        ...validatedData,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating moment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 