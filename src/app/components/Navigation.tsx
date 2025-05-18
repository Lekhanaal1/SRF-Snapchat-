'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapIcon, UserGroupIcon, CameraIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-4 text-gray-900 hover:text-blue-600"
            >
              <span className="text-xl font-semibold">SRF Connect</span>
            </Link>
          </div>

          <div className="flex space-x-8">
            <Link
              href="/map"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/map')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <MapIcon className="h-5 w-5 mr-1" />
              Map
            </Link>

            <Link
              href="/directory"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/directory')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-1" />
              Directory
            </Link>

            <Link
              href="/moments"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/moments')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <CameraIcon className="h-5 w-5 mr-1" />
              Moments
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 