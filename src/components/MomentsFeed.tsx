'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { MapPinIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Moment {
  id: string;
  caption: string;
  imageUrl: string;
  coordinates?: [number, number];
  createdAt: Timestamp;
  likes: number;
  comments: Comment[];
  userId: string;
  userName: string;
  userPhoto?: string;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: Timestamp;
}

export default function MomentsFeed() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const q = query(
      collection(db, 'moments'),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const momentsData: Moment[] = [];
      snapshot.forEach((doc) => {
        momentsData.push({ id: doc.id, ...doc.data() } as Moment);
      });
      setMoments(momentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No moments shared yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {moments.map((moment) => (
        <div key={moment.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Info */}
          <div className="p-4 flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {moment.userPhoto ? (
                <Image
                  src={moment.userPhoto}
                  alt={moment.userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-500 font-medium">
                    {moment.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{moment.userName}</p>
              <p className="text-sm text-gray-500">
                {moment.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-square w-full">
            <Image
              src={moment.imageUrl}
              alt={moment.caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Caption and Location */}
          <div className="p-4 space-y-2">
            <p className="text-gray-800">{moment.caption}</p>
            {moment.coordinates && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>
                  {moment.coordinates[0].toFixed(4)}, {moment.coordinates[1].toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
              <HeartIcon className="w-6 h-6" />
              <span>{moment.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <ChatBubbleLeftIcon className="w-6 h-6" />
              <span>{moment.comments.length}</span>
            </button>
          </div>

          {/* Comments */}
          {moment.comments.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 space-y-3">
              {moment.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {comment.userPhoto ? (
                      <Image
                        src={comment.userPhoto}
                        alt={comment.userName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-500 text-sm">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{comment.userName}</span>{' '}
                      {comment.text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {comment.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 