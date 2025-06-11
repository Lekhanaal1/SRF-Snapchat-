'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { convocationTourSpots } from '@/data/convocationTourSpots';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function ConvocationTour() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const currentSpot = convocationTourSpots[currentSpotIndex];

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: currentSpot.coordinates,
      zoom: 15,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    convocationTourSpots.forEach((spot, index) => {
      const el = document.createElement('div');
      el.className = 'tour-spot-marker';
      if (index === currentSpotIndex) {
        el.style.backgroundColor = '#4CAF50';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #fff';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#fff';
        el.style.fontWeight = 'bold';
        el.textContent = `${index + 1}`;
      } else {
        el.style.backgroundColor = '#2196F3';
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '50%';
        el.style.border = '1px solid #fff';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#fff';
        el.textContent = `${index + 1}`;
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat(spot.coordinates)
        .addTo(map.current!);
      markers.current.push(marker);

      el.addEventListener('click', () => {
        setCurrentSpotIndex(index);
      });
    });

    map.current.flyTo({
      center: currentSpot.coordinates,
      zoom: 15,
      essential: true
    });
  }, [currentSpotIndex, mapLoaded]);

  const handlePrevious = () => {
    setCurrentSpotIndex((prevIndex) => (prevIndex === 0 ? convocationTourSpots.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentSpotIndex((prevIndex) => (prevIndex === convocationTourSpots.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="flex flex-col h-screen">
      <div ref={mapContainer} className="flex-grow relative" />

      <div className="bg-white shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <span className="font-medium text-lg">Spot {currentSpotIndex + 1} / {convocationTourSpots.length}</span>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>

        <button
          onClick={() => setShowContent(!showContent)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          {showContent ? 'Hide Content' : 'Show Content'}
        </button>

        {showContent && (
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={currentSpot.imageUrl}
                alt={currentSpot.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold text-gray-900">{currentSpot.name}</h3>
              <p className="text-gray-700 mt-1">{currentSpot.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 