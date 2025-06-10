import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DevoteeProfile } from '@/types/devotee';
import { devoteeService } from '@/services/devoteeService';
import LocationPicker from './LocationPicker';

// Define the form data type first
type FormData = {
  firstName: string;
  city: string;
  country: string;
  spiritualName?: string;
  yearsOnPath?: number;
  lessonNumber?: number;
  profession?: string;
  background?: string;
  favoriteQuote?: string;
  favoriteChant?: string;
};

// Then create the schema based on the type
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  spiritualName: yup.string().optional(),
  yearsOnPath: yup.number().min(0).max(100).optional(),
  lessonNumber: yup.number().min(1).max(200).optional(),
  profession: yup.string().optional(),
  background: yup.string().optional(),
  favoriteQuote: yup.string().optional(),
  favoriteChant: yup.string().optional(),
}) as yup.ObjectSchema<FormData>;

interface DevoteeProfileFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function DevoteeProfileForm({ onSuccess, onError }: DevoteeProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!location) {
      onError?.(new Error('Please select your location on the map'));
      return;
    }

    setIsSubmitting(true);
    try {
      const profile: Omit<DevoteeProfile, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'isVisible'> = {
        ...data,
        location: {
          type: 'Point',
          coordinates: location
        }
      };

      await devoteeService.addDevotee(profile);
      reset();
      setLocation(null);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Share Your Spiritual Journey</h2>
        
        {/* Required Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              {...register('firstName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Spiritual Name (Optional)</label>
            <input
              type="text"
              {...register('spiritualName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                {...register('city')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country *</label>
              <input
                type="text"
                {...register('country')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Optional Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Years on the Path</label>
              <input
                type="number"
                {...register('yearsOnPath')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lesson Number</label>
              <input
                type="number"
                {...register('lessonNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profession</label>
            <input
              type="text"
              {...register('profession')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Background</label>
            <textarea
              {...register('background')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Favorite Quote</label>
            <textarea
              {...register('favoriteQuote')}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Favorite Chant</label>
            <input
              type="text"
              {...register('favoriteChant')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Select Your Location *</label>
          <div className="mt-2">
            <LocationPicker
              onLocationSelect={(coordinates) => setLocation(coordinates)}
              initialLocation={location || undefined}
            />
          </div>
          {!location && (
            <p className="mt-1 text-sm text-red-600">Please select your location on the map</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Share My Journey'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            By submitting this form, you agree that your information will be visible to other SRF/YSS devotees during the convocation.
            Your profile will be reviewed by SRF/YSS staff before being made visible.
          </p>
        </div>
      </div>
    </form>
  );
} 