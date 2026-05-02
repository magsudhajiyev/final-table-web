import { useState, useEffect, useRef } from 'react'
import { useT, SUPPORTED } from './i18n'
import './LandingPage.css'
import './LegalPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru' }
function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

function LegalNavbar() {
  const { t, locale, setLocale } = useT()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const mobileLangRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target) && mobileLangRef.current && !mobileLangRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  return (
    <header className={`tp-nav-wrap tp-nav-light${scrolled ? ' tp-nav-scrolled' : ''}${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <a href="/" className="tp-nav-logo">
          <img src="/nwa_logo.svg" alt="Final Table" className="tp-nav-logo-img" />
        </a>
        <div className="tp-nav-sep" />
        <div className="tp-nav-links">
          <a href="/#how-it-works">{t('nav.howItWorks')}</a>
          <a href="/#features">{t('nav.features')}</a>
          <a href="/#compare">{t('nav.compare')}</a>
          <a href="/#faq">{t('nav.faq')}</a>
        </div>
        <div className="tp-lang-picker" ref={langRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-lang-dropdown">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-lang-option${l === locale ? ' tp-lang-option-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <Flag locale={l} />
                  <span>{t(`lang.${l}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <a href="/#reserve-form" className="tp-nav-waitlist-btn">
          {t('nav.cta')}
        </a>
        <button
          className="tp-nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`tp-nav-mobile-menu${menuOpen ? ' tp-nav-mobile-menu-open' : ''}`}>
        <a href="/#how-it-works">{t('nav.howItWorks')}</a>
        <a href="/#features">{t('nav.features')}</a>
        <a href="/#compare">{t('nav.compare')}</a>
        <a href="/#faq">{t('nav.faq')}</a>
        <div className="tp-nav-mobile-lang" ref={mobileLangRef}>
          <button className="tp-mobile-lang-current" onClick={() => setLangOpen(o => !o)}>
            <span><Flag locale={locale} /> {t(`lang.${locale}`)}</span>
            <svg className={`tp-mobile-lang-chevron${langOpen ? ' tp-mobile-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-mobile-lang-grid">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-mobile-lang-btn${l === locale ? ' tp-mobile-lang-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <Flag locale={l} /> {t(`lang.${l}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function LegalFooter() {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy' },
    { title: t('footer.terms'),    href: '/terms' },
  ]

  const resources = [
    { title: t('nav.howItWorks'),   href: '/#how-it-works' },
    { title: t('nav.features'),     href: '/#features' },
    { title: t('nav.compare'),      href: '/#compare' },
    { title: t('about.nav'),        href: '/about' },
    { title: t('nav.faq'),          href: '/#faq' },
  ]

  return (
    <footer className="mf-footer">
      <div className="mf-inner">
        <a href="/" className="mf-logo">
          <img src="/nwa_logo_dark_v2.svg" alt="Final Table" className="mf-logo-img" />
        </a>
        <div className="mf-grid">
          <div className="mf-brand">
            <div className="mf-brand-content">
              <div className="mf-headline">{t('footer.tagline')}</div>
              <p className="mf-tagline">{t('hero.sub')}</p>
            </div>
            <p className="mf-support">{t('footer.support')}</p>
          </div>
          <div className="mf-nav">
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.resources')}</span>
              {resources.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.company')}</span>
              {company.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="mf-divider" />
        <p className="mf-copy">{t('footer.copy', { year })}</p>
      </div>
    </footer>
  )
}

export default function PrivacyPage() {
  return (
    <div className="tp-root legal-root">
      <LegalNavbar />
      <main className="legal-main" data-nav-theme="light">
        <h1>Privacy Policy</h1>
        <p className="legal-effective"><strong>Effective Date:</strong> May 1, 2026 &nbsp;·&nbsp; <strong>Last Updated:</strong> April 16, 2026</p>

        <p>This Privacy Policy describes how Magsud Hajiyev, a sole proprietor based in the Republic of Azerbaijan ("we", "us", "our", or "Final Table"), collects, uses, and shares personal information when you use the <strong>Final Table</strong> mobile application and related services (together, the "Service").</p>

        <p>By using the Service, you agree to the collection and use of information in accordance with this Policy. If you do not agree, do not use the Service.</p>

        <h2>1. Who We Are</h2>
        <ul>
          <li><strong>Controller:</strong> Magsud Hajiyev (sole proprietor)</li>
          <li><strong>Country:</strong> Republic of Azerbaijan</li>
          <li><strong>Contact:</strong> <a href="mailto:support@finaltable.io">support@finaltable.io</a></li>
          <li><strong>App:</strong> Final Table (Poker Friend) — a poker hand tracking and analytics app</li>
        </ul>
        <p>For the purposes of the EU/UK General Data Protection Regulation (GDPR), Magsud Hajiyev is the <strong>data controller</strong> for personal information processed through the Service.</p>

        <h2>2. Age Requirement</h2>
        <p>The Service is intended solely for adults <strong>18 years of age or older</strong>. We do not knowingly collect personal information from anyone under 18. If we learn that we have collected information from a person under 18, we will delete it. If you believe a minor has provided us personal information, contact <a href="mailto:support@finaltable.io">support@finaltable.io</a>.</p>

        <h2>3. Information We Collect</h2>

        <h3>3.1 Information You Provide</h3>
        <ul>
          <li><strong>Account information:</strong> Email address, display name, password (hashed by Firebase Authentication), and — if you sign in with Google — your Google account identifier and basic profile.</li>
          <li><strong>Poker data:</strong> Hand logs, actions, board cards, hole cards, pot sizes, session details, buy-ins, cash-outs, stack history, bankroll goals, tags, notes, and similar content you create in the app.</li>
          <li><strong>Opponent profiles:</strong> Names, colors, and notes you associate with poker opponents.</li>
          <li><strong>Club / event data:</strong> Club memberships, roles, events, rankings, seat assignments, and any QR-based identifiers you generate or receive.</li>
          <li><strong>Support communications:</strong> Messages, screenshots, and metadata you send to <a href="mailto:support@finaltable.io">support@finaltable.io</a> or submit through in-app help.</li>
        </ul>

        <h3>3.2 Voice Audio (Dealer Mode Only)</h3>
        <p>If you use the dealer voice logging feature:</p>
        <ul>
          <li>Your device microphone records short audio segments (approximately 2.5 seconds each).</li>
          <li>These segments are transmitted to our backend and then to third-party speech recognition providers (<strong>Deepgram</strong> and/or <strong>Soniox</strong>) solely to transcribe poker actions.</li>
          <li>We do not store raw audio on our servers beyond the time needed to obtain a transcript, and we never use your voice audio for voice-print identification or biometric profiling.</li>
          <li>Voice logging is <strong>off by default</strong> and runs only while you actively enable it.</li>
        </ul>

        <h3>3.3 Information Collected Automatically</h3>
        <ul>
          <li><strong>Device &amp; usage data:</strong> Device model, operating system, app version, language, time zone, crash logs, and diagnostic information.</li>
          <li><strong>Analytics events:</strong> Screen views, feature usage, session duration, paywall interactions, and similar events (via Firebase Analytics).</li>
          <li><strong>Crash &amp; performance data:</strong> Stack traces and error details (via Firebase Crashlytics / logging).</li>
          <li><strong>Subscription data:</strong> Subscription status, product identifiers, trial status, and transaction receipts (via RevenueCat and the relevant app store).</li>
          <li><strong>Push notification tokens:</strong> Firebase Cloud Messaging (FCM) tokens to deliver notifications.</li>
          <li><strong>Approximate network data:</strong> IP address and connection metadata, used for security and debugging.</li>
        </ul>

        <h3>3.4 Information From Third Parties</h3>
        <ul>
          <li><strong>Google Sign-In:</strong> If you sign in with Google, we receive your name, email, and Google account identifier.</li>
          <li><strong>Apple / Google Play:</strong> We receive subscription purchase receipts and status via RevenueCat.</li>
        </ul>

        <h2>4. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ol>
          <li>Provide, maintain, and improve the Service (hand logging, statistics, bankroll tracking, club management, dealer mode).</li>
          <li>Authenticate your account and secure the Service.</li>
          <li>Sync your data across devices and back it up to our servers.</li>
          <li>Process subscriptions, trials, and refunds.</li>
          <li>Send transactional and, where permitted, promotional notifications.</li>
          <li>Respond to support requests.</li>
          <li>Detect, prevent, and investigate fraud, abuse, and security incidents.</li>
          <li>Generate AI-assisted hand and session analysis.</li>
          <li><strong>Improve our AI models.</strong> Poker hand data (actions, board cards, positions, stack sizes, outcomes) may be <strong>de-identified and aggregated</strong> and used to train, evaluate, and improve the AI features of the Service. De-identified data does not include your name, email, or account identifier. You can opt out — see Section 9.</li>
          <li>Comply with legal obligations.</li>
        </ol>
        <p><strong>Legal bases (GDPR/UK GDPR):</strong> We rely on (a) performance of a contract to deliver the Service, (b) your consent for voice recording, push notifications, and optional AI-training use, (c) our legitimate interests in securing and improving the Service, and (d) compliance with legal obligations.</p>

        <h2>5. How We Share Your Information</h2>
        <p>We do <strong>not</strong> sell your personal information. We share it only with:</p>

        <h3>5.1 Service Providers (Processors)</h3>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Data Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Google Firebase (Auth, Firestore, Cloud Messaging, Analytics, Crashlytics)</td><td>Auth, data storage, push notifications, analytics, crash reports</td><td>Account data, poker data, device data</td></tr>
            <tr><td>Our backend host (Render.com)</td><td>API hosting, AI analysis, session analytics, email exports</td><td>Hand data, session data, email when exporting</td></tr>
            <tr><td>Deepgram</td><td>Speech-to-text transcription (dealer mode)</td><td>Voice audio segments</td></tr>
            <tr><td>Soniox</td><td>Speech-to-text transcription (dealer mode, alternative)</td><td>Voice audio segments</td></tr>
            <tr><td>RevenueCat</td><td>Subscription management</td><td>Anonymous user ID, purchase receipts, subscription status</td></tr>
            <tr><td>Apple App Store / Google Play</td><td>Payment processing</td><td>Purchase and billing data</td></tr>
            <tr><td>Google Sign-In</td><td>Authentication</td><td>Google account profile (if you use it)</td></tr>
          </tbody>
        </table>
        <p>Each provider processes data under its own security and privacy terms and is bound to use the data only for the purposes we specify.</p>

        <h3>5.2 Other Users (Club / Event Features)</h3>
        <p>If you join or create a club, event, or table, other members of that club or event may see:</p>
        <ul>
          <li>Your display name and avatar color.</li>
          <li>Your seat assignment and chip stack during live events.</li>
          <li>Hands you log in a shared dealer session.</li>
          <li>Your ranking in public club leaderboards if your club enables them.</li>
        </ul>
        <p>Do not enter sensitive personal data into hand notes, club notes, or display names.</p>

        <h3>5.3 Legal &amp; Safety</h3>
        <p>We may disclose information if we believe in good faith that disclosure is necessary to (a) comply with applicable law or legal process, (b) enforce our Terms of Service, (c) protect the rights, property, or safety of users or the public, or (d) investigate fraud or security issues.</p>

        <h3>5.4 Business Transfers</h3>
        <p>If the Service is acquired, merged, or sold, information may be transferred as part of that transaction. We will notify you of any change in ownership or control of your personal information.</p>

        <h2>6. International Data Transfers</h2>
        <p>The Service is operated globally. Your information may be processed in the <strong>United States</strong>, the <strong>European Union</strong>, and other countries where our service providers operate. Where personal data is transferred outside your country, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses, service providers' own adequacy mechanisms, or your consent.</p>

        <h2>7. Data Retention</h2>
        <ul>
          <li><strong>Account and poker data:</strong> Retained while your account is active and for up to 90 days after deletion (for backup and dispute resolution), except where longer retention is required by law.</li>
          <li><strong>Voice audio:</strong> Retained only for the time needed to produce a transcript (typically seconds); transcripts are retained as part of the associated hand record until you delete it.</li>
          <li><strong>Analytics data:</strong> Retained for up to 26 months in Firebase Analytics.</li>
          <li><strong>Crash logs:</strong> Retained for up to 90 days.</li>
          <li><strong>Subscription records:</strong> Retained as required by tax and consumer protection laws (typically up to 7 years).</li>
          <li><strong>Support tickets:</strong> Retained for up to 3 years after resolution.</li>
        </ul>

        <h2>8. Security</h2>
        <p>We use Firebase Authentication, Firestore security rules, encrypted transport (HTTPS/TLS), and access controls to protect your data. No system is perfectly secure, however, and we cannot guarantee absolute security. If we become aware of a personal data breach likely to result in risk to you, we will notify you and relevant supervisory authorities as required by law.</p>

        <h2>9. Your Privacy Rights</h2>
        <p>Depending on where you live, you may have some or all of the following rights:</p>
        <ul>
          <li><strong>Access</strong> the personal information we hold about you.</li>
          <li><strong>Correct</strong> inaccurate personal information.</li>
          <li><strong>Delete</strong> your personal information (subject to legal exceptions).</li>
          <li><strong>Restrict or object</strong> to certain processing (including AI-training use of de-identified hand data).</li>
          <li><strong>Portability:</strong> receive a copy of your data in a structured, machine-readable format (CSV export is available in-app for subscribers).</li>
          <li><strong>Withdraw consent</strong> you previously gave (for voice recording, notifications, or optional analytics).</li>
          <li><strong>Lodge a complaint</strong> with your local data protection authority. In the EU/UK, you can contact your national regulator.</li>
        </ul>
        <p><strong>How to exercise:</strong> Email <a href="mailto:support@finaltable.io">support@finaltable.io</a> from the address associated with your account. We will respond within 30 days (extendable to 60 days for complex requests).</p>
        <p><strong>California residents (CCPA/CPRA):</strong> You have additional rights to know what personal information we collect, to request deletion, to correct inaccurate data, and to opt out of "sharing" for cross-context behavioral advertising. We do <strong>not</strong> sell personal information and we do <strong>not</strong> share it for cross-context behavioral advertising.</p>
        <p><strong>In-app deletion:</strong> You can delete your account and all associated poker, opponent, and club data from Profile → Settings → Delete Account. Subscription cancellations must be managed through the Apple App Store or Google Play.</p>

        <h2>10. Cookies &amp; Similar Technologies</h2>
        <p>The mobile app does not use browser cookies. Our backend and SDKs use device identifiers and local storage (SharedPreferences, SQLite) to keep you signed in, cache data, and deliver push notifications. Resetting your advertising ID or uninstalling the app will clear these identifiers.</p>

        <h2>11. Third-Party Links</h2>
        <p>The Service may contain links to third-party websites (e.g., RevenueCat billing portal, Google Play, App Store). Those sites are governed by their own privacy policies; we are not responsible for their practices.</p>

        <h2>12. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. If changes are material, we will notify you in the app or by email before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Policy.</p>

        <h2>13. Contact</h2>
        <p>For privacy questions, requests, or complaints:</p>
        <p>
          <strong>Magsud Hajiyev</strong><br />
          Sole Proprietor — Republic of Azerbaijan<br />
          Email: <a href="mailto:support@finaltable.io">support@finaltable.io</a>
        </p>

        <div className="legal-disclaimer">
          This document is provided for transparency and App Store compliance. It is not legal advice. Consult a qualified attorney in your jurisdiction if you require legal guidance.
        </div>
      </main>
      <LegalFooter />
    </div>
  )
}
