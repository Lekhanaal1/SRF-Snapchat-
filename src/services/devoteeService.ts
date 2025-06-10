import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, GeoPoint, orderBy, limit, startAfter } from 'firebase/firestore';
import { DevoteeProfile, DevoteeFilters, MapBounds } from '@/types/devotee';

const DEVOTEES_COLLECTION = 'devotees';

export const devoteeService = {
  // Add a new devotee profile
  async addDevotee(profile: Omit<DevoteeProfile, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'isVisible'>) {
    const docRef = await addDoc(collection(db, DEVOTEES_COLLECTION), {
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: false, // Requires admin approval
      isVisible: false, // Only visible after approval
    });
    return docRef.id;
  },

  // Update a devotee profile
  async updateDevotee(id: string, updates: Partial<DevoteeProfile>) {
    const docRef = doc(db, DEVOTEES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  // Get devotees within map bounds
  async getDevoteesInBounds(bounds: MapBounds, filters?: DevoteeFilters) {
    const q = query(
      collection(db, DEVOTEES_COLLECTION),
      where('isApproved', '==', true),
      where('isVisible', '==', true),
      where('location.coordinates.0', '>=', bounds.west),
      where('location.coordinates.0', '<=', bounds.east),
      where('location.coordinates.1', '>=', bounds.south),
      where('location.coordinates.1', '<=', bounds.north),
      orderBy('location.coordinates.0'),
      orderBy('location.coordinates.1'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DevoteeProfile[];
  },

  // Get devotees by filters
  async getDevoteesByFilters(filters: DevoteeFilters, lastDoc?: any) {
    let q = query(
      collection(db, DEVOTEES_COLLECTION),
      where('isApproved', '==', true),
      where('isVisible', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    if (filters.country) {
      q = query(q, where('country', '==', filters.country));
    }
    if (filters.city) {
      q = query(q, where('city', '==', filters.city));
    }
    if (filters.profession) {
      q = query(q, where('profession', '==', filters.profession));
    }
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      devotees: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DevoteeProfile[],
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  },

  // Get devotee statistics
  async getDevoteeStats() {
    const stats = {
      totalDevotees: 0,
      byCountry: {} as Record<string, number>,
      byProfession: {} as Record<string, number>,
      lessonRanges: {
        '1-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51+': 0
      }
    };

    const snapshot = await getDocs(collection(db, DEVOTEES_COLLECTION));
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as DevoteeProfile;
      if (data.isApproved && data.isVisible) {
        stats.totalDevotees++;
        
        // Count by country
        stats.byCountry[data.country] = (stats.byCountry[data.country] || 0) + 1;
        
        // Count by profession
        if (data.profession) {
          stats.byProfession[data.profession] = (stats.byProfession[data.profession] || 0) + 1;
        }
        
        // Count by lesson range
        if (data.lessonNumber) {
          const range = Math.ceil(data.lessonNumber / 10) * 10;
          const key = range <= 50 ? `${range-9}-${range}` : '51+';
          stats.lessonRanges[key as keyof typeof stats.lessonRanges]++;
        }
      }
    });

    return stats;
  }
}; 