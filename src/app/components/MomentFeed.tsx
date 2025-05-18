'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { HeartIcon, ChatBubbleLeftIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useAnalytics } from '@/hooks/useAnalytics'

interface Moment {
  id: string
  caption: string
  quote?: string
  location?: string
  imageUrl: string
  createdAt: Timestamp
  likes: number
  comments: Array<{
    text: string
    userId: string
    createdAt: Timestamp
  }>
  userId: string
  userName: string
}

export default function MomentFeed() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null)
  const [comment, setComment] = useState('')
  const { trackMomentLike, trackMomentComment } = useAnalytics()

  useEffect(() => {
    const q = query(collection(db, 'moments'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const momentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Moment[]
      setMoments(momentData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLike = async (momentId: string) => {
    const moment = moments.find(m => m.id === momentId)
    if (!moment) return

    const momentRef = doc(db, 'moments', momentId)
    await updateDoc(momentRef, {
      likes: (moment.likes || 0) + 1
    })

    // Track the like event
    trackMomentLike(momentId)
  }

  const handleComment = async (momentId: string) => {
    if (!comment.trim()) return

    const momentRef = doc(db, 'moments', momentId)
    await updateDoc(momentRef, {
      comments: arrayUnion({
        text: comment,
        userId: 'current-user-id', // TODO: Replace with actual user ID
        createdAt: Timestamp.now()
      })
    })

    // Track the comment event
    trackMomentComment(momentId)
    setComment('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {moments.map((moment, index) => (
        <div key={moment.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Moment Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {moment.userName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{moment.userName}</p>
                <p className="text-sm text-gray-500">
                  {moment.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Moment Image */}
          <div className="aspect-square w-full relative">
            <Image
              src={moment.imageUrl}
              alt={moment.caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
            />
          </div>

          {/* Moment Content */}
          <div className="p-4 space-y-4">
            <p className="text-gray-900">{moment.caption}</p>
            
            {moment.quote && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 italic">&ldquo;{moment.quote}&rdquo;</p>
              </div>
            )}

            {moment.location && (
              <div className="flex items-center text-gray-500 text-sm">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {moment.location}
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={() => handleLike(moment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
              >
                <HeartIcon className="w-6 h-6" />
                <span>{moment.likes}</span>
              </button>
              <button
                onClick={() => setSelectedMoment(moment)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <ChatBubbleLeftIcon className="w-6 h-6" />
                <span>{moment.comments.length}</span>
              </button>
            </div>

            {/* Comments Section */}
            {selectedMoment?.id === moment.id && (
              <div className="mt-4 space-y-4">
                {moment.comments.map((comment, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-900">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleComment(moment.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 