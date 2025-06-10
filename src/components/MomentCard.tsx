import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MomentCardProps {
  momentId: string;
}

const MomentCard = ({ momentId }: MomentCardProps) => {
  const [moment, setMoment] = useState<any>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchMoment = async () => {
      const momentDoc = await getDoc(doc(db, 'moments', momentId));
      if (momentDoc.exists()) {
        const data = momentDoc.data();
        setMoment(data);
        // Check if moment is expired (e.g., 24 hours old)
        const createdAt = data.createdAt.toDate();
        const now = new Date();
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (diffHours > 24) {
          setExpired(true);
        }
      }
    };
    fetchMoment();
  }, [momentId]);

  if (!moment || expired) return null;

  return (
    <div className="p-4 border rounded shadow">
      {moment.imageUrl && <img src={moment.imageUrl} alt="Moment" className="w-full h-48 object-cover" />}
      <p className="mt-2">{moment.text}</p>
      <p className="text-sm text-gray-500">Location: {moment.location}</p>
    </div>
  );
};

export default MomentCard; 