'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { QrCodeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { centers } from '@/data/centers';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import QRScanner from '@/components/QRScanner';

interface RegistrationFormData {
  name: string;
  lessonNumber: number;
  homeCenter: string;
  isKriyaban?: boolean;
  devoteeSince: string;
  // profileImage?: File;
}

interface QRData {
  type: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  timestamp: string;
}

// Define validation schema using yup
const registrationSchema = yup.object<RegistrationFormData>().shape({
  name: yup.string().required('Full Name is required').min(2, 'Name must be at least 2 characters'),
  lessonNumber: yup.number()
    .required('Lesson Number is required')
    .positive('Lesson Number must be positive')
    .integer('Lesson Number must be an integer')
    .min(1, 'Lesson Number must be at least 1'),
  homeCenter: yup.string().required('Home Center is required'),
  isKriyaban: yup.boolean(),
  devoteeSince: yup.string().required('Devotee Since date is required'),
  // profileImage is handled separately if needed for client-side validation,
  // but primarily validated before upload if it's a file.
});

export default function SignIn() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
  });

  // Get unique center names for dropdown
  const centerNames = Array.from(new Set(centers.map(c => c.name))).sort();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText) as QRData;
      
      // Validate QR code data
      if (data.type !== 'srf_convocation') {
        throw new Error('Invalid QR code type');
      }

      setQrData(data);
      setShowQRScanner(false);
      setShowRegistration(true);
    } catch (error) {
      console.error('Error parsing QR code:', error);
      // Show error message to user
    }
  };

  const handleQRScanError = (error: string) => {
    console.error('QR scan error:', error);
    // Show error message to user
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user) return;

    try {
      // Save user profile to Firestore
      await addDoc(collection(db, 'devotees'), {
        uid: user.uid,
        name: data.name,
        lessonNumber: data.lessonNumber,
        homeCenter: data.homeCenter,
        isKriyaban: data.isKriyaban,
        devoteeSince: data.devoteeSince,
        profileImage: preview, // Store base64 image temporarily
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        // Add convocation data if available
        ...(qrData && {
          convocation: {
            eventId: qrData.eventId,
            eventName: qrData.eventName,
            eventDate: qrData.eventDate,
            eventLocation: qrData.eventLocation,
            joinedAt: qrData.timestamp
          }
        })
      });

      // Redirect to convocation dashboard if QR data exists, otherwise to map
      router.push(qrData ? '/convocation' : '/map');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/srf-symbol.png"
          alt="SRF Symbol"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to YAS Connect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {qrData ? `Join ${qrData.eventName}` : 'Join the global SRF community'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!showQRScanner && !showRegistration && (
            <div className="space-y-6">
              <button
                onClick={() => setShowQRScanner(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan Convocation QR Code
              </button>
              <button
                onClick={() => setShowRegistration(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Manual Registration
              </button>
            </div>
          )}

          {showQRScanner && (
            <div className="space-y-4">
              <QRScanner
                onScanSuccess={handleQRScanSuccess}
                onScanError={handleQRScanError}
              />
              <button
                onClick={() => setShowQRScanner(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
            </div>
          )}

          {showRegistration && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Lesson Number */}
              <div>
                <label htmlFor="lessonNumber" className="block text-sm font-medium text-gray-700">
                  Lesson Number
                </label>
                <input
                  {...register('lessonNumber')}
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.lessonNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.lessonNumber.message}</p>
                )}
              </div>

              {/* Home Center */}
              <div>
                <label htmlFor="homeCenter" className="block text-sm font-medium text-gray-700">
                  Home Center
                </label>
                <select
                  {...register('homeCenter')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a center</option>
                  {centerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.homeCenter && (
                  <p className="mt-1 text-sm text-red-600">{errors.homeCenter.message}</p>
                )}
              </div>

              {/* Kriyaban Status */}
              <div className="flex items-center">
                <input
                  {...register('isKriyaban')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isKriyaban" className="ml-2 block text-sm text-gray-700">
                  Are you a Kriyaban?
                </label>
              </div>

              {/* Devotee Since */}
              <div>
                <label htmlFor="devoteeSince" className="block text-sm font-medium text-gray-700">
                  Devotee Since (Year)
                </label>
                <input
                  {...register('devoteeSince')}
                  type="text"
                  placeholder="e.g., 2005 or 2023-01-15"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.devoteeSince && (
                  <p className="mt-1 text-sm text-red-600">{errors.devoteeSince.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 