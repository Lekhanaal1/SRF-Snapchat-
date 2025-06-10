import { useState, useEffect } from 'react'
import { collection, addDoc, query, onSnapshot, orderBy, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Devotee } from '@/types/devotee'

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
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
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

  const addDevotee = async (devoteeData: Omit<Devotee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'devotees'), {
        ...devoteeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return docRef.id
    } catch (err) {
      console.error('Error adding devotee:', err)
      throw err
    }
  }

  const updateDevotee = async (id: string, data: Partial<Devotee>) => {
    try {
      const devoteeRef = doc(db, 'devotees', id)
      await updateDoc(devoteeRef, {
        ...data,
        updatedAt: new Date(),
      })
    } catch (err) {
      console.error('Error updating devotee:', err)
      throw err
    }
  }

  const deleteDevotee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'devotees', id))
    } catch (err) {
      console.error('Error deleting devotee:', err)
      throw err
    }
  }

  return {
    devotees,
    loading,
    error,
    addDevotee,
    updateDevotee,
    deleteDevotee,
  }
} 