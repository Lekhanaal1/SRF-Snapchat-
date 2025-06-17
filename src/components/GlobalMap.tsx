'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { MagnifyingGlassIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Constants
const MARKER_SIZE = 32;
const CLUSTER_RADIUS = 50;
const MAX_MARKERS = 500;
const DEBOUNCE_DELAY = 300;

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
  createdAt: any;
}

interface Center {
  id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  isLotus?: boolean; // Indicates if this center should have a special lotus icon
}

interface CenterStats {
  [key: string]: {
    total: number;
    registered: number;
    pending: number;
    lastWeek: number;
    lastMonth: number;
    byStatus: {
      registered: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
}

interface FilterState {
  center: string;
  status: string;
  searchTerm: string;
  timeRange: 'all' | 'week' | 'month';
}

export default function GlobalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const clusters = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [centerStats, setCenterStats] = useState<CenterStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    center: '',
    status: '',
    searchTerm: '',
    timeRange: 'all'
  });
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null);

  // Callback functions (defined before useMemo hooks that depend on them)
  const filterDevotees = useCallback((devotees: Devotee[], filters: FilterState) => {
    return devotees.filter(devotee => {
      const matchesCenter = !filters.center || devotee.center === filters.center;
      const matchesStatus = !filters.status || devotee.status === filters.status;
      const matchesSearch = !filters.searchTerm || 
        devotee.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        devotee.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const now = new Date();
      const devoteeDate = new Date(devotee.createdAt?.toDate());
      const matchesTimeRange = filters.timeRange === 'all' ||
        (filters.timeRange === 'week' && now.getTime() - devoteeDate.getTime() <= 7 * 24 * 60 * 60 * 1000) ||
        (filters.timeRange === 'month' && now.getTime() - devoteeDate.getTime() <= 30 * 24 * 60 * 60 * 1000);

      return matchesCenter && matchesStatus && matchesSearch && matchesTimeRange;
    });
  }, []);

  const updateStats = useCallback((devotees: Devotee[]) => {
    const stats: CenterStats = {};
    const now = new Date();

    devotees.forEach(devotee => {
      if (!stats[devotee.center]) {
        stats[devotee.center] = {
          total: 0,
          registered: 0,
          pending: 0,
          lastWeek: 0,
          lastMonth: 0,
          byStatus: {
            registered: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };
      }

      const devoteeDate = new Date(devotee.createdAt?.toDate());
      const isLastWeek = now.getTime() - devoteeDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      const isLastMonth = now.getTime() - devoteeDate.getTime() <= 30 * 24 * 60 * 60 * 1000;

      stats[devotee.center].total++;
      stats[devotee.center].byStatus[devotee.status]++;
      
      if (devotee.status === 'registered') {
        stats[devotee.center].registered++;
      } else if (devotee.status === 'pending') {
        stats[devotee.center].pending++;
      }

      if (isLastWeek) stats[devotee.center].lastWeek++;
      if (isLastMonth) stats[devotee.center].lastMonth++;
    });

    setCenterStats(stats);
  }, []);

  const updateAllMarkers = useCallback((devotees: Devotee[], centers: Center[], bounds: mapboxgl.LngLatBounds) => {
    // Clear existing markers and clusters
    Object.values(markers.current).forEach(marker => marker.remove());
    Object.values(clusters.current).forEach(cluster => cluster.remove());
    markers.current = {};
    clusters.current = {};

    // Group devotee markers by location
    const devoteeMarkerGroups = new Map<string, Devotee[]>();
    
    devotees.forEach(devotee => {
      if (!devotee.location?.coordinates) return;
      
      const key = `${devotee.location.coordinates[0]},${devotee.location.coordinates[1]}`;
      if (!devoteeMarkerGroups.has(key)) {
        devoteeMarkerGroups.set(key, []);
      }
      devoteeMarkerGroups.get(key)?.push(devotee);
    });

    // Create devotee markers or clusters
    devoteeMarkerGroups.forEach((group, key) => {
      const [lng, lat] = key.split(',').map(Number);
      const coordinates: [number, number] = [lng, lat];

      if (!bounds.contains(coordinates)) return;

      if (group.length === 1) {
        // Single devotee marker
        const devotee = group[0];
        const el = document.createElement('div');
        el.className = 'marker';
        
        const markerContent = document.createElement('div');
        markerContent.className = 'relative';
        
        const img = document.createElement('img');
        img.src = devotee.profilePicture || '/default-avatar.png';
        img.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg';
        markerContent.appendChild(img);

        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 transition-opacity duration-200';
        tooltip.textContent = devotee.name;
        markerContent.appendChild(tooltip);

        el.appendChild(markerContent);

        // Show tooltip on hover
        el.onmouseenter = () => { tooltip.classList.remove('opacity-0'); };
        el.onmouseleave = () => { tooltip.classList.add('opacity-0'); };

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current!);
        markers.current[devotee.id] = marker;
      } else {
        // Cluster marker (for devotees)
        const clusterEl = document.createElement('div');
        clusterEl.className = 'cluster-marker';
        clusterEl.style.width = `${MARKER_SIZE}px`;
        clusterEl.style.height = `${MARKER_SIZE}px`;
        clusterEl.style.borderRadius = '50%';
        clusterEl.style.backgroundColor = '#3B82F6';
        clusterEl.style.color = 'white';
        clusterEl.style.display = 'flex';
        clusterEl.style.justifyContent = 'center';
        clusterEl.style.alignItems = 'center';
        clusterEl.style.fontWeight = 'bold';
        clusterEl.style.cursor = 'pointer';
        clusterEl.textContent = String(group.length);

        clusterEl.onclick = () => {
          if (map.current) {
            map.current.flyTo({ center: coordinates, zoom: map.current.getZoom() + 2 });
          }
        };

        const cluster = new mapboxgl.Marker(clusterEl)
          .setLngLat(coordinates)
          .addTo(map.current!);
        clusters.current[key] = cluster;
      }
    });

    // Create center markers
    centers.forEach(center => {
      if (!center.location?.coordinates) return;

      const [lng, lat] = center.location.coordinates;
      const coordinates: [number, number] = [lng, lat];

      if (!bounds.contains(coordinates)) return;

      const el = document.createElement('div');
      el.className = 'center-marker';

      const markerContent = document.createElement('div');
      markerContent.className = 'relative';

      const img = document.createElement('img');
      img.className = 'w-10 h-10 rounded-full border-2 border-white shadow-lg';
      img.src = center.isLotus ? '/lotus-icon.png' : '/center-icon.png'; // Use lotus icon if specified

      markerContent.appendChild(img);

      const tooltip = document.createElement('div');
      tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 transition-opacity duration-200';
      tooltip.textContent = center.name;
      markerContent.appendChild(tooltip);

      el.appendChild(markerContent);

      // Show tooltip on hover
      el.onmouseenter = () => { tooltip.classList.remove('opacity-0'); };
      el.onmouseleave = () => { tooltip.classList.add('opacity-0'); };

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current!);
    });
  }, []);

  // Memoized values
  const availableCenterNames = useMemo(() => Object.keys(centerStats), [centerStats]);
  const filteredDevotees = useMemo(() => filterDevotees(devotees, filters), [devotees, filters]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize map and fetch initial data
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283],
      zoom: isMobile ? 2 : 3,
      maxZoom: 15,
      minZoom: 1,
      renderWorldCopies: false,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

    // Handle map movement
    map.current.on('moveend', () => {
      if (!map.current) return;
      setMapBounds(map.current.getBounds());
    });

    // Listen for devotee data with pagination
    const devoteesRef = collection(db, 'participants');
    const qDevotees = query(
      devoteesRef,
      orderBy('createdAt', 'desc'),
      limit(MAX_MARKERS)
    );

    const unsubscribeDevotees = onSnapshot(qDevotees, (snapshot) => {
      const newDevotees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Devotee[];
      setDevotees(newDevotees);
      updateStats(newDevotees);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching devotees:', error);
      setError('Failed to load devotee data');
      setLoading(false);
    });

    // Listen for center data
    const centersRef = collection(db, 'centers');
    const qCenters = query(centersRef);

    const unsubscribeCenters = onSnapshot(qCenters, (snapshot) => {
      const newCenters = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Center[];
      setCenters(newCenters);
    }, (error) => {
      console.error('Error fetching centers:', error);
      setError('Failed to load center data');
    });

    return () => {
      unsubscribeDevotees();
      unsubscribeCenters(); // Unsubscribe from centers listener
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isMobile]);

  // Update markers when filters, devotees, centers, or mapBounds change
  useEffect(() => {
    if (!map.current || !mapBounds) return;
    updateAllMarkers(filteredDevotees, centers, mapBounds);
  }, [filteredDevotees, centers, mapBounds]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, searchTerm: value }));
    }, DEBOUNCE_DELAY),
    []
  );

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading map...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center h-96">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search devotees..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Center</label>
              <select
                id="center-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.center}
                onChange={(e) => setFilters(prev => ({ ...prev, center: e.target.value }))}
              >
                <option value="">All Centers</option>
                {availableCenterNames.map(centerName => (
                  <option key={centerName} value={centerName}>{centerName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as 'all' | 'week' | 'month' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Center Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(centerStats).map(([center, stats]) => (
              <div key={center} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{center}</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Registered:</span>
                    <span className="font-medium">{stats.registered}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Pending:</span>
                    <span className="font-medium">{stats.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">Last Week:</span>
                    <span className="font-medium">{stats.lastWeek}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">Last Month:</span>
                    <span className="font-medium">{stats.lastMonth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-2">Legend</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Registered</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
} 