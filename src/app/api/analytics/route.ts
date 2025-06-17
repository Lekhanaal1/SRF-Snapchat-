import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('center_id')
    const region = searchParams.get('region')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: isAdmin } = await supabase
      .from('devotees')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!isAdmin?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    let query = supabase
      .from('devotee_analytics')
      .select(`
        *,
        centers (
          name,
          city,
          country
        )
      `)
      .order('date', { ascending: false })

    if (centerId) {
      query = query.eq('center_id', centerId)
    }
    if (region) {
      query = query.eq('region', region)
    }
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 