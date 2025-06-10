export interface DevoteeProfile {
  id?: string; // Optional because MongoDB will generate it
  // Required fields
  firstName: string;
  city: string;
  country: string;
  
  // Optional fields
  spiritualName?: string;
  yearsOnPath?: number;
  lessonNumber?: number;
  profession?: string;
  background?: string;
  favoriteQuote?: string;
  favoriteChant?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  isVisible: boolean;
  
  // Location data for map
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface DevoteeFilters {
  country?: string;
  city?: string;
  profession?: string;
  lessonRange?: {
    min: number;
    max: number;
  };
  yearsOnPathRange?: {
    min: number;
    max: number;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Devotee {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  profession?: string;
  favoriteQuote?: string;
  shareLocation: boolean;
  coordinates?: Coordinates;
  createdAt: Date;
  updatedAt: Date;
} 