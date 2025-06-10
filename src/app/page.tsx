'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Map from '../components/Map';
import MomentCard from '../components/MomentCard';
import UploadMoment from '../components/UploadMoment';
import PrayerBeacon from '../components/PrayerBeacon';
import FilterBar from '../components/FilterBar';

export default function Home() {
  const [momentIds, setMomentIds] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchMoments = async () => {
      let q = collection(db, 'moments');
      
      if (activeFilters.length > 0) {
        q = query(q, where('tags', 'array-contains-any', activeFilters));
      }

      const momentsSnapshot = await getDocs(q);
      const ids = momentsSnapshot.docs.map(doc => doc.id);
      setMomentIds(ids);
    };

    fetchMoments();
  }, [activeFilters]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/srf-logo.png" alt="SRF Logo" className="h-10" />
            <h1 className="text-2xl font-bold">SRF Connect</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Map />
            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-bold">Recent Moments</h2>
              {momentIds.map(id => (
                <MomentCard key={id} momentId={id} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <FilterBar onFilterChange={setActiveFilters} />
          </div>
        </div>
      </main>

      <UploadMoment />
      <PrayerBeacon />
    </div>
  );
}
