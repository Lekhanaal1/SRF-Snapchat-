'use client';

import { useEffect, useState } from 'react';
import GlobalMap from '@/components/GlobalMap';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function GlobalMapPage() {
  const [totalDevotees, setTotalDevotees] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalDevotees = async () => {
      try {
        const devoteesRef = collection(db, 'participants');
        const q = query(devoteesRef, where('status', 'in', ['registered', 'approved']));
        const snapshot = await getDocs(q);
        setTotalDevotees(snapshot.size);
      } catch (error) {
        console.error('Error fetching total devotees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDevotees();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Global Devotee Map</h1>
        <p className="mt-2 text-gray-600">
          {loading ? 'Loading...' : `Total Registered Devotees: ${totalDevotees}`}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <GlobalMap />
      </div>
    </div>
  );
} 