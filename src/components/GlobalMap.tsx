'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Devotee {
  id: string;
  name: string;
  email: string;
  location: {
    coordinates: [number, number];
  };
  profilePicture?: string;
  center: string;
  status: 'registered' | 'approved' | 'pending' | 'rejected';
}

interface CenterStats {
  [key: string]: {
    total: number;
    registered: number;
    pending: number;
  };
}

export default function GlobalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [centerStats, setCenterStats] = useState<CenterStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Default to US center
      zoom: 3
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Listen for devotee data
    const devoteesRef = collection(db, 'participants');
    const q = query(devoteesRef, where('status', 'in', ['registered', 'approved']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stats: CenterStats = {};
      const newMarkers: { [key: string]: mapboxgl.Marker } = {};

      // Clear existing markers
      Object.values(markers.current).forEach(marker => marker.remove());
      markers.current = {};

      snapshot.docs.forEach(doc => {
        const devotee = { id: doc.id, ...doc.data() } as Devotee;
        
        // Update center statistics
        if (!stats[devotee.center]) {
          stats[devotee.center] = { total: 0, registered: 0, pending: 0 };
        }
        stats[devotee.center].total++;
        if (devotee.status === 'registered') {
          stats[devotee.center].registered++;
        } else {
          stats[devotee.center].pending++;
        }

        // Create marker if location exists
        if (devotee.location?.coordinates) {
          const el = document.createElement('div');
          el.className = 'marker';
          
          // Create marker content
          const markerContent = document.createElement('div');
          markerContent.className = 'relative';
          
          // Add profile picture or default avatar
          const img = document.createElement('img');
          img.src = devotee.profilePicture || '/default-avatar.png';
          img.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg';
          markerContent.appendChild(img);

          // Add name tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 transition-opacity duration-200';
          tooltip.textContent = devotee.name;
          markerContent.appendChild(tooltip);

          // Show tooltip on hover
          markerContent.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
          });
          markerContent.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
          });

          el.appendChild(markerContent);

          // Create and add marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat(devotee.location.coordinates)
            .addTo(map.current!);

          newMarkers[devotee.id] = marker;
        }
      });

      markers.current = newMarkers;
      setCenterStats(stats);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching devotees:', error);
      setError('Failed to load devotee data');
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading map...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center h-96">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Center Statistics */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Center Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(centerStats).map(([center, stats]) => (
            <div key={center} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">{center}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium">{stats.total}</span>
                </p>
                <p className="text-sm text-green-600">
                  Registered: <span className="font-medium">{stats.registered}</span>
                </p>
                <p className="text-sm text-yellow-600">
                  Pending: <span className="font-medium">{stats.pending}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-2">Legend</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Registered</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
} 