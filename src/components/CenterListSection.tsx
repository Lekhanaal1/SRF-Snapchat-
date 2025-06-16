'use client';

import { centers } from '@/data/centers';
import Link from 'next/link';

export default function CenterListSection() {
  return (
    <section className="py-16 bg-gray-100 text-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">SRF / YSS Centers Worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {centers.map((center) => (
            <div key={center.name} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">{center.name}</h3>
              <p className="text-gray-600 mb-3">
                {center.country}
              </p>
              <div className="mt-auto">
                <Link href={`/map?center=${center.coords[0]},${center.coords[1]}`} legacyBehavior>
                  <a className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-medium transition duration-300">
                    Show on Map
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 