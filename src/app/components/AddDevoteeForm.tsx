'use client'

import { useState } from 'react'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

type FormData = {
  name: string
  city: string
  country: string
  lessonRange: string
  profession?: string
  favoriteQuote?: string
  shareLocation: boolean
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  lessonRange: yup.string().required('Lesson range is required'),
  profession: yup.string().optional(),
  favoriteQuote: yup.string().optional(),
  shareLocation: yup.boolean().default(true),
}).required()

interface AddDevoteeFormProps {
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

export default function AddDevoteeForm({ onSubmit, onCancel }: AddDevoteeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>
  })

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name (or Spiritual Name)
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            {...register('city')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            id="country"
            {...register('country')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="lessonRange" className="block text-sm font-medium text-gray-700">
          Lesson Range
        </label>
        <input
          type="text"
          id="lessonRange"
          {...register('lessonRange')}
          placeholder="e.g., 56 or 60+ for Kriyabans"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.lessonRange && (
          <p className="mt-1 text-sm text-red-600">{errors.lessonRange.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
          Profession (Optional)
        </label>
        <input
          type="text"
          id="profession"
          {...register('profession')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="favoriteQuote" className="block text-sm font-medium text-gray-700">
          Favorite Quote or Chant (Optional)
        </label>
        <textarea
          id="favoriteQuote"
          rows={3}
          {...register('favoriteQuote')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="shareLocation"
          {...register('shareLocation')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="shareLocation" className="ml-2 block text-sm text-gray-700">
          Share my location on the map
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add to Map'}
        </button>
      </div>
    </form>
  )
} 