export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' })
  }

  const url = new URL('https://api.resend.com/emails/receiving')
  const { limit, after, before } = req.query || {}
  if (limit) url.searchParams.set('limit', limit)
  if (after) url.searchParams.set('after', after)
  if (before) url.searchParams.set('before', before)

  try {
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${key}` },
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
