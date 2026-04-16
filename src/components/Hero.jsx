import { useState } from 'react'
import { submitToWaitlist } from '../lib/firebase'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('Be the first to know when we launch. No spam, ever.')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      await submitToWaitlist(email)
      setStatus('success')
      setNote("Thanks for joining! We'll notify you when we launch.")
      setEmail('')
    } catch {
      setStatus('error')
      setNote('Something went wrong. Please try again.')
      setTimeout(() => {
        setStatus('idle')
        setNote('Be the first to know when we launch. No spam, ever.')
      }, 3000)
    }
  }

  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">
          <span className="dynamic-word" style={{ animationDelay: '0.10s' }}>Your</span>{' '}
          <span className="dynamic-word" style={{ animationDelay: '0.18s' }}>poker</span>{' '}
          <span className="dynamic-word" style={{ animationDelay: '0.26s' }}>game,</span><br />
          <span className="dynamic-word" style={{ animationDelay: '0.34s' }}>fully</span>{' '}
          <span className="dynamic-word" style={{ animationDelay: '0.42s' }}>tracked.</span>
        </h1>
        <p className="hero-subtitle">
          Log hands. Track stats. Run clubs. The all-in-one poker companion.
        </p>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <div className="waitlist-input-wrapper">
            <input
              type="email"
              placeholder="Enter your email address"
              className="email-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`waitlist-button${status === 'success' ? ' success' : ''}${status === 'loading' ? ' loading' : ''}`}
              disabled={status === 'loading' || status === 'success'}
            >
              <span className="button-front">Join Waitlist</span>
              <span className="button-back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </form>
        <p className={`waitlist-note${status === 'success' ? ' success-message' : ''}${status === 'error' ? ' error-message' : ''}`}>
          {note}
        </p>
      </div>
    </section>
  )
}
