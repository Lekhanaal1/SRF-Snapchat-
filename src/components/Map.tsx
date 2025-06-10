'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDevotees } from '@/hooks/useDevotees';
import type { Devotee } from '@/types/devotee';

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2);
  const { devotees, loading, error } = useDevotees();

  // Initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // wait for map container to be available

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add event listeners
    map.current.on('move', () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom]);

  // Update markers when devotees change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for devotees with coordinates
    devotees.forEach(devotee => {
      if (devotee.coordinates && devotee.shareLocation) {
        const el = document.createElement('div');
        el.className = 'devotee-marker';
        el.innerHTML = `
          <div class="bg-blue-600 text-white px-2 py-1 rounded-full text-sm shadow-lg">
            ${devotee.name}
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([devotee.coordinates.lng, devotee.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${devotee.name}</h3>
                  <p class="text-sm text-gray-600">${devotee.city}, ${devotee.country}</p>
                  ${devotee.profession ? `<p class="text-sm text-gray-600">${devotee.profession}</p>` : ''}
                  ${devotee.favoriteQuote ? `<p class="text-sm italic mt-2">"${devotee.favoriteQuote}"</p>` : ''}
                </div>
              `)
          )
          .addTo(map.current!);

        markers.current.push(marker);
      }
    });
  }, [devotees]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Map</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-md">
          <p className="text-sm text-blue-600">Loading devotees...</p>
        </div>
      )}

      {/* Map controls info */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-md shadow-md">
        <p className="text-sm text-gray-600">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </p>
      </div>

      {/* Add custom styles for markers */}
      <style jsx global>{`
        .devotee-marker {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .devotee-marker:hover {
          transform: scale(1.1);
        }
        .mapboxgl-popup-content {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
} 