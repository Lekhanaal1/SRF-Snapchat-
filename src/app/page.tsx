import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">SRF Convocation</span>
          <span className="block text-blue-600">Global Devotee Map</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Connect with fellow devotees from around the world. Share your spiritual journey and discover the global SRF family.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/map"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Global Map
          </Link>
          <Link
            href="/directory"
            className="rounded-md bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Browse Directory
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Global Connection</h3>
              <p className="mt-2 text-base text-gray-500">
                See devotees from around the world and connect with those in your region.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Spiritual Fellowship</h3>
              <p className="mt-2 text-base text-gray-500">
                Share your spiritual journey and discover others on the path.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Safe & Private</h3>
              <p className="mt-2 text-base text-gray-500">
                Choose what to share. Your privacy and security are our priority.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <blockquote className="text-center">
            <p className="text-xl font-medium text-gray-900">
              &ldquo;We may be separated by geography, but we are one in spirit.&rdquo;
            </p>
            <footer className="mt-4 text-base text-gray-500">
              — Paramahansa Yogananda
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
