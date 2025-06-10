'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { MapIcon, UserGroupIcon, CameraIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-[var(--srf-gold)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3"
            >
              <Image
                src="/srf-logo.png"
                alt="SRF Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-xl font-serif text-[var(--srf-blue)]">SRF Connect</span>
                <span className="text-xs text-[var(--srf-gold)]">Global Devotee Community</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/map"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/map')
                  ? 'bg-[var(--srf-light-blue)] text-[var(--srf-blue)]'
                  : 'text-gray-600 hover:bg-[var(--srf-light-blue)] hover:text-[var(--srf-blue)]'
              }`}
            >
              <MapIcon className="h-5 w-5 mr-2" />
              Global Map
            </Link>

            <Link
              href="/directory"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/directory')
                  ? 'bg-[var(--srf-light-blue)] text-[var(--srf-blue)]'
                  : 'text-gray-600 hover:bg-[var(--srf-light-blue)] hover:text-[var(--srf-blue)]'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Directory
            </Link>

            <Link
              href="/moments"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/moments')
                  ? 'bg-[var(--srf-light-blue)] text-[var(--srf-blue)]'
                  : 'text-gray-600 hover:bg-[var(--srf-light-blue)] hover:text-[var(--srf-blue)]'
              }`}
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Spiritual Moments
            </Link>

            <Link
              href="/lessons"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/lessons')
                  ? 'bg-[var(--srf-light-blue)] text-[var(--srf-blue)]'
                  : 'text-gray-600 hover:bg-[var(--srf-light-blue)] hover:text-[var(--srf-blue)]'
              }`}
            >
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Lessons
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 