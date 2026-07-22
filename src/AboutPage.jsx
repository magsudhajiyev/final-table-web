import { useState, useEffect, useRef } from 'react'
import { useT, SUPPORTED } from './i18n'
import { useTheme, ThemeToggle } from './theme'
import { FinalTableLogo } from './components/FinalTableLogo'
import './LandingPage.css'
import './AboutPage.css'
import './LegalPage.css'
import 'flag-icons/css/flag-icons.min.css'

const APP_STORE_URL = 'https://apps.apple.com/us/app/final-table/id6760188970'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru', tr: 'tr', uk: 'ua' }
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

/* ── Navbar (mirrors the landing-page TPNavbar) ── */
function AboutNavbar() {
  const { t, locale, setLocale } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const mobileLangRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const inDesktop = langRef.current && langRef.current.contains(e.target)
      const inMobile = mobileLangRef.current && mobileLangRef.current.contains(e.target)
      if (!inDesktop && !inMobile) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => { if (menuOpen) setMenuOpen(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  return (
    <header className={`tp-nav-wrap${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <div className="tp-nav-left">
          <a href="/" className="tp-nav-logo">
            <FinalTableLogo className="tp-nav-logo-svg" />
          </a>
          <div className="tp-nav-links">
            <a href="/#how-it-works">{t('nav.howItWorks')}</a>
            <a href="/#features">{t('nav.features')}</a>
            <a href="/#compare">{t('nav.compare')}</a>
            <a href="/about" className="tp-nav-active">{t('about.nav')}</a>
            <a href="/#faq">{t('nav.contact')}</a>
          </div>
        </div>
        <div className="tp-nav-right">
          <a href={APP_STORE_URL} className="tp-nav-download-btn" target="_blank" rel="noopener noreferrer">
            {t('nav.download')}
          </a>
          <div className="tp-lang-picker" ref={langRef}>
            <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Change language">
              <Flag locale={locale} />
              <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
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
        </div>
        <div className="tp-mobile-lang-picker" ref={mobileLangRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Change language">
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
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
        <a href="/about">{t('about.nav')}</a>
        <a href="/#faq">{t('nav.contact')}</a>
      </div>
    </header>
  )
}

/* ── Footer (mirrors the landing-page TPFooter) ── */
function AboutFooter() {
  const { t, locale } = useT()
  const year = new Date().getFullYear()

  const companyLinks = [
    { title: t('nav.howItWorks'), href: '/#how-it-works' },
    { title: t('nav.features'),   href: '/#features' },
    { title: t('nav.compare'),    href: '/#compare' },
    { title: t('about.nav'),      href: '/about' },
  ]
  const termsLinks = [
    { title: t('footer.termsOfUse'),    href: '/terms' },
    { title: t('footer.privacyPolicy'), href: '/privacy' },
  ]

  const flagIso = FLAG_ISO[locale] || 'gb'
  const langLabel = { de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français', pl: 'Polski', pt: 'Português', ru: 'Русский', tr: 'Türkçe' }[locale] || 'English'

  return (
    <footer className="mf-footer">
      <div className="mf-top-line" aria-hidden="true" />
      <div className="mf-outer">
        <div className="mf-card">
          <div className="mf-card-inner">
            <div className="mf-row">
              <div className="mf-brand">
                <a href="/" className="mf-logo">
                  <FinalTableLogo className="mf-logo-svg" width={224} height={80} />
                </a>
                <div className="mf-follow">
                  <div className="mf-follow-row">
                    <span className="mf-follow-label">{t('footer.followUs')}</span>
                    <a href="https://discord.gg/bEFGeAR6X" target="_blank" rel="noopener noreferrer" className="mf-social" aria-label="Discord">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                      </svg>
                    </a>
                    <a href="#" className="mf-social" aria-label="Instagram">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a href="#" className="mf-social" aria-label="LinkedIn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="mf-nav">
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.company')}</span>
                  {companyLinks.map(({ href, title }, i) => (
                    <a key={i} href={href} className="mf-link">{title}</a>
                  ))}
                </div>
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.termsHead')}</span>
                  {termsLinks.map(({ href, title }, i) => (
                    <a key={i} href={href} className="mf-link">{title}</a>
                  ))}
                </div>
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.contactHead')}</span>
                  <a href="mailto:contact@finaltable.io" className="mf-link">contact@finaltable.io</a>
                </div>
              </div>
            </div>

            <div className="mf-bottom-row">
              <p className="mf-copy">{t('footer.copyright', { year })}</p>
              <div className="mf-lang-pill" aria-hidden="true">
                <span className={`fi fi-${flagIso} mf-lang-flag`} />
                <span className="mf-lang-label">{langLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mf-hero-card" aria-hidden="true">
            <img src="/footer_card.png" alt="" className="mf-hero-img" />
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── About Page ── */
export default function AboutPage() {
  const { t } = useT()
  return (
    <div className="tp-root legal-root">
      <AboutNavbar />
      <main className="about-main" data-nav-theme="light">

        {/* Mission */}
        <section className="about-mission">
          <div className="about-inner">
            <p className="about-eyebrow">{t('about.missionEyebrow')}</p>
            <h1 className="about-h1">
              {t('about.missionTitle')}
            </h1>
            <p className="about-body">{t('about.missionP1')}</p>
            <p className="about-body">{t('about.missionP2')}</p>
            <p className="about-body">{t('about.missionP3')}</p>
            <p className="about-body">{t('about.missionP4')}</p>
            <p className="about-body">{t('about.missionP5')}</p>
          </div>
        </section>

        {/* Values */}
        <section className="about-values">
          <div className="about-inner">
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
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <div className="about-inner">
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
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div className="about-inner">
            <h2 className="about-h2">{t('about.ctaTitle')}</h2>
            <p className="about-cta-body">{t('about.ctaBody')}</p>
            <a href="/#reserve-form" className="about-cta-btn">{t('about.ctaBtn')}</a>
          </div>
        </section>

      </main>
      <AboutFooter />
    </div>
  )
}
