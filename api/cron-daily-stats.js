import './_admin.js'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Daily Vercel cron (see vercel.json "crons", runs 00:05 UTC): snapshots
// active-user counts into daily_stats/{YYYY-MM-DD} for the admin dashboard's
// DAU trend chart. Activity comes from users/{uid}.lastActiveAt, which the
// mobile app heartbeats on app open. Doc id is the UTC day that just ended;
// re-runs overwrite the same doc, so the job is idempotent.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const db = getFirestore()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    const countSince = async (ms) => {
      const snap = await db.collection('users')
        .where('lastActiveAt', '>=', Timestamp.fromMillis(ms))
        .count().get()
      return snap.data().count
    }

    const [dau, wau, mau, totalSnap] = await Promise.all([
      countSince(now - dayMs),
      countSince(now - 7 * dayMs),
      countSince(now - 30 * dayMs),
      db.collection('users').count().get(),
    ])
    const totalUsers = totalSnap.data().count

    const date = new Date(now - dayMs).toISOString().slice(0, 10)
    await db.collection('daily_stats').doc(date).set({
      date,
      dau,
      wau,
      mau,
      totalUsers,
      updatedAt: Timestamp.now(),
    })

    return res.status(200).json({ date, dau, wau, mau, totalUsers })
  } catch (err) {
    console.error('cron-daily-stats error:', err)
    return res.status(500).json({ error: err.message })
  }
}
