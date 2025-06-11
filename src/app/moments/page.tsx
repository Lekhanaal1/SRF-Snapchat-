'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import MomentsFeed from '@/components/MomentsFeed'
import ShareMoment from '@/components/ShareMoment'
import Modal from '@/components/Modal'

export default function MomentsPage() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Spiritual Moments</h1>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Share Moment
        </button>
      </div>

      <MomentsFeed />

      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Your Spiritual Moment"
      >
        <ShareMoment />
      </Modal>
    </div>
  )
} 