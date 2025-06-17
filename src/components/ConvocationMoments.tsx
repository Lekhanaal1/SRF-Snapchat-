import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import Image from 'next/image'
import { MapPin, Calendar } from 'lucide-react'

type Moment = Database['public']['Tables']['convocation_moments']['Row'] & {
  centers: {
    name: string
    city: string
    country: string
  }
}

export default function ConvocationMoments() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchMoments()

    // Set up real-time subscription
    const subscription = supabase
      .channel('convocation_moments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'convocation_moments'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMoments((prev) => [payload.new as Moment, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setMoments((prev) =>
              prev.filter((moment) => moment.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setMoments((prev) =>
              prev.map((moment) =>
                moment.id === payload.new.id ? (payload.new as Moment) : moment
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchMoments = async () => {
    try {
      const { data, error } = await supabase
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
        .limit(20)

      if (error) throw error

      setMoments(data)
    } catch (err) {
      setError('Failed to load moments')
      console.error('Error fetching moments:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {moments.map((moment) => (
        <div
          key={moment.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {moment.image_url && (
            <div className="relative h-48">
              <Image
                src={moment.image_url}
                alt={moment.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{moment.title}</h3>
            {moment.description && (
              <p className="text-gray-600 mb-4">{moment.description}</p>
            )}
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {moment.centers.name}, {moment.centers.city}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(moment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 