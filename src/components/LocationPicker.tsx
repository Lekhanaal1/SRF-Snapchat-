import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface LocationPickerProps {
  onLocationSelect: (coordinates: [number, number]) => void;
  initialLocation?: [number, number];
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: initialLocation || [0, 20],
      zoom: initialLocation ? 10 : 1.5,
      minZoom: 1,
      maxZoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add initial marker if location is provided
    if (initialLocation) {
      marker.current = new mapboxgl.Marker()
        .setLngLat(initialLocation)
        .addTo(map.current);
    }

    // Add click handler to map
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // Update or create marker
      if (marker.current) {
        marker.current.setLngLat(coordinates);
      } else {
        marker.current = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(map.current!);
      }

      onLocationSelect(coordinates);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation, onLocationSelect]);

  // Handle location search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      setSearchResults(data.features);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    }
  };

  // Handle search result selection
  const handleResultSelect = (result: any) => {
    const [lng, lat] = result.center;
    const coordinates: [number, number] = [lng, lat];

    if (map.current) {
      map.current.flyTo({
        center: coordinates,
        zoom: 10
      });

      if (marker.current) {
        marker.current.setLngLat(coordinates);
      } else {
        marker.current = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(map.current);
      }

      onLocationSelect(coordinates);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a city or location..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
            <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                >
                  <div className="flex items-center">
                    <span className="ml-3 truncate">{result.place_name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="h-64 rounded-lg overflow-hidden" />
      
      {/* Instructions */}
      <p className="text-sm text-gray-500">
        Click on the map to select your location, or search for a city above.
      </p>
    </div>
  );
} 