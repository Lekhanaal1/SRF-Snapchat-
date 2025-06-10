import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { PrayerRequest, PrayerRequestFormData, PrayerResponse } from '@/types/prayer'

const PRAYER_REQUESTS_COLLECTION = 'prayerRequests'

export const prayerService = {
  // Add a new prayer request
  async addPrayerRequest(data: PrayerRequestFormData, userId: string, userName: string) {
    const docRef = await addDoc(collection(db, PRAYER_REQUESTS_COLLECTION), {
      ...data,
      requesterId: data.isAnonymous ? undefined : userId,
      requesterName: data.isAnonymous ? undefined : userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      responses: []
    })
    return docRef.id
  },

  // Get all active prayer requests
  async getActivePrayerRequests() {
    const q = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PrayerRequest[]
  },

  // Add a response to a prayer request
  async addPrayerResponse(
    requestId: string, 
    response: Omit<PrayerResponse, 'id' | 'createdAt'>,
    isPrivate: boolean
  ) {
    const requestRef = doc(db, PRAYER_REQUESTS_COLLECTION, requestId)
    const newResponse = {
      ...response,
      id: crypto.randomUUID(),
      createdAt: serverTimestamp(),
      isPrivate
    }

    await updateDoc(requestRef, {
      responses: [...(await this.getPrayerRequest(requestId)).responses, newResponse],
      updatedAt: serverTimestamp()
    })

    return newResponse
  },

  // Get a single prayer request
  async getPrayerRequest(requestId: string) {
    const docRef = doc(db, PRAYER_REQUESTS_COLLECTION, requestId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Prayer request not found')
    }
    return { id: docSnap.id, ...docSnap.data() } as PrayerRequest
  },

  // Update prayer request status
  async updatePrayerRequestStatus(requestId: string, status: PrayerRequest['status']) {
    const requestRef = doc(db, PRAYER_REQUESTS_COLLECTION, requestId)
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    })
  }
} 