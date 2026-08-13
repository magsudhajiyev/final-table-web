import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let adminAuth = null
async function getFirebaseAuth() {
  if (adminAuth) return adminAuth
  const admin = await import('firebase-admin')
  if (admin.getApps().length === 0) {
    const env = loadEnv('', process.cwd(), '')
    const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.cert(JSON.parse(serviceAccount)) })
    } else {
      admin.initializeApp({ projectId: 'poker-tracker-52df8' })
    }
  }
  const { getAuth } = await import('firebase-admin/auth')
  adminAuth = getAuth()
  return adminAuth
}

function apiDevPlugin() {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use('/api/list-auth-users', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        try {
          const auth = await getFirebaseAuth()
          const users = []
          let nextPageToken
          do {
            const listResult = await auth.listUsers(1000, nextPageToken)
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
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ users }))
        } catch (err) {
          console.error('[list-auth-users]', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/delete-auth-user', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        let body = ''
        for await (const chunk of req) body += chunk
        const { uid } = JSON.parse(body)
        if (!uid) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing required field: uid' }))
        }
        try {
          const auth = await getFirebaseAuth()
          await auth.deleteUser(uid)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ success: true, alreadyDeleted: true }))
          }
          console.error('[delete-auth-user]', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/list-templates', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const env = loadEnv('', process.cwd(), '')
        const key = env.RESEND_API_KEY
        if (!key) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
        }
        try {
          const response = await fetch('https://api.resend.com/templates', {
            headers: { 'Authorization': `Bearer ${key}` },
          })
          const data = await response.text()
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/list-inbox', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const env = loadEnv('', process.cwd(), '')
        const key = env.RESEND_API_KEY
        if (!key) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
        }
        try {
          const url = new URL('https://api.resend.com/emails/receiving')
          const params = new URL(req.originalUrl || req.url, 'http://localhost').searchParams
          if (params.get('limit')) url.searchParams.set('limit', params.get('limit'))
          if (params.get('after')) url.searchParams.set('after', params.get('after'))
          if (params.get('before')) url.searchParams.set('before', params.get('before'))
          const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${key}` },
          })
          const raw = await response.text()
          // Mirror api/list-inbox.js: drop emails from blocked sender domains.
          const BLOCKED_FROM_DOMAINS = ['focusapps.app']
          let data = raw
          try {
            const json = JSON.parse(raw)
            if (Array.isArray(json?.data)) {
              json.data = json.data.filter((email) => {
                const addr = String(email?.from || '').toLowerCase()
                return !BLOCKED_FROM_DOMAINS.some((d) => addr.includes('@' + d) || addr.endsWith(d))
              })
            }
            data = JSON.stringify(json)
          } catch {
            // Non-JSON (e.g. error body) — pass through untouched.
          }
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/get-email', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const env = loadEnv('', process.cwd(), '')
        const key = env.RESEND_API_KEY
        if (!key) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
        }
        try {
          const params = new URL(req.originalUrl || req.url, 'http://localhost').searchParams
          const id = params.get('id')
          if (!id) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Missing required query param: id' }))
          }
          const response = await fetch(`https://api.resend.com/emails/receiving/${id}`, {
            headers: { 'Authorization': `Bearer ${key}` },
          })
          const data = await response.text()
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const env = loadEnv('', process.cwd(), '')
        const key = env.RESEND_API_KEY
        if (!key) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
        }
        let body = ''
        for await (const chunk of req) body += chunk
        const { to, subject, html, templateId, variables, headers: customHeaders } = JSON.parse(body)
        if (!to) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing required field: to' }))
        }
        const payload = { from: 'Final Table <contact@finaltable.io>', to: Array.isArray(to) ? to : [to] }
        if (templateId) {
          payload.template = { id: templateId }
          if (variables) payload.template.variables = variables
          if (subject) payload.subject = subject
        } else {
          if (!subject || !html) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Missing required fields: subject, html (or use templateId)' }))
          }
          payload.subject = subject
          payload.html = html
        }
        if (customHeaders) payload.headers = customHeaders
        try {
          console.log('[send-email] API key:', key.slice(0, 10) + '...')
          console.log('[send-email] Payload:', JSON.stringify(payload, null, 2))
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await response.text()
          console.log('[send-email] Response:', response.status, data)
          if (!response.ok) console.error('[send-email] Resend error:', response.status, data)
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      server.middlewares.use('/api/send-welcome', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const env = loadEnv('', process.cwd(), '')
        const key = env.RESEND_API_KEY
        if (!key) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
        }
        let body = ''
        for await (const chunk of req) body += chunk
        const { to, platform } = JSON.parse(body)
        if (!to) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing required field: to' }))
        }
        try {
          const html = readFileSync(resolve(process.cwd(), 'src/email-templates/welcome.html'), 'utf-8')
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Final Table <contact@finaltable.io>',
              to: Array.isArray(to) ? to : [to],
              subject: 'Welcome to Final Table!',
              html,
            }),
          })
          const data = await response.text()
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
          // Auto-fire iOS beta invite
          if (platform === 'ios') {
            setTimeout(async () => {
              try {
                const betaHtml = readFileSync(resolve(process.cwd(), 'src/email-templates/ios-beta.html'), 'utf-8')
                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    from: 'Final Table <contact@finaltable.io>',
                    to: Array.isArray(to) ? to : [to],
                    subject: 'Your Final Table beta access is ready — iOS',
                    html: betaHtml,
                  }),
                })
              } catch (err) { console.error('[send-welcome] iOS beta invite failed:', err.message) }
            }, 2000)
          }
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
})
