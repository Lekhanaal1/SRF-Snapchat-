'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface RegistrationQRProps {
  participantId: string;
}

export default function RegistrationQR({ participantId }: RegistrationQRProps) {
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const docRef = doc(db, 'participants', participantId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setParticipant({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setError('Participant not found');
        }
      } catch (err) {
        setError('Failed to load participant data');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!participant) {
    return <div className="p-4">No participant data available</div>;
  }

  // Create registration URL with participant data
  const registrationUrl = `${window.location.origin}/register/${participantId}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration QR Code</h2>
        <p className="text-gray-600">Scan this QR code to complete your registration</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-lg shadow-inner">
          <QRCode
            value={registrationUrl}
            size={200}
            level="H"
            includeMargin={true}
            renderAs="svg"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Registration Link:</p>
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 break-all"
        >
          {registrationUrl}
        </a>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Participant Details:</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {participant.name}</p>
          <p><span className="font-medium">Email:</span> {participant.email}</p>
          <p><span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs
              ${participant.status === 'approved' ? 'bg-green-100 text-green-800' : 
                participant.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'}`}>
              {participant.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
} 