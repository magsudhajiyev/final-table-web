import { useState, useEffect, useRef } from 'react'
import { submitNicknameClaim, submitToWaitlist } from './lib/firebase'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import './TestPage.css'

const FLAGS = { en: '🇬🇧', pl: '🇵🇱', ru: '🇷🇺', fr: '🇫🇷' }

/* ── Deterministic daily player count ── */
function getPlayerCount() {
  const BASE = 283
  const START = new Date('2026-04-29')
  const today = new Date()
  const days = Math.floor((today - START) / 86400000)
  let total = BASE
  for (let d = 0; d < days; d++) {
    // simple hash: consistent random 1-10 per day
    const seed = d * 2654435761 >>> 0
    total += (seed % 10) + 1
  }
  return total.toLocaleString()
}

// Tab icons as inline SVG data URIs (Lucide-style)
const IMG_TAB_ICON_1    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>')}`
const IMG_TAB_ICON_2    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>')}`
const IMG_TAB_ICON_3    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>')}`
const IMG_TAB_ICON_4    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>')}`

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

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
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
  const logo    = isLight ? '/assets/logo_light.svg' : '/assets/Logo_dark.svg'
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
          <img src={logo} alt="Final Table" className={`tp-nav-logo-img${scrolled ? ' tp-nav-logo-hidden' : ''}`} />
          <img src={iconSrc} alt="Final Table" className={`tp-nav-logo-icon-img${scrolled ? '' : ' tp-nav-logo-hidden'}`} />
        </a>
        <div className="tp-nav-links">
          <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
          <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
          <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
          <a href="#faq" onClick={smoothScroll}>{t('nav.faq')}</a>
        </div>
        <div className="tp-lang-picker" ref={langRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <span className="tp-lang-flag">{FLAGS[locale]}</span>
            <span className="tp-lang-code">{locale.toUpperCase()}</span>
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-lang-dropdown">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-lang-option${l === locale ? ' tp-lang-option-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <span className="tp-lang-flag">{FLAGS[l]}</span>
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
        <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
        <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
        <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
        <a href="#faq" onClick={smoothScroll}>{t('nav.faq')}</a>
        <div className="tp-nav-mobile-lang">
          {SUPPORTED.map(l => (
            <button key={l} className={`tp-mobile-lang-btn${l === locale ? ' tp-mobile-lang-active' : ''}`} onClick={() => { setLocale(l); setMenuOpen(false) }}>
              {FLAGS[l]} {t(`lang.${l}`)}
            </button>
          ))}
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
  const [form, setForm] = useState({ email: '', username: '' })
  const [status, setStatus] = useState('idle') // idle | loading | done | taken | error
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
    if (status === 'loading') return
    setStatus('loading')
    try {
      const result = await submitNicknameClaim(form.username, form.email)
      if (result.taken) {
        setStatus('taken')
        return
      }
      await submitToWaitlist(form.email).catch(() => {})
      setStatus('done')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="tp-hero" ref={sectionRef} data-nav-theme="light">
      <div className="tp-hero-content" ref={contentRef}>
        <h1 className="tp-hero-h1">{t('hero.h1')}</h1>
        <p className="tp-hero-sub">{t('hero.sub')}</p>

        <div id="reserve-form">
          {status === 'done' ? (
            <div className="tp-hero-waitlist tp-hero-waitlist-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17L4 12" />
              </svg>
              <span className="tp-hero-success-text">
                {t('hero.successText', { username: form.username || t('hero.usernamePlaceholder') })}
              </span>
              <button className="tp-hero-reset-btn" onClick={() => { setStatus('idle'); setForm({ email: '', username: '' }) }}>
                {t('hero.resetBtn')}
              </button>
            </div>
          ) : (
            <form className="tp-hero-reserve-form" onSubmit={handleSubmit}>
              <div className="tp-hero-fields">
                <input
                  type="email"
                  name="email"
                  className="tp-hero-email"
                  placeholder={t('hero.emailPlaceholder')}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <div className="tp-hero-username-wrap">
                  <span className="tp-hero-at">@</span>
                  <input
                    type="text"
                    name="username"
                    className="tp-hero-email tp-hero-username"
                    placeholder={t('hero.usernamePlaceholder')}
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <span className="tp-hero-charcount">{form.username.length}/20</span>
                </div>
              </div>
              {status === 'taken' && <p className="tp-hero-form-error">{t('hero.errorTaken')}</p>}
              {status === 'error' && <p className="tp-hero-form-error">{t('hero.errorGeneric')}</p>}
              <button
                type="submit"
                className="tp-hero-waitlist-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? t('hero.btnLoading') : t('hero.btnSubmit')}
              </button>
              <p className="tp-hero-proof">{t('hero.proof', { count: getPlayerCount() })}</p>
            </form>
          )}
        </div>

        <div className="tp-hero-demo-slot" />
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
        <p className="tp-compare-eyebrow">{t('compare.eyebrow')}</p>
        <h2 className="tp-compare-title">{t('compare.title')}</h2>
        <p className="tp-compare-subtitle">{t('compare.subtitle')}</p>

        <div className="tp-compare-grid">
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Zap size={24} /></div>
            <h3 className="tp-compare-card-title">{t('compare.card1.title')}</h3>
            <p className="tp-compare-card-desc">{t('compare.card1.desc')}</p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Target size={24} /></div>
            <h3 className="tp-compare-card-title">{t('compare.card2.title')}</h3>
            <p className="tp-compare-card-desc">{t('compare.card2.desc')}</p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Layers size={24} /></div>
            <h3 className="tp-compare-card-title">{t('compare.card3.title')}</h3>
            <p className="tp-compare-card-desc">{t('compare.card3.desc')}</p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Mic size={24} /></div>
            <h3 className="tp-compare-card-title">{t('compare.card4.title')}</h3>
            <p className="tp-compare-card-desc">{t('compare.card4.desc')}</p>
            <span className="tp-compare-coming-soon">{t('compare.comingSoon')}</span>
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
              <img src="/assets/Logo_dark.svg" alt="Final Table" className="mf-logo-img" />
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
  const gridRef = useRef(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll('.fs-card'))
    cards.forEach((card, i) => card.style.setProperty('--i', i))
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fs-card--visible')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    cards.forEach(card => io.observe(card))
    return () => io.disconnect()
  }, [])

  return (
    <section className="fs-section" id="features" data-nav-theme="light">
      <div className="fs-container">

        <div className="fs-head">
          <h2 className="fs-title">{t('features.title')}</h2>
          <p className="fs-subtitle">{t('features.subtitle')}</p>
        </div>

        <div className="fs-grid" ref={gridRef}>

          {/* 1. Opponent Profiles — wide */}
          <div className="fs-card fs-card-2">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-op-card">
                <div className="fs-op-header">
                  <div className="fs-op-avatar">MR</div>
                  <div className="fs-op-meta">
                    <p className="fs-op-name">Mike Reynolds</p>
                    <span className="fs-op-badge">LAG</span>
                  </div>
                  <span className="fs-op-hands">312 hands</span>
                </div>
                <div className="fs-op-bars">
                  {[
                    { label: 'VPIP', pct: 51, color: '#ef4444' },
                    { label: 'PFR',  pct: 38, color: '#f97316' },
                    { label: '3-bet', pct: 15, color: '#60a5fa' },
                    { label: 'Agg',  pct: 42, color: '#a78bfa' },
                  ].map((s, i) => (
                    <div key={i} className="fs-bar-row">
                      <span className="fs-bar-label">{s.label}</span>
                      <div className="fs-bar-track">
                        <div className="fs-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <span className="fs-bar-val">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.opponentProfiles.title')}</h3>
              <p className="fs-card-desc">{t('features.opponentProfiles.desc')}</p>
            </div>
          </div>

          {/* 2. Bankroll Tracking — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <svg className="fs-svg-chart" viewBox="0 0 140 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polygon points="0,70 0,58 20,52 40,45 55,50 75,32 100,24 120,14 140,4 140,70" fill="url(#bkGrad)"/>
                <polyline className="fs-chart-line" points="0,58 20,52 40,45 55,50 75,32 100,24 120,14 140,4"/>
              </svg>
              <div className="fs-goal-block">
                <div className="fs-goal-row">
                  <span className="fs-goal-label">Goal</span>
                  <span className="fs-goal-amount">$5,000</span>
                </div>
                <div className="fs-goal-track">
                  <div className="fs-goal-fill" style={{ '--goal': '68%' }} />
                </div>
                <p className="fs-goal-sub">$3,420 · 68% reached</p>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.bankroll.title')}</h3>
              <p className="fs-card-desc">{t('features.bankroll.desc')}</p>
            </div>
          </div>

          {/* 3. Quick Session Logger — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-logger">
                <div className="fs-logger-row">
                  <span className="fs-lr-label">Buy-in</span>
                  <span className="fs-lr-val">$200</span>
                </div>
                <div className="fs-logger-row">
                  <span className="fs-lr-label">Cash-out</span>
                  <span className="fs-lr-val">$485</span>
                </div>
                <div className="fs-logger-row">
                  <span className="fs-lr-label">Duration</span>
                  <span className="fs-lr-val">3h 40m</span>
                </div>
                <div className="fs-logger-result">
                  <span>Net profit</span>
                  <span className="fs-lr-profit">+$285</span>
                </div>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.sessionLogger.title')}</h3>
              <p className="fs-card-desc">{t('features.sessionLogger.desc')}</p>
            </div>
          </div>

          {/* 4. AI Hand Analysis — wide */}
          <div className="fs-card fs-card-2">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-ai-wrap">
                <div className="fs-ai-hand">
                  {[
                    { pos: 'UTG', act: 'Raise 3x  ·  $6', cards: 'A♠ K♥' },
                    { pos: 'BTN', act: '3-bet  ·  $18',   cards: '' },
                    { pos: 'UTG', act: 'Call',            cards: '' },
                  ].map((h, i) => (
                    <div key={i} className="fs-ai-row">
                      <span className="fs-ai-pos">{h.pos}</span>
                      <span className="fs-ai-act">{h.act}</span>
                      {h.cards && <span className="fs-ai-cards">{h.cards}</span>}
                    </div>
                  ))}
                </div>
                <div className="fs-ai-bubble">
                  <span className="fs-ai-chip">AI</span>
                  <p className="fs-ai-msg">Consider a 4-bet here. AK plays better as a 4-bet than a flat call vs this player's 3-bet frequency.</p>
                </div>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.handReview.title')}</h3>
              <p className="fs-card-desc">{t('features.handReview.desc')}</p>
            </div>
          </div>

          {/* 5. Multi-Table Tournaments — wide */}
          <div className="fs-card fs-card-2">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-mtt-list">
                {[
                  { name: 'Table 1',     players: 9, total: 9, tag: 'Running',  tagClass: 'fs-tag-running' },
                  { name: 'Table 2',     players: 8, total: 9, tag: 'Running',  tagClass: 'fs-tag-running' },
                  { name: 'Table 3',     players: 6, total: 9, tag: 'Breaking', tagClass: 'fs-tag-breaking' },
                  { name: 'Final Table', players: 4, total: 9, tag: 'Live',     tagClass: 'fs-tag-live' },
                ].map((row, i) => (
                  <div key={i} className="fs-mtt-row">
                    <span className="fs-mtt-name">{row.name}</span>
                    <div className="fs-mtt-pips">
                      {Array.from({ length: row.total }).map((_, j) => (
                        <div key={j} className={`fs-pip ${j < row.players ? 'fs-pip-on' : 'fs-pip-off'}`} />
                      ))}
                    </div>
                    <span className={`fs-mtt-tag ${row.tagClass}`}>{row.tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.mtt.title')}</h3>
              <p className="fs-card-desc">{t('features.mtt.desc')}</p>
            </div>
          </div>

          {/* 6. Dealer Mode — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-dealer-visual">
                <div className="fs-dealer-rings">
                  <div className="fs-dealer-ring fs-dr-1" />
                  <div className="fs-dealer-ring fs-dr-2" />
                  <div className="fs-dealer-ring fs-dr-3" />
                  <div className="fs-dealer-mic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0 0 14 0"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                      <line x1="9" y1="21" x2="15" y2="21"/>
                    </svg>
                  </div>
                </div>
                <p className="fs-dealer-cmd">"Next hand. Blinds: 200/400"</p>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">{t('features.dealerMode.title')} <span className="fs-coming-soon">{t('features.dealerMode.comingSoon')}</span></h3>
              <p className="fs-card-desc">{t('features.dealerMode.desc')}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}


/* ────────────────────────────────────────────────────── */
/*  FINAL CTA                                            */
/* ────────────────────────────────────────────────────── */
const getFinalFaqs = (t) => [0, 1, 2, 3].map(i => ({
  q: t(`faq.${i}.q`),
  a: t(`faq.${i}.a`),
}))

function TPFinalCTA() {
  const { t } = useT()
  const FINAL_FAQS = getFinalFaqs(t)
  const [form, setForm] = useState({ email: '', username: '' })
  const [status, setStatus] = useState('idle') // idle | sending | done | taken | error
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
      if (result.taken) {
        setStatus('taken')
        return
      }
      await submitToWaitlist(form.email).catch(() => {})
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="fc-section" data-nav-theme="dark">
      <div className="fc-inner">
        {/* Left — copy + avatars + FAQ */}
        <div className="fc-left">
          <p className="ru-eyebrow">{t('cta.eyebrow')}</p>
          <h2 className="ru-title">{t('cta.title')}</h2>
          <p className="ru-body">
            {t('cta.body')}
          </p>

          <div className="ru-proof">
            <div className="ru-avatars">
              {['A','J','K','Q','T'].map((l,i) => (
                <div key={i} className="ru-avatar" style={{ '--i': i }}>{l}</div>
              ))}
            </div>
            <p className="ru-proof-text">{t('cta.proof', { count: getPlayerCount() })}</p>
          </div>

          <div className="ru-faq" id="faq">
            {FINAL_FAQS.map((f, i) => (
              <div key={i} className={`ru-faq-item${openFaq === i ? ' ru-faq-open' : ''}`}>
                <button className="ru-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <svg className="ru-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="ru-faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          <p className="fc-support">{t('cta.support')}</p>
        </div>

        {/* Right — form card */}
        <div className="fc-right">
          <div className="ru-card">
            {status === 'done' ? (
              <div className="ru-success">
                <div className="ru-success-chip">{t('cta.successChip')}</div>
                <h3 className="ru-success-title">{t('cta.successTitle')}</h3>
                <p className="ru-success-body">
                  {t('cta.successBody', { username: form.username || 'yourhandle' })}
                </p>
                <button className="ru-success-reset" onClick={() => { setStatus('idle'); setForm({ email: '', username: '' }) }}>
                  {t('cta.resetBtn')}
                </button>
              </div>
            ) : (
              <>
                <div className="ru-card-header">
                  <p className="ru-card-title">{t('cta.cardTitle')}</p>
                  <p className="ru-card-sub">{t('cta.cardSub')}</p>
                </div>

                <form className="ru-form" onSubmit={handleSubmit}>
                  <div className="ru-field">
                    <label className="ru-label">{t('cta.labelEmail')}</label>
                    <input
                      className="ru-input"
                      type="email"
                      name="email"
                      placeholder={t('cta.emailPlaceholder')}
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <p className="ru-hint">{t('cta.hintEmail')}</p>
                  </div>

                  <div className="ru-field">
                    <label className="ru-label">
                      {t('cta.labelUsername')}
                      <span className="ru-char-count">{form.username.length}/20</span>
                    </label>
                    <div className="ru-input-prefix-wrap">
                      <span className="ru-prefix">@</span>
                      <input
                        className="ru-input ru-input-with-prefix"
                        type="text"
                        name="username"
                        placeholder={t('cta.usernamePlaceholder')}
                        value={form.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <p className="ru-hint">{t('cta.hintUsername')}</p>
                  </div>

                  {status === 'taken' && (
                    <p className="ru-error">{t('cta.errorTaken')}</p>
                  )}
                  {status === 'error' && (
                    <p className="ru-error">{t('cta.errorGeneric')}</p>
                  )}

                  <button className="ru-submit" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? t('cta.btnLoading') : t('cta.btnSubmit')}
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
        <TPBgSection />
        <TPProblems />
        <TPFeaturesShowcase />
        <TPFinalCTA />
      </main>
      <TPFooter />
    </div>
  )
}
