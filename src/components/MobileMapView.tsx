'use client';

import { useState } from 'react';
import { MapIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import GlobalMap from './GlobalMap';

type View = 'map' | 'stats' | 'list';

export default function MobileMapView() {
  const [currentView, setCurrentView] = useState<View>('map');

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'map' && (
          <div className="h-full">
            <GlobalMap />
          </div>
        )}
        {currentView === 'stats' && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-xl font-semibold mb-4">Center Statistics</h2>
            {/* Stats content will be rendered by GlobalMap component */}
          </div>
        )}
        {currentView === 'list' && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-xl font-semibold mb-4">Devotee List</h2>
            {/* List content will be rendered by GlobalMap component */}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setCurrentView('map')}
            className={`flex flex-col items-center justify-center ${
              currentView === 'map' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <MapIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Map</span>
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`flex flex-col items-center justify-center ${
              currentView === 'stats' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Stats</span>
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`flex flex-col items-center justify-center ${
              currentView === 'list' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <UserGroupIcon className="h-6 w-6" />
            <span className="text-xs mt-1">List</span>
          </button>
        </div>
      </div>
    </div>
  );
} 