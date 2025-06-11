'use client';

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
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation || [-98.5795, 39.8283], // Default to US center
      zoom: 3
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // Remove existing marker if any
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map.current!);

      onLocationSelect(coordinates);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onLocationSelect, initialLocation]);

  // Update marker position if initialLocation changes
  useEffect(() => {
    if (isMapLoaded && initialLocation && map.current) {
      if (marker.current) {
        marker.current.remove();
      }

      marker.current = new mapboxgl.Marker()
        .setLngLat(initialLocation)
        .addTo(map.current);

      map.current.flyTo({
        center: initialLocation,
        zoom: 12
      });
    }
  }, [initialLocation, isMapLoaded]);

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
} 