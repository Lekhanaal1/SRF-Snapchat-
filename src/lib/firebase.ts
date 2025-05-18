import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDZOdNgx1PsIosFlU6SC8hWQntLs0OVsQQ",
  authDomain: "srf-connect.firebaseapp.com",
  projectId: "srf-connect",
  storageBucket: "srf-connect.firebasestorage.app",
  messagingSenderId: "33135850468",
  appId: "1:33135850468:web:8ab41c13813beb820acdf1",
  measurementId: "G-DZ049RK9FZ"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Initialize Analytics only on the client side
let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)))
}

export { app, db, auth, storage, analytics } 