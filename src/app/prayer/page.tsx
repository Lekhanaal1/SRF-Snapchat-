import PrayerRequests from '@/components/PrayerRequests'

export default function PrayerPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prayer Requests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your prayer requests with the SRF community. Together, we can support each other in our spiritual journey.
          </p>
        </div>
        
        <PrayerRequests />
      </div>
    </main>
  )
} 