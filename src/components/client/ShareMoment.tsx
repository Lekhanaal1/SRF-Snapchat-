'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { CameraIcon, MapPinIcon, HeartIcon } from '@heroicons/react/24/outline'
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, app } from '@/lib/firebase'
import Image from 'next/image'
import { useAnalytics } from '@/hooks/useAnalytics'

interface MomentFormData {
  caption: string
  quote?: string
  location?: string
  isPublic: boolean
}

export default function ShareMoment() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { trackMomentShare } = useAnalytics()
  const { register, handleSubmit, formState: { errors } } = useForm<MomentFormData>()

  // Initialize storage only on the client
  const storage = typeof window !== 'undefined' ? getStorage(app) : null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: MomentFormData) => {
    if (!image || !storage) return

    setIsUploading(true)
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `moments/${Date.now()}_${image.name}`)
      const snapshot = await uploadBytes(storageRef, image)
      const imageUrl = await getDownloadURL(snapshot.ref)

      // Save moment to Firestore
      await addDoc(collection(db, 'moments'), {
        ...data,
        imageUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      })

      // Track the moment share event
      trackMomentShare(!!data.location, !!data.quote)

      // Reset form
      setImage(null)
      setPreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error sharing moment:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Preview/Upload */}
        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          {preview ? (
            <div className="relative w-full h-full">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <CameraIcon className="w-12 h-12 mb-2" />
              <p>Tap to add a photo</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Caption */}
        <div>
          <textarea
            {...register('caption', { required: 'Caption is required' })}
            placeholder="Share your spiritual moment..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
          {errors.caption && (
            <p className="mt-1 text-sm text-red-600">{errors.caption.message}</p>
          )}
        </div>

        {/* Quote */}
        <div>
          <textarea
            {...register('quote')}
            placeholder="Add a quote or chant (optional)"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            {...register('location')}
            placeholder="Add location (optional)"
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isPublic')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Make this moment public to all devotees
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!image || isUploading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? 'Sharing...' : 'Share Moment'}
        </button>
      </form>
    </div>
  )
} 