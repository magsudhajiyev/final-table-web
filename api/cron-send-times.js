import './_admin.js'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Daily Vercel cron (see vercel.json "crons"): computes each user's best
// ACTIVE HOUR (UTC) and writes it to users/{uid}.notif.activeHourUtc so the
// hourly scheduleEngagement CF can fire pushes around when they actually open
// the app (Duolingo send-time optimization).
//
// Primary signal = PostHog event timestamps (one grouped HogQL query covers
// ALL users — the 120/hr query limit forbids per-user calls). Requires a
// PostHog PERSONAL API key (phx_, read scope) in POSTHOG_PERSONAL_KEY +
// POSTHOG_PROJECT_ID. When that key is absent, falls back to the hour of
// users/{uid}.lastActiveAt (coarse but always available) so the scheduler
// still has a signal before the key is set up.
//
// Hours are stored in UTC; the scheduler converts to the user's local hour
// via the tzOffsetMinutes the app writes on prefs load. See
// docs/features/engagement-notifications-plan.md §12.

const POSTHOG_HOST = 'https://eu.posthog.com'
const MIN_SAMPLE = 5 // events needed before we trust a PostHog modal hour

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
    let source = 'posthog'
    let hoursByUid = await fetchActiveHoursFromPostHog()

    if (!hoursByUid) {
      source = 'lastActiveAt'
      hoursByUid = await fallbackFromLastActive(db)
    }

    // Write in batches (Firestore caps at 500 writes/batch).
    const entries = Object.entries(hoursByUid)
    let written = 0
    for (let i = 0; i < entries.length; i += 450) {
      const batch = db.batch()
      for (const [uid, info] of entries.slice(i, i + 450)) {
        batch.set(
          db.collection('users').doc(uid),
          {
            notif: {
              activeHourUtc: info.hour,
              activeHourSampleSize: info.sample,
              activeHourSource: source,
              sendTimeUpdatedAt: Timestamp.now(),
            },
          },
          { merge: true }
        )
        written++
      }
      await batch.commit()
    }

    return res.status(200).json({ source, users: written })
  } catch (err) {
    console.error('cron-send-times error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// One grouped HogQL query → { uid: {hour, sample} } (modal UTC hour per user).
// Returns null when the personal key is not configured, so the caller falls
// back to lastActiveAt.
async function fetchActiveHoursFromPostHog() {
  const key = process.env.POSTHOG_PERSONAL_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  if (!key || !projectId) return null

  const query = `
    SELECT distinct_id AS uid, toHour(timestamp) AS h, count() AS c
    FROM events
    WHERE timestamp > now() - INTERVAL 30 DAY
      AND event IN ('$pageview','Application Opened','daily_challenge_opened',
                    'daily_challenge_completed','session_ended','hand_logged')
    GROUP BY uid, h
  `
  const resp = await fetch(`${POSTHOG_HOST}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  })
  if (!resp.ok) {
    console.error('PostHog query failed:', resp.status, await resp.text())
    return null // fall back rather than fail the whole job
  }
  const data = await resp.json()

  // Rows are [uid, hour, count]; pick the argmax hour per uid.
  const best = {} // uid → {hour, max, total}
  for (const [uid, h, c] of data.results || []) {
    if (!uid) continue
    const e = best[uid] || (best[uid] = { hour: h, max: 0, total: 0 })
    e.total += c
    if (c > e.max) {
      e.max = c
      e.hour = h
    }
  }
  const out = {}
  for (const [uid, e] of Object.entries(best)) {
    if (e.total >= MIN_SAMPLE) out[uid] = { hour: e.hour, sample: e.total }
  }
  return out
}

// Fallback: the UTC hour of each user's last heartbeat. Coarse (one sample)
// but always available and better than a global default.
async function fallbackFromLastActive(db) {
  const since = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const snap = await db
    .collection('users')
    .where('lastActiveAt', '>=', since)
    .select('lastActiveAt')
    .get()
  const out = {}
  for (const doc of snap.docs) {
    const ts = doc.get('lastActiveAt')
    if (ts && typeof ts.toDate === 'function') {
      out[doc.id] = { hour: ts.toDate().getUTCHours(), sample: 1 }
    }
  }
  return out
}
