export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' })
  }

  const { to, subject, html, templateId, variables, headers } = req.body || {}
  if (!to) {
    return res.status(400).json({ error: 'Missing required field: to' })
  }

  // Build payload — template mode or raw HTML mode
  const payload = {
    from: 'Final Table <contact@finaltable.io>',
    to: Array.isArray(to) ? to : [to],
  }

  if (templateId) {
    // Resend template mode: subject is optional (template has default)
    payload.template = { id: templateId }
    if (variables) payload.template.variables = variables
    if (subject) payload.subject = subject
  } else {
    if (!subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: subject, html (or use templateId)' })
    }
    payload.subject = subject
    payload.html = html
  }

  if (headers) payload.headers = headers

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
