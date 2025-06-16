'use client';

import Link from 'next/link';
import Image from 'next/image';
import CenterListSection from '@/components/CenterListSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-center text-center overflow-hidden">
        {/* Optional: Background globe/animation */}
        <div className="absolute inset-0 z-0 opacity-20">
          {/* You can add a subtle globe animation or background image here */}
        </div>
        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            SRF Global Devotee Map
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Connect with Fellow Devotees Worldwide
          </p>
          <Link href="/map" legacyBehavior>
            <a className="inline-block bg-white text-blue-800 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition duration-300">
              Explore Map
            </a>
          </Link>
        </div>
      </section>

      {/* About / Philosophy Section */}
      <section className="py-16 bg-white text-gray-800">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-8">About SRF / YSS</h2>
          <p className="text-lg mb-6 leading-relaxed">
            Self-Realization Fellowship (SRF) and Yogoda Satsanga Society of India (YSS),
            founded by Paramahansa Yogananda, teach scientific methods of meditation
            that lead to direct personal experience of God.
          </p>
          <blockquote className="italic text-xl text-gray-600 mt-8 border-l-4 border-blue-500 pl-4">
            "Live in the world, but not of the world."
            <footer className="mt-2 text-base font-semibold">— Paramahansa Yogananda, Autobiography of a Yogi</footer>
          </blockquote>
        </div>
      </section>

      {/* Center List Section */}
      <CenterListSection />

      {/* Moments / Highlights Section Link */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Spiritual Moments</h2>
          <p className="text-lg text-gray-700 mb-8">
            Share and view inspiring spiritual moments from devotees around the globe.
          </p>
          <Link href="/moments" legacyBehavior>
            <a className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition duration-300">
              View Moments
            </a>
          </Link>
        </div>
      </section>

      {/* Contact / Join Section */}
      <section className="py-16 bg-white text-gray-800 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg mb-8 leading-relaxed">
            Become a part of the SRF / YSS global family. Add your location to the map
            and connect with fellow devotees, or sign up for our newsletter.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link href="/signin" legacyBehavior>
              <a className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition duration-300">
                Add My Location / Sign In
              </a>
            </Link>
            {/* Future: Newsletter/Volunteer signup */}
            <button className="inline-block bg-gray-200 text-gray-800 hover:bg-gray-300 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition duration-300">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
