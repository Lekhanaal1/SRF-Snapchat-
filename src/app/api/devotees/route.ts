import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, WithId, Document, OptionalId } from 'mongodb';
import { DevoteeProfile } from '@/types/devotee';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Create indexes when the API route is first loaded
async function createIndexes() {
  try {
    await client.connect();
    const database = client.db('srf-devotees');
    const devotees = database.collection<DevoteeProfile>('devotees');

    // Create a 2dsphere index for geospatial queries
    await devotees.createIndex({ location: '2dsphere' });
    
    // Create indexes for common query fields
    await devotees.createIndex({ country: 1 });
    await devotees.createIndex({ profession: 1 });
    await devotees.createIndex({ isApproved: 1, isVisible: 1 });

    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating MongoDB indexes:', error);
  } finally {
    await client.close();
  }
}

// Create indexes when the module is loaded
createIndexes().catch(console.error);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, city, country, spiritualName, yearsOnPath, lessonNumber, profession, background, favoriteQuote, favoriteChant, location } = body;

    // Validate required fields
    if (!firstName || !city || !country || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('srf-devotees');
    const devotees = database.collection<DevoteeProfile>('devotees');

    // Create new devotee profile
    const newDevotee: Omit<DevoteeProfile, 'id'> = {
      firstName,
      city,
      country,
      spiritualName,
      yearsOnPath,
      lessonNumber,
      profession,
      background,
      favoriteQuote,
      favoriteChant,
      location,
      isApproved: false, // New profiles need approval
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await devotees.insertOne(newDevotee);

    return NextResponse.json(
      { 
        message: 'Devotee profile created successfully',
        id: result.insertedId.toString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating devotee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const profession = searchParams.get('profession');

    // Connect to MongoDB
    await client.connect();
    const database = client.db('srf-devotees');
    const devotees = database.collection<DevoteeProfile>('devotees');

    // Build query
    const query: any = { isApproved: true, isVisible: true };
    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }
    if (profession) {
      query.profession = { $regex: new RegExp(profession, 'i') };
    }

    // Get approved and visible devotees
    const cursor = devotees.find(query);
    const devoteesList = await cursor.toArray();

    // Transform the data to include string IDs
    const transformedDevotees = devoteesList.map((devotee) => ({
      ...devotee,
      id: devotee._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(transformedDevotees);
  } catch (error) {
    console.error('Error fetching devotees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 