import { useState, useEffect, useRef } from 'react'
import { submitToWaitlist, submitNicknameClaim } from './lib/firebase'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import './TestPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru' }
function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

/* ── Deterministic daily player count ── */
function getPlayerCount() {
  const BASE = 283
  const START = new Date('2026-04-29')
  const now = new Date()
  const slots = Math.floor((now - START) / 1800000) // 30-minute slots
  let total = BASE
  for (let s = 0; s < slots; s++) {
    const seed = s * 2654435761 >>> 0
    total += (seed % 5) + 1 // random 1-5 per 30 min
  }
  return total.toLocaleString()
}

// Tab icons as inline SVG data URIs (Lucide-style)
const IMG_TAB_ICON_1    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>')}`
const IMG_TAB_ICON_2    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>')}`
const IMG_TAB_ICON_3    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>')}`
const IMG_TAB_ICON_4    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>')}`

/* ────────────────────────────────────────────────────── */
/*  HOW-IT-WORKS heading helper                           */
/* ────────────────────────────────────────────────────── */
function HowTitle({ text }) {
  const nl = text.indexOf('\n')
  if (nl === -1) return <p className="tp-how-heading">{text}</p>
  const line1 = text.slice(0, nl)
  const line2 = text.slice(nl + 1)
  const dot1 = line1.endsWith('.')
  const dot2 = line2.endsWith('.')
  const core1 = dot1 ? line1.slice(0, -1) : line1
  const core2 = dot2 ? line2.slice(0, -1) : line2
  return (
    <div className="tp-how-heading">
      <span>{core1}{dot1 && '.'}</span>{' '}
      <em className="tp-how-italic">{core2}</em>{dot2 && '.'}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/*  NAVBAR                                                */
/* ────────────────────────────────────────────────────── */
function TPNavbar() {
  const { t, locale, setLocale } = useT()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light') // 'dark' | 'light'
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

  // Switch theme by checking which section the nav centre is over
  useEffect(() => {
    const getTheme = () => {
      const navMid = 26 // half of 52px nav height
      const sections = document.querySelectorAll('[data-nav-theme]')
      let next = 'light'
      sections.forEach(section => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= navMid && rect.bottom > navMid) {
          next = section.dataset.navTheme
        }
      })
      setTheme(next)
    }
    window.addEventListener('scroll', getTheme, { passive: true })
    getTheme()
    return () => window.removeEventListener('scroll', getTheme)
  }, [])

  const isLight = theme === 'light'
  const logo    = '/nwa_logo.svg'
  const iconSrc = '/assets/logo_cion.svg'

  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    }
  }

  return (
    <header className={`tp-nav-wrap tp-nav-${theme}${scrolled ? ' tp-nav-scrolled' : ''}${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <a href="#" className="tp-nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <img src={logo} alt="Final Table" className="tp-nav-logo-img" />
        </a>
        <div className="tp-nav-sep" />
        <div className="tp-nav-links">
          <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
          <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
          <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
          <a href="#faq" onClick={smoothScroll}>{t('nav.faq')}</a>
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
        <a href="#reserve-form" className="tp-nav-waitlist-btn" onClick={smoothScroll}>
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
        <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
        <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
        <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
        <a href="#faq" onClick={smoothScroll}>{t('nav.faq')}</a>
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

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */

function TPHero() {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return

      const progress = Math.min(Math.max(window.scrollY / (section.offsetHeight * 0.65), 0), 1)
      const eased = progress * progress

      content.style.filter    = `blur(${eased * 14}px)`
      content.style.opacity   = `${1 - eased * 0.9}`
      content.style.transform = `translateY(${eased * -24}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    try {
      await submitToWaitlist(email)
      setStatus('done')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="tp-hero" ref={sectionRef} data-nav-theme="light">
      <div className="tp-hero-inner">
      <div className="tp-hero-content" ref={contentRef}>

        {/* Badge */}
        <div className="tp-hero-badge">
          <img src="/Apple_logo_black.svg" alt="" className="tp-hero-badge-icon" />
          Public launch on iOS soon
        </div>

        <h1 className="tp-hero-h1">{t('hero.h1')}</h1>
        <p className="tp-hero-sub">{t('hero.sub')}</p>

        <div id="reserve-form">
          {status === 'done' ? (
            <div className="tp-hero-waitlist-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17L4 12" />
              </svg>
              <span className="tp-hero-success-text">{t('hero.successText')}</span>
              <button className="tp-hero-reset-btn" onClick={() => { setStatus('idle'); setEmail('') }}>
                {t('hero.resetBtn')}
              </button>
            </div>
          ) : (
            <form className="tp-hero-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                className="tp-hero-email-input"
                placeholder={t('hero.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="tp-hero-submit-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? t('hero.btnLoading') : t('hero.btnSubmit')}
                {status !== 'loading' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              {status === 'error' && <p className="tp-hero-form-error">{t('hero.errorGeneric')}</p>}
            </form>
          )}
        </div>

        {/* Social proof */}
        <div className="tp-hero-proof-row">
          <div className="tp-hero-avatars">
            <img src="/avatar_1.png" alt="" className="tp-hero-avatar" />
            <img src="/avatar_2.png" alt="" className="tp-hero-avatar" />
            <img src="/avatar_3.png" alt="" className="tp-hero-avatar" />
            <img src="/avatar_4.png" alt="" className="tp-hero-avatar" />
            <img src="/avatar_5.png" alt="" className="tp-hero-avatar" />
          </div>
          <p className="tp-hero-proof-text">
            <strong>{getPlayerCount()}+ players</strong>{' '}
            <span>already signed up</span>
          </p>
        </div>

      </div>
      <div className="tp-hero-phone" aria-hidden="true">
        <img
          src="/hero_image.png"
          alt=""
          className="tp-hero-phone-img"
        />
      </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  COMPARISON                                           */
/* ────────────────────────────────────────────────────── */
function TPComparison() {
  const { t } = useT()
  return (
    <section className="tp-compare-section" id="compare" data-nav-theme="light">
      <div className="tp-compare-inner">
        <div className="tp-compare-header-group">
          <p className="tp-compare-eyebrow">{t('compare.eyebrow')}</p>
          <div className="tp-compare-header">
            <h2 className="tp-compare-title">{t('compare.title')}</h2>
            <p className="tp-compare-subtitle">{t('compare.subtitle')}</p>
          </div>
        </div>

        <div className="tp-compare-grid">
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Zap size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card1.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card1.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Target size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card2.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card2.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Layers size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card3.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card3.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Mic size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card4.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card4.desc')}</p>
            </div>
            <div className="tp-compare-coming-soon-wrap">
              <span className="tp-compare-coming-soon">Coming Soon</span>
              <span className="tp-compare-venue">Venue Partnership</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ────────────────────────────────────────────────────── */
/*  BG IMAGE SECTION  (scroll-driven tabs, Flighty-style) */
/* ────────────────────────────────────────────────────── */
const darkTabs = []

function TPBgSection() {
  const { t } = useT()
  const tabs = getTabs(t)
  const tabInfo = getTabInfo(t)
  const [activeTab, setActiveTab] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const scrolledIn = -rect.top
      const scrollableRange = section.offsetHeight - window.innerHeight

      if (scrolledIn < 0 || scrolledIn > scrollableRange) {
        document.body.classList.remove('bg-section-nav-dark')
        return
      }

      // Tab switches at each 100vh boundary
      const tabIndex = Math.min(Math.floor(scrolledIn / window.innerHeight), tabs.length - 1)
      setActiveTab(Math.max(0, tabIndex))

      const navTabIndex = Math.min(
        Math.floor(Math.max(0, scrolledIn - 120) / window.innerHeight),
        tabs.length - 1
      )
      document.body.classList.toggle('bg-section-nav-dark', darkTabs.includes(navTabIndex))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.body.classList.remove('bg-section-nav-dark')
    }
  }, [])

  return (
    <>
      <section className="tp-bg-section" id="how-it-works" ref={sectionRef} data-nav-theme="light">
        <div className="tp-bg-sticky">

          {/* Left tab info panel */}
          <div className="tp-tab-info">
            {tabInfo.map((info, i) => (
              <div
                key={i}
                className={`tp-tab-info-slide${activeTab === i ? ' is-active' : ''}`}
              >
                <p className="tp-tab-info-eyebrow">{info.eyebrow}</p>
                <h2 className="tp-tab-info-title">{info.title}</h2>
                <p className="tp-tab-info-body">{info.body}</p>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="tp-tabbar-wrap">
            <div className="tp-tabbar">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  className={`tp-tab${activeTab === i ? ' tp-tab-active' : ''}`}
                >
                  <img src={tab.icon} alt="" className="tp-tab-icon" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="tp-bg-mockup-wrap">
            {tabs.map((tab, i) => (
              <img
                key={i}
                src={tab.mockup}
                alt=""
                className="tp-bg-section-mockup"
                style={{ opacity: activeTab === i ? 1 : 0 }}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  )
}


/* ────────────────────────────────────────────────────── */
/*  HOW IT WORKS  (3-card Figma layout)                   */
/* ────────────────────────────────────────────────────── */
function TPHowItWorks() {
  const { t } = useT()
  return (
    <section className="tp-how-section" id="how-it-works" data-nav-theme="light">
      <div className="tp-how-inner">
        <div className="tp-how-row">

          {/* Left column: Before + After stacked */}
          <div className="tp-how-left-col">

            <div className="tp-how-card tp-how-card-before">
              <div className="tp-how-visual tp-how-visual-before">
                <img src="/nwa_before.png" alt="" className="tp-how-img tp-how-img-before" />
              </div>
              <div className="tp-how-body">
                <p className="tp-how-eyebrow">{t('tabs.0.label')}</p>
                <HowTitle text={t('tabs.0.title')} />
                <p className="tp-how-desc">{t('tabs.0.body')}</p>
              </div>
            </div>

            <div className="tp-how-card tp-how-card-after">
              <div className="tp-how-body">
                <p className="tp-how-eyebrow">{t('tabs.2.label')}</p>
                <HowTitle text={t('tabs.2.title')} />
                <p className="tp-how-desc">{t('tabs.2.body')}</p>
              </div>
              <div className="tp-how-visual tp-how-visual-after">
                <img src="/opponents.png" alt="" className="tp-how-img tp-how-img-after" />
              </div>
            </div>

          </div>

          {/* Right column: At the table (tall spanning card) */}
          <div className="tp-how-card tp-how-card-table">
            <div className="tp-how-visual tp-how-visual-table">
              <img src="/hand_3.png" alt="" className="tp-how-img tp-how-img-table" />
            </div>
            <div className="tp-how-body">
              <p className="tp-how-eyebrow">{t('tabs.1.label')}</p>
              <HowTitle text={t('tabs.1.title')} />
              <p className="tp-how-desc">{t('tabs.1.body')}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FOOTER                                                */
/* ────────────────────────────────────────────────────── */
function TPFooter() {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy.html' },
    { title: t('footer.terms'),    href: '/terms.html' },
  ]

  const resources = [
    { title: t('nav.features'),     href: '#features' },
    { title: t('nav.howItWorks'),   href: '#how-it-works' },
    { title: t('nav.compare'),      href: '#compare' },
    { title: t('nav.faq'),          href: '#faq' },
  ]

  return (
    <footer className="mf-footer">
      <div className="mf-inner">
        <div className="mf-top-border" />
        <div className="mf-grid">
          {/* Brand col */}
          <div className="mf-brand">
            <a href="#" className="mf-logo">
              <img src="/nwa_logo.svg" alt="Final Table" className="mf-logo-img" />
            </a>
            <p className="mf-tagline">{t('footer.tagline')}</p>
            <p className="mf-support">{t('footer.support')}</p>
          </div>

          {/* Resources col */}
          <div className="mf-col">
            <span className="mf-col-head">{t('footer.resources')}</span>
            {resources.map(({ href, title }, i) => (
              <a key={i} href={href} className="mf-link">{title}</a>
            ))}
          </div>

          {/* Company col */}
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

/* ────────────────────────────────────────────────────── */
/*  FIXED TAB BAR                                         */
/* ────────────────────────────────────────────────────── */
const getTabs = (t) => [
  { icon: IMG_TAB_ICON_1, label: t('tabs.0.label'), mockup: '/phonemain_1.png' },
  { icon: IMG_TAB_ICON_2, label: t('tabs.1.label'), mockup: '/phonemain_2.png' },
  { icon: IMG_TAB_ICON_3, label: t('tabs.2.label'), mockup: '/phonemain_3.png' },
  { icon: IMG_TAB_ICON_4, label: t('tabs.3.label'), mockup: '/phonemain_3.png' },
]

const getTabInfo = (t) => [
  { eyebrow: t('tabs.0.eyebrow'), title: t('tabs.0.title'), body: t('tabs.0.body') },
  { eyebrow: t('tabs.1.eyebrow'), title: t('tabs.1.title'), body: t('tabs.1.body') },
  { eyebrow: t('tabs.2.eyebrow'), title: t('tabs.2.title'), body: t('tabs.2.body') },
  { eyebrow: t('tabs.3.eyebrow'), title: t('tabs.3.title'), body: t('tabs.3.body') },
]

/* ────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────── */
/*  FEATURES SHOWCASE  (bento grid, 10 cards)            */
/* ────────────────────────────────────────────────────── */
const STACK_ICONS = [Eye, TrendingUp, Crosshair, Users]
const getStackCards = (t) => [0, 1, 2, 3].map(i => ({
  icon: STACK_ICONS[i],
  left: {
    stat: t(`problems.${i}.stat`),
    question: t(`problems.${i}.question`),
  },
  body: t(`problems.${i}.body`),
}))

function TPProblems() {
  const { t } = useT()
  const STACK_CARDS = getStackCards(t)
  const wrapperRef = useRef(null)
  const cardRefs = useRef([])
  const [activeCard, setActiveCard] = useState(0)
  const activeRef = useRef(0)      // tracks left-text active card
  const rightRef  = useRef(0)      // tracks right-side card for icon animation

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const n = STACK_CARDS.length
    const isMobile = () => window.innerWidth <= 860
    const getContainerH = () => isMobile() ? 260 : 340
    const getActiveY = () => isMobile() ? 32 : 48
    const PEEK        = 10
    const LERP        = 0.1  // smoothing factor (lower = silkier)

    let CONTAINER_H = getContainerH()
    let ACTIVE_Y = getActiveY()
    const curY = Array(n).fill(CONTAINER_H + 40)

    const onResize = () => {
      CONTAINER_H = getContainerH()
      ACTIVE_Y = getActiveY()
    }
    window.addEventListener('resize', onResize)
    let rafId  = null
    let active = false

    const getTarget = (cp) => {
      if (cp < 0) return CONTAINER_H + 40
      if (cp < 0.45) {
        const t = cp / 0.45
        const eased = 1 - Math.pow(1 - t, 3)
        return CONTAINER_H - eased * (CONTAINER_H - ACTIVE_Y)
      }
      const depth = Math.floor(cp - 0.45)
      return Math.max(0, ACTIVE_Y - depth * PEEK)
    }

    const tick = () => {
      const rect = wrapper.getBoundingClientRect()
      const scrolled = -rect.top
      const total = rect.height - window.innerHeight
      let needsMore = false

      if (total > 0) {
        const fi = Math.max(0, Math.min(1, scrolled / total)) * n

        // Left text: updates 0.5 scroll-units BEFORE the right card enters
        const leftNext = Math.min(Math.floor(fi + 0.5), n - 1)
        if (leftNext !== activeRef.current) {
          activeRef.current = leftNext
          setActiveCard(leftNext)
        }

        // Right cards: enter at integer fi boundaries (unchanged)
        const rightNext = Math.min(Math.floor(fi), n - 1)
        if (rightNext !== rightRef.current) {
          const oldIcon = wrapper.querySelector(`[data-ci="${rightRef.current}"] .sc-icon`)
          if (oldIcon) oldIcon.classList.remove('sc-icon--play')
          rightRef.current = rightNext
          requestAnimationFrame(() => {
            const newIcon = wrapper.querySelector(`[data-ci="${rightNext}"] .sc-icon`)
            if (newIcon) { void newIcon.offsetWidth; newIcon.classList.add('sc-icon--play') }
          })
        }

        cardRefs.current.forEach((card, i) => {
          if (!card) return
          const cp = fi - i
          const target = getTarget(cp)

          card.style.zIndex = (cp >= 0 && cp < 0.45) ? n + i : i

          curY[i] += (target - curY[i]) * LERP
          if (Math.abs(curY[i] - target) > 0.05) needsMore = true
          card.style.transform = `translateY(${curY[i].toFixed(2)}px)`
        })

        // Letters: reveal during the 0.5 scroll-unit window before the right card enters.
        // activeCp starts at 0 when left text updates, reaches ~0.4 when card enters.
        const activeCp = fi - (activeRef.current - 0.5)
        const lp = Math.max(0, Math.min(1, activeCp / 0.40))
        const letters   = wrapper.querySelectorAll('.sc-question .sc-letter')
        const letterLen = letters.length
        letters.forEach((el, i) => {
          const t = Math.max(0, Math.min(1, lp * letterLen - i))
          el.style.color = `rgba(255,255,255,${(0.18 + t * 0.82).toFixed(3)})`
        })
      }

      if (needsMore) {
        rafId = requestAnimationFrame(tick)
      } else {
        active = false
      }
    }

    const onScroll = () => {
      if (!active) {
        active = true
        rafId = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    tick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="sc-section"
      data-nav-theme="dark"
      ref={wrapperRef}
      style={{ height: `${STACK_CARDS.length * (window.innerWidth <= 860 ? 100 : 130)}vh` }}
    >
      <div className="sc-sticky">
        <div className="sc-inner">

          <div className="sc-left">
            {(() => {
              const card = STACK_CARDS[activeCard]
              const left = card?.left ?? STACK_CARDS[0].left
              return (
                <div className="sc-left-content" key={activeCard}>
                  <span className="sc-num">0{activeCard + 1}</span>
                  <p className="sc-stat">{left.stat}</p>
                  <h2 className="sc-question">
                    {left.question.split('').map((ch, i) => (
                      <span key={i} className="sc-letter">{ch}</span>
                    ))}
                  </h2>
                </div>
              )
            })()}
          </div>

          <div className="sc-right">
            {STACK_CARDS.map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className="sc-card"
                  data-ci={i}
                  ref={el => { cardRefs.current[i] = el }}
                >
                  <Icon size={28} strokeWidth={1.5} className={`sc-icon${i === 0 ? ' sc-icon--play' : ''}`} />
                  <p className="sc-body">{card.body}</p>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

function TPFeaturesShowcase() {
  const { t } = useT()

  const cards = [
    { img: '/nwa_opponents.gif', title: t('features.opponentProfiles.title'), desc: t('features.opponentProfiles.desc') },
    { img: '/nwa_chart.gif',     title: t('features.bankroll.title'),         desc: t('features.bankroll.desc') },
    { img: '/nwa_session.gif',   title: t('features.sessionLogger.title'),    desc: t('features.sessionLogger.desc') },
  ]

  return (
    <section className="fv-section" id="features" data-nav-theme="dark">
      <div className="fv-inner">
        <div className="fv-header">
          <h2 className="fv-title">
            For the hands you'll{' '}
            <em>want to remember</em>.
          </h2>
          <p className="fv-subtitle">{t('features.subtitle')}</p>
        </div>
        <div className="fv-row">
          {cards.map((card, ci) => (
            <div key={ci} className={`fv-card${ci === 0 ? ' fv-card-featured' : ''}`}>
              <div className="fv-card-img-wrap">
                <img src={card.img} alt="" className="fv-card-img" />
              </div>
              <div className="fv-card-body">
                <h3 className="fv-card-title">{card.title}</h3>
                <p className="fv-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ────────────────────────────────────────────────────── */
/*  FINAL CTA  (Figma 110:9602)                          */
/* ────────────────────────────────────────────────────── */
const getFinalFaqs = (t) => [0, 1, 2, 3].map(i => ({
  q: t(`faq.${i}.q`),
  a: t(`faq.${i}.a`),
}))

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.5" stroke="#000"/>
    <path d="M11 7v8M7 11h8" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const MinusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.5" stroke="#000"/>
    <path d="M7 11h8" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

function TPFinalCTA() {
  const { t } = useT()
  const FINAL_FAQS = getFinalFaqs(t)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '' })
  const [status, setStatus] = useState('idle')
  const [openFaq, setOpenFaq] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    if (status === 'taken') setStatus('idle')
    if (name === 'username') {
      setForm(f => ({ ...f, username: value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      const result = await submitNicknameClaim(form.username, form.email)
      if (result.taken) { setStatus('taken'); return }
      await submitToWaitlist(form.email).catch(() => {})
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="fc-section" data-nav-theme="light" id="faq">
      <div className="fc-inner">

        {/* ── Header ── */}
        <div className="fc-header-group">
          <div className="fc-header-top">
            <p className="fc-eyebrow">{t('cta.eyebrow')}</p>
            <div className="fc-title-row">
              <h2 className="fc-title">
                <em>{t('cta.titleLine1')}</em>
                <br />
                {t('cta.titleLine2')}
              </h2>
              <p className="fc-subtitle">{t('cta.body')}</p>
            </div>
          </div>
          <div className="fc-proof-row">
            <div className="fc-avatars">
              <img src="/avatar_1.png" alt="" className="fc-avatar" />
              <img src="/avatar_2.png" alt="" className="fc-avatar" />
              <img src="/avatar_3.png" alt="" className="fc-avatar" />
              <img src="/avatar_4.png" alt="" className="fc-avatar" />
              <img src="/avatar_5.png" alt="" className="fc-avatar" />
            </div>
            <p className="fc-proof-text">
              <strong>{getPlayerCount()}+ players</strong>{' '}
              <span>already signed up</span>
            </p>
          </div>
        </div>

        {/* ── Bottom: FAQ + Form ── */}
        <div className="fc-bottom">

          {/* FAQ column */}
          <div className="fc-faq-col">
            <div className="fc-faq-list">
              {FINAL_FAQS.map((f, i) => (
                <div key={i} className={`fc-faq-item${openFaq === i ? ' fc-faq-open' : ''}`}>
                  <button className="fc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span className="fc-faq-icon">
                      {openFaq === i ? <MinusIcon /> : <PlusIcon />}
                    </span>
                  </button>
                  <div className="fc-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
            <p className="fc-support">{t('cta.support')}</p>
          </div>

          {/* Form card */}
          <div className="fc-card">
            {status === 'done' ? (
              <div className="fc-success">
                <div className="ru-success-chip">{t('cta.successChip')}</div>
                <h3 className="ru-success-title">{t('cta.successTitle')}</h3>
                <p className="ru-success-body">
                  {t('cta.successBody', { username: form.username || 'yourhandle' })}
                </p>
                <button className="ru-success-reset" onClick={() => { setStatus('idle'); setForm({ firstName: '', lastName: '', email: '', username: '' }) }}>
                  {t('cta.resetBtn')}
                </button>
              </div>
            ) : (
              <>
                <div className="fc-card-header">
                  <p className="fc-card-title">
                    3 months free trial to<br /><em>Reserve Username in advance</em>
                  </p>
                </div>
                <form className="fc-form" onSubmit={handleSubmit}>
                  <div className="fc-fields">
                    <div className="fc-name-row">
                      <input className="fc-input" type="text" name="firstName" placeholder="Enter first name" value={form.firstName} onChange={handleChange} />
                      <input className="fc-input" type="text" name="lastName" placeholder="Enter last name" value={form.lastName} onChange={handleChange} />
                    </div>
                    <div className="fc-field-group">
                      <input className="fc-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                      <p className="fc-hint">Your future sign-in email — this can't be changed later.</p>
                    </div>
                    <div className="fc-username-section">
                      <p className="fc-username-label">What username would you like to reserve?</p>
                      <div className="fc-field-group">
                        <div className="fc-input-prefix-wrap">
                          <span className="fc-prefix">@</span>
                          <input className="fc-input fc-input-prefix" type="text" name="username" placeholder="Enter username" value={form.username} onChange={handleChange} required />
                        </div>
                        <p className="fc-hint">Maximum 20 characters</p>
                      </div>
                    </div>
                  </div>
                  {status === 'taken' && <p className="ru-error">{t('cta.errorTaken')}</p>}
                  {status === 'error' && <p className="ru-error">{t('cta.errorGeneric')}</p>}
                  <button className="fc-submit" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? t('cta.btnLoading') : 'Continue to checkout'}
                    {status !== 'sending' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default function TestPage() {
  return (
    <div className="tp-root">
      <TPNavbar />
      <main>
        <TPHero />
        <TPComparison />
        <TPHowItWorks />
        <TPFeaturesShowcase />
        <TPFinalCTA />
      </main>
      <TPFooter />
    </div>
  )
}
