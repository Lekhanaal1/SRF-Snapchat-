interface TourSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  coordinates: [number, number]; // [lng, lat]
}

export const tourSpots: TourSpot[] = [
  {
    id: 'sjce-entrance',
    name: 'SJCE Entrance',
    description: 'Start your tour at the iconic Pat Circle here.',
    imageUrl: '/images/sjce-entrance.jpg', // Placeholder image
    coordinates: [76.6190, 12.3150], // Example coordinates for SJCE Entrance
  },
  {
    id: 'admin-block',
    name: 'Administration Block',
    description: 'This is the main administrative building where you can find various offices.',
    imageUrl: '/images/admin-block.jpg', // Placeholder image
    coordinates: [76.6185, 12.3160],
  },
  {
    id: 'library',
    name: 'Central Library',
    description: 'Explore our vast collection of books and digital resources in the central library.',
    imageUrl: '/images/library.jpg', // Placeholder image
    coordinates: [76.6170, 12.3155],
  },
  {
    id: 'campus-road',
    name: 'Campus Main Road',
    description: 'A scenic road connecting various departments and facilities within the campus.',
    imageUrl: '/images/campus-road.jpg', // Placeholder image
    coordinates: [76.6200, 12.3170],
  },
  {
    id: 'jubilee-building',
    name: 'Jubilee Building',
    description: 'A landmark building on campus, often hosting major events and conferences.',
    imageUrl: '/images/jubilee-building.jpg', // Placeholder image
    coordinates: [76.6210, 12.3175],
  },
]; 