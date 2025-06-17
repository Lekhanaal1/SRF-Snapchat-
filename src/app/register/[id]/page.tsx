'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  email: string;
  location?: {
    coordinates: [number, number];
  };
  center: string;
  status: 'registered' | 'approved' | 'pending' | 'rejected';
}

export default function RegistrationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const fetchParticipant = async () => {
      if (!params.id) {
        setError('Invalid registration ID');
        setLoading(false);
        return;
      }

      try {
        const participantRef = doc(db, 'participants', params.id);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
          setError('Registration not found');
          setLoading(false);
          return;
        }

        const participantData = participantDoc.data() as Participant;
        setParticipant(participantData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching participant:', err);
        setError('Failed to load registration details');
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [params.id]);

  const handleRegistration = async () => {
    if (!participant) return;

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const coordinates: [number, number] = [
        position.coords.longitude,
        position.coords.latitude
      ];

      // Update participant document
      const participantRef = doc(db, 'participants', participant.id);
      await updateDoc(participantRef, {
        status: 'registered',
        location: {
          coordinates
        },
        registeredAt: new Date(),
        registeredBy: user?.uid
      });

      toast.success('Registration successful!');
      router.push('/registration-success');
    } catch (err) {
      console.error('Error during registration:', err);
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location services to register.');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Failed to get location. Please try again.');
        }
      } else {
        setError('Failed to complete registration. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Complete Registration</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{participant.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{participant.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Center</label>
            <p className="mt-1 text-gray-900">{participant.center}</p>
          </div>

          {locationError && (
            <div className="text-red-500 text-sm mt-2">
              {locationError}
            </div>
          )}

          <button
            onClick={handleRegistration}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
} 