import { useState } from 'react'
import { submitContactForm } from '../lib/firebase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { name, email, message } = form
    if (!name || !email || !message || status === 'loading') return
    setStatus('loading')
    try {
      await submitContactForm(name, email, message)
      setStatus('success')
    } catch {
      setStatus('idle')
      alert('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <section className="contact-v2" id="contact">
        <div className="contact-v2-inner">
          <p className="contact-v2-eyebrow">Contact</p>
          <h2 className="contact-v2-heading">Message received.</h2>
          <p className="contact-v2-sub">We read every message. We'll be in touch soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="contact-v2" id="contact">
      <div className="contact-v2-inner">
        <p className="contact-v2-eyebrow">Contact</p>
        <h2 className="contact-v2-heading">Say hey.</h2>
        <h2 className="contact-v2-heading">We'd love to hear from you.</h2>
        <p className="contact-v2-sub">
          Have questions or feedback? Send us a message and we'll respond as soon as possible.
        </p>

        <form className="contact-v2-form" onSubmit={handleSubmit}>
          <div className="contact-v2-row">
            <div className="contact-v2-field">
              <label htmlFor="contactName">Name *</label>
              <input
                type="text"
                id="contactName"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="contact-v2-field">
              <label htmlFor="contactEmail">Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="contact-v2-field">
            <label htmlFor="contactMessage">Message *</label>
            <textarea
              id="contactMessage"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what's on your mind..."
              rows="5"
              required
            />
          </div>

          <div className="contact-v2-footer">
            <p className="contact-v2-note">We read every message.</p>
            <button
              type="submit"
              className={`contact-v2-btn${status === 'loading' ? ' loading' : ''}`}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Send message →'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
