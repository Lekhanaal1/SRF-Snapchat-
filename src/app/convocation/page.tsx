'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Map from '@/components/Map';
import { centers } from '@/data/centers';

interface CenterStats {
  name: string;
  attendeeCount: number;
  country: string;
}

export default function ConvocationDashboard() {
  const [centerStats, setCenterStats] = useState<CenterStats[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendeeStats = async () => {
      try {
        const devoteesRef = collection(db, 'devotees');
        const q = query(devoteesRef);
        const querySnapshot = await getDocs(q);

        // Count attendees per center
        const stats = centers.map(center => ({
          name: center.name,
          attendeeCount: 0,
          country: center.country
        }));

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const centerIndex = stats.findIndex(s => s.name === data.homeCenter);
          if (centerIndex !== -1) {
            stats[centerIndex].attendeeCount++;
          }
        });

        setCenterStats(stats);
        setTotalAttendees(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching attendee stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendeeStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Global Devotee Map</h2>
              <div className="h-[600px]">
                <Map />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Total Attendees */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Total Attendees</h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : totalAttendees}
              </p>
            </div>

            {/* Center Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Center Statistics</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : (
                  centerStats
                    .sort((a, b) => b.attendeeCount - a.attendeeCount)
                    .map(stat => (
                      <div key={stat.name} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{stat.name}</p>
                          <p className="text-sm text-gray-500">{stat.country}</p>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">
                          {stat.attendeeCount}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Share Your Location
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Share a Moment
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Create Prayer Beacon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 