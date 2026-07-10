import admin from './_admin.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const users = []
    let nextPageToken
    do {
      const listResult = await admin.auth().listUsers(1000, nextPageToken)
      for (const user of listResult.users) {
        users.push({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          provider: user.providerData?.[0]?.providerId || 'unknown',
          createdAt: user.metadata.creationTime || null,
          lastLogin: user.metadata.lastSignInTime || null,
        })
      }
      nextPageToken = listResult.pageToken
    } while (nextPageToken)

    return res.status(200).json({ users })
  } catch (err) {
    console.error('Failed to list auth users:', err)
    return res.status(500).json({ error: err.message })
  }
}
