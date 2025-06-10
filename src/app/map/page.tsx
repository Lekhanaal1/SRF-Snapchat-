'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { useDevotees } from '@/hooks/useDevotees'
import Modal from '@/components/Modal'
import DevoteeForm from '@/components/DevoteeForm'
import type { Devotee } from '@/types/devotee'

// Dynamically import the Map component to avoid SSR issues with Mapbox
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
})

export default function MapPage() {
  const { user } = useAuth()
  const { addDevotee } = useDevotees()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Initialize any necessary data here
    setIsLoading(false)
  }, [])

  const handleAddDevotee = async (data: Omit<Devotee, 'id' | 'createdAt' | 'updatedAt' | 'coordinates'>) => {
    try {
      await addDevotee(data)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding devotee:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      <Map />
      
      {/* Add Devotee Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Your Location
      </button>

      {/* Add Devotee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Your Location to the Map"
      >
        <DevoteeForm
          onSubmit={handleAddDevotee}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
} 