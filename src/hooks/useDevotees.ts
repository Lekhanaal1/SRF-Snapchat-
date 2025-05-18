import { useState, useEffect } from 'react'
import { collection, addDoc, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Devotee {
  id: string
  name: string
  city: string
  country: string
  lessonRange: string
  profession?: string
  favoriteQuote?: string
  shareLocation: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  createdAt: Timestamp
}

export function useDevotees() {
  const [devotees, setDevotees] = useState<Devotee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'devotees'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const devoteeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Devotee[]
        setDevotees(devoteeData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching devotees:', err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addDevotee = async (devoteeData: Omit<Devotee, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'devotees'), {
        ...devoteeData,
        createdAt: Timestamp.now()
      })
      return docRef.id
    } catch (err) {
      console.error('Error adding devotee:', err)
      throw err
    }
  }

  return {
    devotees,
    loading,
    error,
    addDevotee
  }
} 