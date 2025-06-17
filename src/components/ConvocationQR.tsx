'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface ConvocationQRProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

export default function ConvocationQR({ eventId, eventName, eventDate, eventLocation }: ConvocationQRProps) {
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    // Create QR code data object
    const qrData = {
      type: 'srf_convocation',
      eventId,
      eventName,
      eventDate,
      eventLocation,
      timestamp: new Date().toISOString()
    };

    // Generate QR code
    QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    .then(url => {
      setQrCode(url);
    })
    .catch(err => {
      console.error('Error generating QR code:', err);
    });
  }, [eventId, eventName, eventDate, eventLocation]);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">YAS Connect QR Code</h2>
      {qrCode ? (
        <div className="relative">
          <img src={qrCode} alt="Convocation QR Code" className="w-64 h-64" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/srf-symbol.png"
              alt="SRF Symbol"
              className="w-16 h-16 bg-white rounded-full p-2"
            />
          </div>
        </div>
      ) : (
        <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
      )}
      <p className="mt-4 text-sm text-gray-600">
        Scan this QR code to join the convocation
      </p>
    </div>
  );
} 