'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Temporary mock data - will be replaced with Firebase data
const mockDevotees = [
  {
    id: 1,
    name: 'Lekhana',
    location: 'Bangalore, India',
    lessonRange: '56',
    profession: 'Engineering Student',
    favoriteQuote: 'Blue Lotus Feet is my favorite chant!',
  },
  // Add more mock data as needed
]

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredDevotees = mockDevotees.filter(devotee => {
    const matchesSearch = devotee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         devotee.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         devotee.profession.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'students') return matchesSearch && devotee.profession.toLowerCase().includes('student')
    if (selectedFilter === 'kriyabans') return matchesSearch && parseInt(devotee.lessonRange) >= 60
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Devotee Directory</h1>
          <p className="mt-2 text-sm text-gray-500">
            Connect with fellow devotees from around the world
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name, location, or profession..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Devotees</option>
            <option value="students">Students</option>
            <option value="kriyabans">Kriyabans</option>
          </select>
        </div>

        {/* Devotee Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDevotees.map((devotee) => (
            <div
              key={devotee.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{devotee.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{devotee.location}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Lesson Range:</span> {devotee.lessonRange}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Profession:</span> {devotee.profession}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    &ldquo;{devotee.favoriteQuote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDevotees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No devotees found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 