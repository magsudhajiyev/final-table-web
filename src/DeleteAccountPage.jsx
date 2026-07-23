import { useState, useEffect, useRef } from 'react'
import { useT, SUPPORTED } from './i18n'
import { TPNavbar, TPFooter } from './LandingPage'
import './LandingPage.css'
import './LegalPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ro: 'ro', ru: 'ru', sk: 'sk', tr: 'tr', uk: 'ua' }
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
          <img src="/logo.png" alt="Final Table" className="tp-nav-logo-img" />
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
          <img src="/logo.png" alt="Final Table" className="mf-logo-img" />
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

export default function DeleteAccountPage() {
  return (
    <div className="tp-root legal-root">
      <TPNavbar />
      <main className="legal-main" data-nav-theme="light">
        <h1>Delete Your Account &amp; Data</h1>
        <p className="legal-effective"><strong>App:</strong> Final Table &nbsp;·&nbsp; <strong>Developer:</strong> Magsud Hajiyev</p>

        <p>This page is for anyone who wants to delete their <strong>Final Table</strong> account and the personal data associated with it. Final Table is a poker hand tracking and analytics app published by Magsud Hajiyev (sole proprietor, Republic of Azerbaijan). You do not need to be signed in to this website to request deletion, and you can request deletion even if you no longer have the app installed.</p>

        <h2>1. How to request deletion</h2>

        <h3>Option A — In the app (immediate)</h3>
        <ol>
          <li>Open the <strong>Final Table</strong> app and sign in.</li>
          <li>Go to the <strong>Profile</strong> tab.</li>
          <li>Scroll to the bottom and tap <strong>Delete Account</strong>.</li>
          <li>Confirm in the dialog. You may be asked to sign in again to verify it's you.</li>
        </ol>
        <p>Your account and the data listed below are deleted right away, and you are signed out of the app.</p>

        <h3>Option B — By email (no app needed)</h3>
        <ol>
          <li>Email <strong><a href="mailto:contact@finaltable.io">contact@finaltable.io</a></strong> from the email address associated with your Final Table account.</li>
          <li>Use the subject line <strong>"Account deletion request"</strong> and include the email address of the account you want deleted.</li>
          <li>We verify that the request comes from the account owner and then delete the account and data listed below. We complete verified requests within <strong>30</strong> days and confirm by reply when done.</li>
        </ol>

        <h2>2. What is deleted</h2>
        <p>When your account is deleted, we remove from our servers:</p>
        <ul>
          <li><strong>Account &amp; sign-in data:</strong> your email address, display name, password credential, and any Google or Apple sign-in link.</li>
          <li><strong>Profile data:</strong> your user profile record.</li>
          <li><strong>Poker statistics:</strong> your VPIP, PFR, and all other accumulated playing statistics.</li>
          <li><strong>Sessions and hand logs:</strong> your logged poker sessions, including hand histories, actions, board and hole cards, notes, and tags.</li>
          <li><strong>Session results:</strong> your buy-in, cash-out, and profit/loss history.</li>
          <li><strong>Opponent data:</strong> opponent profiles, notes, and opponent statistics you created.</li>
          <li><strong>Bankroll data:</strong> your bankroll amount and goals.</li>
        </ul>
        <p>Data stored locally on your device (offline cache) is removed when you delete the account in-app or uninstall the app.</p>
        <p><strong>Voice audio:</strong> there are no stored voice recordings to delete. Dealer-mode audio is used only to produce transcripts — the app deletes each short audio segment from your device immediately after transcription, and as described in our <a href="/privacy">Privacy Policy</a>, raw audio is not stored on our servers beyond the time needed to obtain the transcript.</p>

        <h2>3. What is kept, and why</h2>
        <ul>
          <li><strong>Subscription and purchase records:</strong> transaction records are held by Apple, Google Play, and RevenueCat under their own retention rules, and we retain related records as needed for legal, tax, and accounting obligations. We cannot delete records held by Apple or Google — you can manage those through your App Store or Google Play account.</li>
          <li><strong>Backups:</strong> deleted data may persist in our encrypted backups for up to <strong>90</strong> days before it is purged.</li>
          <li><strong>De-identified data:</strong> aggregated or de-identified data that can no longer be linked to you (for example, anonymized hand statistics used to improve our analysis features, as described in our <a href="/privacy">Privacy Policy</a>) may be retained.</li>
          <li><strong>Shared club and event data:</strong> records that belong to a shared club or event — hands logged in a shared dealer session, event results, seat assignments, and rankings — are part of that club's shared history and are not automatically removed, because other members rely on them. After deletion they are no longer linked to a Final Table account. If you own or admin a club, the club and its records are not deleted automatically — email <a href="mailto:contact@finaltable.io">contact@finaltable.io</a> to have a club you own, or specific club records about you, removed.</li>
        </ul>

        <h2>4. Timeline</h2>
        <ul>
          <li><strong>In-app deletion:</strong> takes effect immediately.</li>
          <li><strong>Email requests:</strong> completed within <strong>30</strong> days of verifying your identity.</li>
          <li><strong>Backups:</strong> purged within <strong>90</strong> days of deletion.</li>
        </ul>

        <h2>5. Questions</h2>
        <p>If anything here is unclear, or you want to exercise other privacy rights (access, correction, portability), see our <a href="/privacy">Privacy Policy</a> or contact us at <a href="mailto:contact@finaltable.io">contact@finaltable.io</a>.</p>
      </main>
      <TPFooter />
    </div>
  )
}
