'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDevotees } from '@/hooks/useDevotees';
import type { Devotee } from '@/types/devotee';
import { centers } from '@/data/centers';
import type { FeatureCollection, Point, GeoJsonProperties } from 'geojson';

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
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Helper: get unique countries/types
  const countries = Array.from(new Set(centers.map(c => c.country)));
  const types = Array.from(new Set(centers.map(c => c.type)));

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

    // --- CLUSTERING FOR CENTERS ---
    map.current.on('load', () => {
      // Filtered centers
      const filteredCenters = centers.filter(center =>
        (selectedCountry === 'All' || center.country === selectedCountry) &&
        (selectedType === 'All' || center.type === selectedType)
      );
      const geojson: FeatureCollection<Point, GeoJsonProperties> = {
        type: 'FeatureCollection',
        features: filteredCenters.map(center => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: center.coords as [number, number] },
          properties: { name: center.name, icon: center.icon || '', type: center.type }
        }))
      };
      if (map.current!.getSource('centers')) {
        (map.current!.getSource('centers') as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.current!.addSource('centers', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        // Cluster circles
        map.current!.addLayer({
          id: 'center-clusters',
          type: 'circle',
          source: 'centers',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#FFD700',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              18, 5, 24, 15, 32
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
        // Cluster count labels
        map.current!.addLayer({
          id: 'center-cluster-count',
          type: 'symbol',
          source: 'centers',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
          }
        });
        // Unclustered points (custom icons)
        map.current!.addLayer({
          id: 'center-unclustered',
          type: 'symbol',
          source: 'centers',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': ['case',
              ['==', ['get', 'icon'], 'lotus'], 'lotus-icon',
              ['==', ['get', 'icon'], 'srf-symbol'], 'srf-symbol-icon',
              ['==', ['get', 'icon'], 'ranchi-ashram'], 'ranchi-ashram-icon',
              'marker-15' // fallback
            ],
            'icon-size': 0.15,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-size': 12
          },
          paint: {
            'text-color': '#FFD700'
          }
        });
        // Add lotus icon to map
        map.current!.loadImage('/lotus.png', (err, image) => {
          if (!err && image && !map.current!.hasImage('lotus-icon')) {
            map.current!.addImage('lotus-icon', image);
          }
        });
        // Add SRF symbol icon to map
        map.current!.loadImage('/srf-symbol.png', (err, image) => {
          if (!err && image && !map.current!.hasImage('srf-symbol-icon')) {
            map.current!.addImage('srf-symbol-icon', image);
          }
        });
        // Add Ranchi Ashram icon to map
        map.current!.loadImage('/ranchi-ashram.png', (err, image) => {
          if (!err && image && !map.current!.hasImage('ranchi-ashram-icon')) {
            map.current!.addImage('ranchi-ashram-icon', image);
          }
        });
        // Popup on click
        map.current!.on('click', 'center-unclustered', (e) => {
          if (!e.features || !e.features[0]) return;
          const feature = e.features[0];
          const coordinates = (feature.geometry.type === 'Point' ? feature.geometry.coordinates : [0, 0]) as [number, number];
          const { name, type } = feature.properties as { name?: string; type?: string };
          if (Array.isArray(coordinates) && coordinates.length === 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
            new mapboxgl.Popup({ offset: 25 })
              .setLngLat([coordinates[0], coordinates[1]])
              .setHTML(`<strong>${name || ''}</strong><br/>${type || ''}`)
              .addTo(map.current!);
          }
        });
        // Zoom on cluster click
        map.current!.on('click', 'center-clusters', (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, { layers: ['center-clusters'] });
          if (!features[0]) return;
          const clusterId = features[0].properties && features[0].properties.cluster_id;
          (map.current!.getSource('centers') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            const coords = (features[0].geometry as Point).coordinates;
            if (typeof zoom === 'number' && Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
              map.current!.easeTo({ center: [coords[0], coords[1]], zoom });
            }
          });
        });
        // Change cursor
        map.current!.on('mouseenter', 'center-unclustered', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', 'center-unclustered', () => {
          map.current!.getCanvas().style.cursor = '';
        });

        // --- CLUSTERING FOR DEVOTEES ---
        map.current!.addSource('devotees-data', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [] // Initial empty data
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

        // Devotee cluster circles
        map.current!.addLayer({
          id: 'devotee-clusters',
          type: 'circle',
          source: 'devotees-data',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100, '#f1f075',
              750, '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, 100, 30, 750, 40
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // Devotee cluster count labels
        map.current!.addLayer({
          id: 'devotee-cluster-count',
          type: 'symbol',
          source: 'devotees-data',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        // Unclustered devotee points
        map.current!.addLayer({
          id: 'devotee-unclustered-points',
          type: 'circle',
          source: 'devotees-data',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#4264fb',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // --- HEATMAP FOR DEVOTEES ---
        map.current!.addLayer({
          id: 'devotee-heatmap',
          type: 'heatmap',
          source: 'devotees-data',
          maxzoom: 9, // Show heatmap at lower zoom levels
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'point_count'], // Use point_count for weight in clusters, or 1 for individual points
              0, 0,
              1, 1,
              5, 10
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 0.8,
              9, 0
            ]
          },
          layout: {
            'visibility': showHeatmap ? 'visible' : 'none'
          }
        }, 'devotee-unclustered-points'); // Place below unclustered points

        // Devotee popup on click
        map.current!.on('click', 'devotee-unclustered-points', (e) => {
          if (!e.features || !e.features[0]) return;
          const feature = e.features[0];
          const coordinates = (feature.geometry.type === 'Point' ? feature.geometry.coordinates : [0, 0]) as [number, number];
          const props = feature.properties as Devotee; // Cast to Devotee type

          const popupContent = `
            <div class="p-2">
              <h3 class="font-semibold">${props.name}</h3>
              <p class="text-sm text-gray-600">${props.city}, ${props.country}</p>
              ${props.profession ? `<p class="text-sm text-gray-600">${props.profession}</p>` : ''}
              ${props.favoriteQuote ? `<p class="text-sm italic mt-2">"${props.favoriteQuote}"</p>` : ''}
            </div>
          `;

          if (Array.isArray(coordinates) && coordinates.length === 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
            new mapboxgl.Popup({ offset: 25 })
              .setLngLat([coordinates[0], coordinates[1]])
              .setHTML(popupContent)
              .addTo(map.current!);
          }
        });

        // Zoom on devotee cluster click
        map.current!.on('click', 'devotee-clusters', (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, { layers: ['devotee-clusters'] });
          if (!features[0]) return;
          const clusterId = features[0].properties.cluster_id;
          (map.current!.getSource('devotees-data') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            const coords = (features[0].geometry as Point).coordinates;
            if (typeof zoom === 'number' && Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
              map.current!.easeTo({ center: [coords[0], coords[1]], zoom });
            }
          });
        });

        // Change cursor for devotee unclustered points
        map.current!.on('mouseenter', 'devotee-unclustered-points', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', 'devotee-unclustered-points', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom, selectedCountry, selectedType, showHeatmap]);

  // Update devotee data source when devotees change (real-time update)
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const devoteeFeatures: FeatureCollection<Point, GeoJsonProperties> = {
      type: 'FeatureCollection',
      features: devotees
        .filter(devotee => devotee.coordinates && devotee.shareLocation)
        .map(devotee => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [devotee.coordinates!.lng, devotee.coordinates!.lat] as [number, number] },
          properties: devotee as GeoJsonProperties // Store full devotee object in properties
        }))
    };

    const source = map.current.getSource('devotees-data') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(devoteeFeatures);
    }
  }, [devotees, map.current]); // Add map.current to dependencies

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

      {/* Filter UI */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-md z-10">
        <label className="block mb-2 font-semibold">Filter Centers</label>
        <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="mb-2 block w-full border rounded p-1">
          <option value="All">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="block w-full border rounded p-1">
          <option value="All">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="mt-4 flex items-center">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={e => setShowHeatmap(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">Show Devotee Heatmap</span>
        </label>
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