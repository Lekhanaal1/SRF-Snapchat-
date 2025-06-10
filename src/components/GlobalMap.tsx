import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DevoteeProfile, MapBounds } from '@/types/devotee';
import { devoteeService } from '@/services/devoteeService';
import { Popup } from 'mapbox-gl';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface GlobalMapProps {
  onDevoteeClick?: (devotee: DevoteeProfile) => void;
  filters?: {
    country?: string;
    profession?: string;
  };
}

export default function GlobalMap({ onDevoteeClick, filters }: GlobalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [devotees, setDevotees] = useState<DevoteeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle map movement
    map.current.on('moveend', () => {
      if (!map.current) return;

      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const currentBounds = map.current.getBounds();
      
      // Only fetch nearby devotees if zoomed in enough
      if (zoom >= 3 && currentBounds) {
        setBounds({
          north: currentBounds.getNorth(),
          south: currentBounds.getSouth(),
          east: currentBounds.getEast(),
          west: currentBounds.getWest()
        });

        // Calculate radius based on zoom level (roughly)
        const radius = Math.pow(2, 15 - zoom) * 10; // km

        // Fetch nearby devotees
        fetchNearbyDevotees(center.lng, center.lat, radius);
      } else {
        // Clear markers if zoomed out too far
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        setDevotees([]);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch nearby devotees
  const fetchNearbyDevotees = async (lng: number, lat: number, radius: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lng: lng.toString(),
        lat: lat.toString(),
        radius: radius.toString(),
        limit: '100'
      });

      if (filters?.country) {
        params.append('country', filters.country);
      }
      if (filters?.profession) {
        params.append('profession', filters.profession);
      }

      const response = await fetch(`/api/devotees/nearby?${params}`);
      if (!response.ok) throw new Error('Failed to fetch nearby devotees');
      
      const data = await response.json();
      setDevotees(data);
    } catch (error) {
      console.error('Error fetching nearby devotees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update markers when devotees change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    devotees.forEach(devotee => {
      const el = document.createElement('div');
      el.className = 'devotee-marker';
      el.innerHTML = `
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(devotee.location.coordinates)
        .addTo(map.current!);

      // Create popup with distance if available
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold">${devotee.firstName}${devotee.spiritualName ? ` (${devotee.spiritualName})` : ''}</h3>
          <p class="text-sm text-gray-600">${devotee.city}, ${devotee.country}</p>
          ${devotee.profession ? `<p class="text-sm">${devotee.profession}</p>` : ''}
          ${devotee.lessonNumber ? `<p class="text-sm">Lesson ${devotee.lessonNumber}</p>` : ''}
          ${devotee.favoriteQuote ? `<p class="text-sm italic">"${devotee.favoriteQuote}"</p>` : ''}
          ${'distance' in devotee ? `<p class="text-sm text-gray-500">${devotee.distance} km away</p>` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      marker.setPopup(popup);

      // Add click handler
      el.addEventListener('click', () => {
        if (onDevoteeClick) {
          onDevoteeClick(devotee);
        }
      });

      markersRef.current.push(marker);
    });
  }, [devotees, onDevoteeClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
          Loading devotees...
        </div>
      )}
    </div>
  );
} 