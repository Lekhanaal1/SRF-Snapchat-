'use client'

import { useState, useEffect } from 'react'
import { prayerService } from '@/services/prayerService'
import { PrayerRequest, PrayerRequestFormData } from '@/types/prayer'
import { useAuth } from '@/hooks/useAuth'

export default function PrayerRequests() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadPrayerRequests()
  }, [])

  const loadPrayerRequests = async () => {
    try {
      setLoading(true)
      const requests = await prayerService.getActivePrayerRequests()
      setPrayerRequests(requests)
      setError(null)
    } catch (err) {
      setError('Failed to load prayer requests')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPrayerRequest = async (data: PrayerRequestFormData) => {
    if (!user) {
      setError('Please sign in to submit a prayer request')
      return
    }

    try {
      await prayerService.addPrayerRequest(data, user.uid, user.displayName || 'Anonymous')
      await loadPrayerRequests()
    } catch (err) {
      setError('Failed to submit prayer request')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Prayer Requests</h2>
      
      {/* Prayer Request Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-medium mb-4">Submit a Prayer Request</h3>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          handleSubmitPrayerRequest({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            isAnonymous: formData.get('isAnonymous') === 'true'
          })
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAnonymous"
                id="isAnonymous"
                value="true"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                Submit anonymously
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Prayer Request
            </button>
          </div>
        </form>
      </div>

      {/* Prayer Requests List */}
      <div className="space-y-6">
        {prayerRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-medium">{request.title}</h3>
              <span className="text-sm text-gray-500">
                {request.isAnonymous ? 'Anonymous' : request.requesterName}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{request.description}</p>
            <div className="text-sm text-gray-500">
              {new Date(request.createdAt.toDate()).toLocaleDateString()}
            </div>
          </div>
        ))}

        {prayerRequests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No prayer requests yet. Be the first to submit one!
          </div>
        )}
      </div>
    </div>
  )
} 