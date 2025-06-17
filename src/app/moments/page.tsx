import { Metadata } from 'next'
import ConvocationMoments from '@/components/ConvocationMoments'

export const metadata: Metadata = {
  title: 'Convocation Moments - SRF Convocation',
  description: 'Share and view special moments from SRF convocations around the world'
}

export default function MomentsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Convocation Moments</h1>
      <ConvocationMoments />
    </div>
  )
} 