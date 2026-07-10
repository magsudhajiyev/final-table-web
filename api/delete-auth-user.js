import admin from './_admin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid } = req.body || {}
  if (!uid) {
    return res.status(400).json({ error: 'Missing required field: uid' })
  }

  try {
    await admin.auth().deleteUser(uid)
    return res.status(200).json({ success: true })
  } catch (err) {
    // If user already deleted from Auth, treat as success
    if (err.code === 'auth/user-not-found') {
      return res.status(200).json({ success: true, alreadyDeleted: true })
    }
    console.error('Failed to delete auth user:', err)
    return res.status(500).json({ error: err.message })
  }
}
