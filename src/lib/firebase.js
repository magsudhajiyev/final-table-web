import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

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

export async function submitNicknameClaim(nickname, email) {
  const normalized = nickname.toLowerCase().trim()

  // Check if taken by live user
  const usernameDoc = await getDoc(doc(db, 'usernames', normalized))
  if (usernameDoc.exists()) return { taken: true }

  // Check if already claimed via web
  const q = query(
    collection(db, 'nickname_claims'),
    where('nickname', '==', normalized),
    where('status', '==', 'pending')
  )
  const existing = await getDocs(q)
  if (!existing.empty) return { taken: true }

  // Save claim
  await addDoc(collection(db, 'nickname_claims'), {
    nickname: normalized,
    email: email.toLowerCase().trim(),
    source: 'final-table-web',
    timestamp: serverTimestamp(),
    status: 'pending'
  })
  return { taken: false }
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
