import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public'
  }
})

// Helper function for real-time subscriptions
export const subscribeToChanges = (
  table: string,
  callback: (payload: any) => void,
  filter?: { event?: 'INSERT' | 'UPDATE' | 'DELETE', schema?: string }
) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: filter?.event || '*',
        schema: filter?.schema || 'public',
        table: table,
      },
      callback
    )
    .subscribe()
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  if (error.code === 'PGRST301') {
    return { error: 'Database connection error' }
  }
  if (error.code === 'PGRST116') {
    return { error: 'Invalid request' }
  }
  return { error: 'An unexpected error occurred' }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Auth error:', error)
    return false
  }
  return !!session
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
} 