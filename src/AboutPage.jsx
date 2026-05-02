import { useState, useEffect, useRef } from 'react'
import { useT, SUPPORTED } from './i18n'
import './LandingPage.css'
import './AboutPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru' }
function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

const TEAM = [
  {
    name: 'Magsud Hajiyev',
    role: 'Founder & CTO',
    initials: 'MH',
    bio: 'Software engineer passionate about building products that solve real problems. Leading the technical vision behind Final Table.',
    linkedin: 'https://www.linkedin.com/in/magsud-hajiyev-03157961/',
  },
  {
    name: 'Tural Jumshudlu',
    role: 'Co-Founder & CDO',
    initials: 'TJ',
    bio: 'Design-driven product thinker focused on creating intuitive experiences. Shaping the look, feel, and user experience of Final Table.',
    linkedin: 'https://www.linkedin.com/in/tural-jumshud-165134103/',
  },
]

/* ── Navbar (same as home) ── */
function AboutNavbar() {
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
          <a href="/#features">{t('nav.features')}</a>
          <a href="/#how-it-works">{t('nav.howItWorks')}</a>
          <a href="/#compare">{t('nav.compare')}</a>
          <a href="/#faq">{t('nav.faq')}</a>
          <a href="/about" className="tp-nav-link-active">{t('about.nav')}</a>
        </div>
        <div className="tp-lang-picker" ref={langRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <Flag locale={locale} />
            <span className="tp-lang-code">{locale.toUpperCase()}</span>
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
        <a href="/#features">{t('nav.features')}</a>
        <a href="/#how-it-works">{t('nav.howItWorks')}</a>
        <a href="/#compare">{t('nav.compare')}</a>
        <a href="/#faq">{t('nav.faq')}</a>
        <a href="/about">{t('about.nav')}</a>
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

/* ── Footer (same as home) ── */
function AboutFooter() {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy.html' },
    { title: t('footer.terms'),    href: '/terms.html' },
  ]

  const resources = [
    { title: t('nav.features'),     href: '/#features' },
    { title: t('nav.howItWorks'),   href: '/#how-it-works' },
    { title: t('nav.compare'),      href: '/#compare' },
    { title: t('nav.faq'),          href: '/#faq' },
  ]

  return (
    <footer className="mf-footer">
      <div className="mf-inner">
        <div className="mf-top-border" />
        <div className="mf-grid">
          <div className="mf-brand">
            <a href="/" className="mf-logo">
              <img src="/nwa_logo_dark.svg" alt="Final Table" className="mf-logo-img" />
            </a>
            <p className="mf-tagline">{t('footer.tagline')}</p>
            <p className="mf-support">{t('footer.support')}</p>
          </div>
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
        <div className="mf-bottom-border" />
        <p className="mf-copy">{t('footer.copy', { year })}</p>
      </div>
    </footer>
  )
}

/* ── About Page ── */
export default function AboutPage() {
  const { t } = useT()
  return (
    <div className="tp-root">
      <AboutNavbar />
      <main className="about-main" data-nav-theme="light">

        {/* Mission */}
        <section className="about-mission">
          <p className="about-eyebrow">{t('about.missionEyebrow')}</p>
          <h1 className="about-h1">
            {t('about.missionTitle')}
          </h1>
          <p className="about-body">
            {t('about.missionBody')}
          </p>
        </section>

        {/* Values */}
        <section className="about-values">
          <div className="about-values-grid">
            <div className="about-value-card">
              <h3 className="about-value-title">{t('about.value1Title')}</h3>
              <p className="about-value-desc">{t('about.value1Desc')}</p>
            </div>
            <div className="about-value-card">
              <h3 className="about-value-title">{t('about.value2Title')}</h3>
              <p className="about-value-desc">{t('about.value2Desc')}</p>
            </div>
            <div className="about-value-card">
              <h3 className="about-value-title">{t('about.value3Title')}</h3>
              <p className="about-value-desc">{t('about.value3Desc')}</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <p className="about-eyebrow">{t('about.teamEyebrow')}</p>
          <h2 className="about-h2">{t('about.teamTitle')}</h2>
          <div className="about-team-grid">
            {TEAM.map((member, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">{member.initials}</div>
                <h3 className="about-team-name">{member.name}</h3>
                <p className="about-team-role">{member.role}</p>
                <p className="about-team-bio">{t(`about.member${i + 1}Bio`)}</p>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="about-team-linkedin">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2 className="about-h2">{t('about.ctaTitle')}</h2>
          <p className="about-cta-body">{t('about.ctaBody')}</p>
          <a href="/#reserve-form" className="about-cta-btn">{t('about.ctaBtn')}</a>
        </section>

      </main>
      <AboutFooter />
    </div>
  )
}
