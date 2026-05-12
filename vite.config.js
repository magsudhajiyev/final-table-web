import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function apiDevPlugin() {
  return {
    name: 'api-dev',
    configureServer(server) {
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
          const data = await response.text()
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
        const { to } = JSON.parse(body)
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
