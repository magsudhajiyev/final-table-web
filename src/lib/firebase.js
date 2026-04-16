import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDTw_1lOHmIl_gDY3ex-N_l8NLxRzy6AtA",
  authDomain: "poker-tracker-52df8.firebaseapp.com",
  databaseURL: "https://poker-tracker-52df8-default-rtdb.firebaseio.com",
  projectId: "poker-tracker-52df8",
  storageBucket: "poker-tracker-52df8.firebasestorage.app",
  messagingSenderId: "311745459306",
  appId: "1:311745459306:web:4d53385d198139f8d00613",
  measurementId: "G-GZND8S84WX"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function submitToWaitlist(email) {
  await addDoc(collection(db, 'waitlist'), {
    email,
    source: 'final-table',
    timestamp: serverTimestamp()
  })
}

export async function submitContactForm(name, email, message) {
  await addDoc(collection(db, 'contact_submissions'), {
    name,
    email,
    message,
    source: 'final-table',
    timestamp: serverTimestamp(),
    status: 'new'
  })
}
