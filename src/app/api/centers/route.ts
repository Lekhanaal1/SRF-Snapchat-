import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const centerSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const country = searchParams.get('country')

    let query = supabase
      .from('centers')
      .select('*')
      .order('name')

    if (region) {
      query = query.eq('region', region)
    }
    if (country) {
      query = query.eq('country', country)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching centers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = centerSchema.parse(body)

    const { data, error } = await supabase
      .from('centers')
      .insert(validatedData)
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

    console.error('Error creating center:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 