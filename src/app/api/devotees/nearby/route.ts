import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { DevoteeProfile } from '@/types/devotee';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lng = parseFloat(searchParams.get('lng') || '0');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const radius = parseFloat(searchParams.get('radius') || '100'); // Default 100km radius
    const maxResults = parseInt(searchParams.get('limit') || '50', 10);

    if (isNaN(lng) || isNaN(lat) || isNaN(radius)) {
      return NextResponse.json(
        { error: 'Invalid coordinates or radius' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('srf-devotees');
    const devotees = database.collection<DevoteeProfile>('devotees');

    // Find devotees within radius using $geoNear
    const nearbyDevotees = await devotees.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distance', // Distance in meters
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: { isApproved: true, isVisible: true }
        }
      },
      {
        $limit: maxResults
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          firstName: 1,
          spiritualName: 1,
          city: 1,
          country: 1,
          profession: 1,
          lessonNumber: 1,
          yearsOnPath: 1,
          favoriteQuote: 1,
          favoriteChant: 1,
          location: 1,
          distance: 1
        }
      }
    ]).toArray();

    // Transform distances to kilometers
    const transformedDevotees = nearbyDevotees.map(devotee => ({
      ...devotee,
      distance: Math.round(devotee.distance / 1000) // Convert meters to kilometers
    }));

    return NextResponse.json(transformedDevotees);
  } catch (error) {
    console.error('Error finding nearby devotees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 