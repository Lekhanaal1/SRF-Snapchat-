import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PrayerBeacon {
  id: string;
  location: {
    longitude: number;
    latitude: number;
  };
  participants: number;
  startedAt: Date;
}

const PrayerBeacon = () => {
  const [activeBeacons, setActiveBeacons] = useState<PrayerBeacon[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    // Listen for active prayer beacons
    const q = query(
      collection(db, 'prayerBeacons'),
      where('endedAt', '==', null)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const beacons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerBeacon[];
      setActiveBeacons(beacons);
    });

    return () => unsubscribe();
  }, []);

  const startPrayerBeacon = async () => {
    if (!userLocation) return;

    try {
      await addDoc(collection(db, 'prayerBeacons'), {
        location: {
          longitude: userLocation[0],
          latitude: userLocation[1]
        },
        participants: 1,
        startedAt: serverTimestamp(),
        endedAt: null
      });
    } catch (error) {
      console.error('Error starting prayer beacon:', error);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Prayer Beacons</h3>
      <button
        onClick={startPrayerBeacon}
        className="bg-purple-500 text-white px-4 py-2 rounded w-full mb-2"
      >
        Start Prayer Circle
      </button>
      <div className="space-y-2">
        {activeBeacons.map(beacon => (
          <div key={beacon.id} className="p-2 border rounded">
            <p>Participants: {beacon.participants}</p>
            <p>Started: {new Date(beacon.startedAt).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerBeacon; 