'use client'

import { useState } from 'react'
import ShareMoment from '../components/ShareMoment'
import MomentFeed from '../components/MomentFeed'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function MomentsPage() {
  const [isSharing, setIsSharing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Spiritual Moments</h1>
            <button
              onClick={() => setIsSharing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Share Moment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSharing ? (
          <div className="mb-8">
            <ShareMoment />
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSharing(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <MomentFeed />
        )}
      </div>
    </div>
  )
} 