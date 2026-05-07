import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy, updateDoc, deleteDoc } from 'firebase/firestore'

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

export async function submitToWaitlist(email, firstName = '', lastName = '') {
  await addDoc(collection(db, 'waitlist'), {
    email,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    source: 'final-table',
    timestamp: serverTimestamp()
  })
}

export async function submitNicknameClaim(nickname, email, firstName = '', lastName = '') {
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
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    source: 'final-table-web',
    timestamp: serverTimestamp(),
    status: 'pending'
  })
  return { taken: false }
}

export async function getWaitlistUsers() {
  const q = query(collection(db, 'waitlist'), orderBy('timestamp', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || null }))
}

export async function updateWaitlistUser(id, data) { await updateDoc(doc(db, 'waitlist', id), data) }
export async function deleteWaitlistUser(id) { await deleteDoc(doc(db, 'waitlist', id)) }

export async function getNicknameClaims() {
  const q = query(collection(db, 'nickname_claims'), orderBy('timestamp', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || null }))
}

export async function updateNicknameClaim(id, data) { await updateDoc(doc(db, 'nickname_claims', id), data) }
export async function deleteNicknameClaim(id) { await deleteDoc(doc(db, 'nickname_claims', id)) }

export async function getContactSubmissions() {
  const q = query(collection(db, 'contact_submissions'), orderBy('timestamp', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || null }))
}

export async function updateContactSubmission(id, data) { await updateDoc(doc(db, 'contact_submissions', id), data) }
export async function deleteContactSubmission(id) { await deleteDoc(doc(db, 'contact_submissions', id)) }

export async function getSharedHands() {
  const snapshot = await getDocs(collection(db, 'shared_hands'))
  return snapshot.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, timestamp: data.timestamp?.toDate?.() || data.createdAt?.toDate?.() || null }
  })
}

export async function deleteSharedHand(id) { await deleteDoc(doc(db, 'shared_hands', id)) }

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
