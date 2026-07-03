import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, setDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy, updateDoc, deleteDoc } from 'firebase/firestore'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'

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
export const db = getFirestore(app)
const auth = getAuth(app)

export const SUPER_ADMIN_EMAIL = 'magsud94@gmail.com'
export const ADMIN_EMAILS = ['magsud94@gmail.com', 'turalcumsud@gmail.com']

export async function signInAdmin() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  if (!ADMIN_EMAILS.includes(result.user.email)) {
    await signOut(auth)
    throw new Error('Access denied. You are not authorized to access this dashboard.')
  }
  return result.user
}

export async function signOutAdmin() { await signOut(auth) }

export function onAuthChange(callback) { return onAuthStateChanged(auth, callback) }

export async function submitToWaitlist(email, firstName = '', lastName = '', platform = '') {
  const normalizedEmail = email.toLowerCase().trim()
  const q = query(collection(db, 'waitlist'), where('email', '==', normalizedEmail))
  const existing = await getDocs(q)

  if (!existing.empty) {
    const existingDoc = existing.docs[0]
    const data = existingDoc.data()
    if (data.platform) return { status: 'already' }
    if (platform) {
      await updateDoc(doc(db, 'waitlist', existingDoc.id), { platform })
      return { status: 'updated' }
    }
    return { status: 'already' }
  }

  await addDoc(collection(db, 'waitlist'), {
    email: normalizedEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    platform,
    source: 'final-table',
    timestamp: serverTimestamp()
  })
  return { status: 'new' }
}

export async function submitNicknameClaim(nickname, email, firstName = '', lastName = '', platform = '') {
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
    platform,
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

export async function getAppUsers() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || null, lastLogin: data.lastLogin?.toDate?.() || null }
  })
}

export async function updateAppUser(id, data) { await updateDoc(doc(db, 'users', id), data) }
export async function deleteAppUser(id) { await deleteDoc(doc(db, 'users', id)) }

export async function getUserStats(userId) {
  const d = await getDoc(doc(db, 'user_stats', userId))
  if (!d.exists()) return null
  return { id: d.id, ...d.data() }
}

export async function getUserOpponents(userId) {
  const snap = await getDocs(query(collection(db, 'opponents'), where('userId', '==', userId)))
  return snap.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || null, lastSeenAt: data.lastSeenAt?.toDate?.() || null }
  })
}

export async function getOpponentStats(opponentIds) {
  if (!opponentIds.length) return {}
  const results = {}
  for (const id of opponentIds) {
    const d = await getDoc(doc(db, 'opponent_stats', id))
    if (d.exists()) results[id] = d.data()
  }
  return results
}

export async function getUserSessions(userId) {
  const snap = await getDocs(query(collection(db, 'poker_sessions'), where('userId', '==', userId)))
  return snap.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || null, startTime: data.startTime?.toDate?.() || null, endTime: data.endTime?.toDate?.() || null }
  })
}

export async function getUserSessionResults(userId) {
  const snap = await getDocs(query(collection(db, 'session_results'), where('userId', '==', userId)))
  return snap.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, timestamp: data.timestamp?.toDate?.() || null }
  })
}

export async function getUserHands(userId) {
  const snap = await getDocs(query(collection(db, 'shared_hands'), where('createdBy', '==', userId)))
  return snap.docs.map(d => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || null }
  })
}

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

// Email templates
export async function getEmailTemplates() {
  const q = query(collection(db, 'email_templates'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({
    id: d.id, ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
    updatedAt: d.data().updatedAt?.toDate?.() || null
  }))
}

export async function saveEmailTemplate(data) {
  return addDoc(collection(db, 'email_templates'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export async function updateEmailTemplate(id, data) {
  await updateDoc(doc(db, 'email_templates', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteEmailTemplate(id) { await deleteDoc(doc(db, 'email_templates', id)) }

// Email logs
export async function saveEmailLog(data) {
  return addDoc(collection(db, 'email_logs'), { ...data, sentAt: serverTimestamp() })
}

export async function getEmailLogs() {
  const q = query(collection(db, 'email_logs'), orderBy('sentAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({
    id: d.id, ...d.data(),
    sentAt: d.data().sentAt?.toDate?.() || null
  }))
}

// Inbox replies
export async function saveInboxReply(data) {
  return addDoc(collection(db, 'inbox_replies'), { ...data, sentAt: serverTimestamp() })
}

export async function getInboxReplies(emailId) {
  const q = query(collection(db, 'inbox_replies'), where('emailId', '==', emailId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({
    id: d.id, ...d.data(),
    sentAt: d.data().sentAt?.toDate?.() || null
  })).sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0))
}

// Inbox email status (soft delete / archive)
export async function setInboxEmailStatus(emailId, status) {
  // status: 'deleted' | 'archived' | null (null = restore to inbox)
  await setDoc(doc(db, 'inbox_status', emailId), { status, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getAllInboxStatuses() {
  const snapshot = await getDocs(collection(db, 'inbox_status'))
  const map = {}
  snapshot.docs.forEach(d => { map[d.id] = d.data() })
  return map
}

export async function markInboxEmailRead(emailId) {
  await setDoc(doc(db, 'inbox_status', emailId), { read: true, updatedAt: serverTimestamp() }, { merge: true })
}
