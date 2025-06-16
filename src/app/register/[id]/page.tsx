'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import LocationPicker from '@/components/LocationPicker';

export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const docRef = doc(db, 'participants', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'approved') {
            setParticipant({
              id: docSnap.id,
              ...data
            });
          } else {
            setError('This registration is not approved yet');
          }
        } else {
          setError('Registration not found');
        }
      } catch (err) {
        setError('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError('Please select your location');
      return;
    }

    setSubmitting(true);
    try {
      const docRef = doc(db, 'participants', params.id as string);
      await updateDoc(docRef, {
        location: {
          coordinates: location
        },
        status: 'registered',
        registeredAt: new Date()
      });

      router.push('/registration-success');
    } catch (err) {
      setError('Failed to complete registration');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Error</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Registration</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your location to complete the registration process
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={participant.name}
                  disabled
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={participant.email}
                  disabled
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Location
              </label>
              <LocationPicker
                onLocationSelect={setLocation}
                initialLocation={participant.location?.coordinates}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting || !location}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${submitting || !location 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
              >
                {submitting ? 'Completing Registration...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 