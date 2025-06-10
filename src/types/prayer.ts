import { Timestamp } from 'firebase/firestore'

export interface PrayerRequest {
  id: string
  title: string
  description: string
  isAnonymous: boolean
  requesterId?: string
  requesterName?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  status: 'active' | 'fulfilled' | 'archived'
  responses: PrayerResponse[]
}

export interface PrayerResponse {
  id: string
  responderId: string
  responderName: string
  message: string
  createdAt: Timestamp
  isPrivate: boolean
}

export interface PrayerRequestFormData {
  title: string
  description: string
  isAnonymous: boolean
} 