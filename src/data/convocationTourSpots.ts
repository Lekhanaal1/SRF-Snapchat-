interface ConvocationTourSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  coordinates: [number, number]; // [lng, lat]
}

export const convocationTourSpots: ConvocationTourSpot[] = [
  {
    id: 'headquarters-entrance',
    name: 'YSS / SRF Headquarters Entrance',
    description: 'Begin your convocation tour at the main entrance of the Headquarters.',
    imageUrl: '/images/convocation/headquarters-entrance.jpg', // Placeholder image
    coordinates: [-118.2716, 34.0754], // Example: Los Angeles, CA (SRF Headquarters)
  },
  {
    id: 'main-auditorium',
    name: 'Main Auditorium',
    description: 'The primary venue for meditations, lectures, and satsangs during convocation.',
    imageUrl: '/images/convocation/main-auditorium.jpg', // Placeholder image
    coordinates: [-118.2700, 34.0745],
  },
  {
    id: 'book-room',
    name: 'Book Room & Gift Shop',
    description: 'Discover spiritual literature and unique gifts.',
    imageUrl: '/images/convocation/book-room.jpg', // Placeholder image
    coordinates: [-118.2725, 34.0760],
  },
  {
    id: 'gardens',
    name: 'Meditation Gardens',
    description: 'Find peace and inspiration in the serene meditation gardens.',
    imageUrl: '/images/convocation/meditation-gardens.jpg', // Placeholder image
    coordinates: [-118.2730, 34.0750],
  },
  {
    id: 'lake-shrine',
    name: 'Lake Shrine Temple',
    description: 'A beautiful temple and meditation garden overlooking the Pacific Ocean.',
    imageUrl: '/images/convocation/lake-shrine.jpg', // Placeholder image
    coordinates: [-118.5284, 34.0375], // Example: Lake Shrine, Pacific Palisades
  },
]; 