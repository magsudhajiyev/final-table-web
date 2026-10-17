import './_admin.js'
import { getFirestore } from 'firebase-admin/firestore'

// Engagement-notification pipeline reader for the admin dashboard.
// Reads `notification_events` with the Admin SDK (bypasses the owner-only
// rules) and joins usernames so the timeline is human-readable.
// Query params: limit (default 300, max 1000), type, uid — all optional.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const db = getFirestore()
    const limit = Math.min(parseInt(req.query.limit, 10) || 300, 1000)
    const { type, uid } = req.query

    // Single-field orderBy only (auto-indexed); type/uid filters are applied
    // in memory so no composite index is ever required.
    const snap = await db.collection('notification_events')
      .orderBy('createdAt', 'desc').limit(limit).get()
    const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null)
    let rows = snap.docs.map((d) => {
      const x = d.data()
      return {
        id: d.id,
        uid: x.uid || null,
        type: x.type || 'unknown',
        coach: x.coach || 'neutral',
        variantId: x.variantId ?? null,
        source: x.source || 'server',
        scheduledHourLocal: x.scheduledHourLocal ?? null,
        dayKey: x.dayKey || null,
        sentAt: ms(x.sentAt),
        createdAt: ms(x.createdAt),
        openedAt: ms(x.openedAt),
        playedAt: ms(x.playedAt),
        cancelledAt: ms(x.cancelledAt),
        cancelled: x.cancelled === true,
        converted: x.convertedWithin2h === true,
      }
    })

    if (type) rows = rows.filter((r) => r.type === type)
    if (uid) rows = rows.filter((r) => r.uid === uid)

    // Join usernames for readability (chunked getAll, 100 refs per call).
    const uids = [...new Set(rows.map((r) => r.uid).filter(Boolean))]
    const names = {}
    for (let i = 0; i < uids.length; i += 100) {
      const chunk = uids.slice(i, i + 100)
      const docs = await db.getAll(...chunk.map((u) => db.collection('users').doc(u)))
      for (const doc of docs) {
        if (doc.exists) {
          const u = doc.data()
          names[doc.id] = u.username || u.displayName || null
        }
      }
    }
    for (const r of rows) r.username = names[r.uid] || null

    return res.status(200).json({ rows })
  } catch (err) {
    console.error('notification-events error:', err)
    return res.status(500).json({ error: err.message })
  }
}
