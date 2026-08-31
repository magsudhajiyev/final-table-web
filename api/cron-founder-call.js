import './_admin.js'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { FOUNDER_CALL_SUBJECT, FOUNDER_CALL_HTML } from './_founder-call-email.js'

// Daily Vercel cron (see vercel.json "crons"): emails the founder-call invite
// to every user 30 days after signup. The window has a 7-day tail so a few
// failed runs can't permanently skip anyone, while users older than 37 days
// (i.e. everyone who signed up before this feature existed) are never emailed.
const MIN_AGE_DAYS = 30
const MAX_AGE_DAYS = 37

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vercel sends "Authorization: Bearer $CRON_SECRET" when the env var is set.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' })
  }

  try {
    const auth = getAuth()
    const db = getFirestore()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    // Collect eligible users: signed up 30–37 days ago, has an email.
    const eligible = []
    let nextPageToken
    do {
      const page = await auth.listUsers(1000, nextPageToken)
      for (const user of page.users) {
        if (!user.email || !user.metadata.creationTime) continue
        const ageDays = (now - Date.parse(user.metadata.creationTime)) / dayMs
        if (ageDays >= MIN_AGE_DAYS && ageDays < MAX_AGE_DAYS) eligible.push(user)
      }
      nextPageToken = page.pageToken
    } while (nextPageToken)

    const sent = []
    const failed = []
    for (const user of eligible) {
      // Dedup: one send per uid, ever. Recorded before sending so a crash
      // between send and write can't double-email; a failed send clears it.
      const ref = db.collection('founder_call_sends').doc(user.uid)
      const created = await ref.create({
        email: user.email,
        signedUpAt: user.metadata.creationTime,
        sentAt: FieldValue.serverTimestamp(),
      }).then(() => true, (err) => {
        if (err.code === 6 /* ALREADY_EXISTS */) return false
        throw err
      })
      if (!created) continue

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Final Table <contact@finaltable.io>',
            to: [user.email],
            subject: FOUNDER_CALL_SUBJECT,
            html: FOUNDER_CALL_HTML,
          }),
        })
        if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
        sent.push(user.email)
      } catch (err) {
        console.error(`founder-call send failed for ${user.email}:`, err)
        failed.push(user.email)
        await ref.delete().catch(() => {}) // let a later run retry within the window
      }
      await new Promise(r => setTimeout(r, 100))
    }

    // Surface the run in the admin Email > History tab.
    if (sent.length || failed.length) {
      await db.collection('email_logs').add({
        subject: FOUNDER_CALL_SUBJECT,
        body: FOUNDER_CALL_HTML,
        recipientCount: sent.length,
        recipientEmails: sent,
        filters: { source: 'cron-founder-call' },
        status: failed.length === 0 ? 'sent' : sent.length === 0 ? 'failed' : 'partial',
        failedEmails: failed,
        sentAt: FieldValue.serverTimestamp(),
      })
    }

    return res.status(200).json({ eligible: eligible.length, sent: sent.length, failed })
  } catch (err) {
    console.error('cron-founder-call error:', err)
    return res.status(500).json({ error: err.message })
  }
}
