export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' })
  }

  const { id } = req.query || {}
  if (!id) {
    return res.status(400).json({ error: 'Missing required query param: id' })
  }

  try {
    const response = await fetch(`https://api.resend.com/emails/receiving/${id}`, {
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
