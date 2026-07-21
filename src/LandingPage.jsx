import { useState, useEffect, useRef, forwardRef } from 'react'
import { submitToWaitlist, submitNicknameClaim } from './lib/firebase'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import { FinalTableLogo } from './components/FinalTableLogo'
import './LandingPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru', tr: 'tr' }

function sendWelcomeEmail(email, platform) {
  fetch('/api/send-welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, platform })
  }).catch(() => {}) // fire-and-forget
}
function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

/* ── Deterministic daily player count ── */
function getPlayerCount() {
  const BASE = 283
  const START = new Date('2026-04-29')
  const now = new Date()
  const slots = Math.floor((now - START) / 10800000) // 3-hour slots
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

function HiwTitle({ text }) {
  const nl = text.indexOf('\n')
  if (nl === -1) return <p className="hiw-heading">{text}</p>
  const line1 = text.slice(0, nl)
  const line2 = text.slice(nl + 1)
  const dot1 = line1.endsWith('.')
  const dot2 = line2.endsWith('.')
  const core1 = dot1 ? line1.slice(0, -1) : line1
  const core2 = dot2 ? line2.slice(0, -1) : line2
  return (
    <div className="hiw-heading">
      <span>{core1}{dot1 && '.'}</span>
      <br />
      <em className="hiw-heading-italic">{core2}</em>{dot2 && '.'}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/*  NAVBAR                                                */
/* ────────────────────────────────────────────────────── */
function TPNavbar() {
  const { t, locale, setLocale } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
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

  useEffect(() => {
    const NAV_IDS = ['how-it-works', 'features', 'compare', 'faq']
    const updateActive = () => {
      const threshold = window.scrollY + 80
      let current = ''
      NAV_IDS.forEach(id => {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= threshold) current = id
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => window.removeEventListener('scroll', updateActive)
  }, [])

  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      e.preventDefault()
      setMenuOpen(false)
      if (window.__lenis) {
        window.__lenis.scrollTo(href)
      } else {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className={`tp-nav-wrap${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <div className="tp-nav-left">
          <a href="#" className="tp-nav-logo" onClick={(e) => { e.preventDefault(); if (window.__lenis) window.__lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <FinalTableLogo className="tp-nav-logo-svg" />
          </a>
          <div className="tp-nav-links">
            <a href="#how-it-works" className={activeSection === 'how-it-works' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.howItWorks')}</a>
            <a href="#features" className={activeSection === 'features' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.features')}</a>
            <a href="#compare" className={activeSection === 'compare' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.compare')}</a>
            <a href="/about">{t('about.nav')}</a>
            <a href="#faq" className={activeSection === 'faq' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.contact')}</a>
          </div>
        </div>
        <div className="tp-nav-right">
          <a href="#" className="tp-nav-download-btn" target="_blank" rel="noopener noreferrer">
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
        <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
        <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
        <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
        <a href="/about">{t('about.nav')}</a>
        <a href="#faq" onClick={smoothScroll}>{t('nav.contact')}</a>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */

function HeroDots() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement

    const state = {
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      w: 0,
      h: 0,
      mx: -9999,
      my: -9999,
      raf: 0,
    }

    const SPACING = 14
    const BASE_R = 0.7
    const MAX_R = 1.6
    const RADIUS = 260

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      state.w = rect.width
      state.h = rect.height
      canvas.width = Math.floor(rect.width * state.dpr)
      canvas.height = Math.floor(rect.height * state.dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      state.mx = e.clientX - rect.left
      state.my = e.clientY - rect.top
    }
    const onLeave = () => { state.mx = -9999; state.my = -9999 }

    const draw = () => {
      ctx.clearRect(0, 0, state.w, state.h)
      const { mx, my } = state
      const cols = Math.ceil(state.w / SPACING) + 1
      const rows = Math.ceil(state.h / SPACING) + 1
      const offX = (state.w - (cols - 1) * SPACING) / 2
      const offY = (state.h - (rows - 1) * SPACING) / 2
      const baseAlpha = 0.14

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * SPACING
          const y = offY + j * SPACING
          const dx = x - mx
          const dy = y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          const t = Math.max(0, 1 - dist / RADIUS)
          const r = BASE_R + (MAX_R - BASE_R) * t
          const alpha = baseAlpha + 0.4 * t
          const shade = Math.round(255 - 90 * t)
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      state.raf = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(state.raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="tp-hero-dots" aria-hidden="true" />
}

function TPHero() {
  const { t } = useT()
  const heroRef = useRef(null)
  const phonesRef = useRef(null)

  useEffect(() => {
    const phones = phonesRef.current
    if (!phones) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { phones.classList.add('in-view'); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(phones)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const phones = phonesRef.current
    if (!hero || !phones) return
    const centerSlot = phones.querySelector('.tp-hero-phone-slot-center')
    const sideSlots = phones.querySelectorAll('.tp-hero-phone-slot-left, .tp-hero-phone-slot-right')

    let raf = 0
    const update = () => {
      raf = 0
      if (window.innerWidth < 768) {
        if (centerSlot) centerSlot.style.transform = ''
        sideSlots.forEach(el => { el.style.transform = '' })
        return
      }
      const rect = hero.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
      if (centerSlot) centerSlot.style.transform = `translateY(${progress * 40}px)`
      sideSlots.forEach(el => { el.style.transform = `translateY(${progress * 20}px)` })
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={heroRef} className="tp-hero" data-nav-theme="dark">
      <HeroDots />
      <div className="tp-hero-inner">
        <div className="tp-hero-content">
          <h1 className="tp-hero-h1">
            {t('hero.h1').map((line, i) => (
              <span key={i} className="tp-hero-h1-line">{line}</span>
            ))}
          </h1>
          <p className="tp-hero-sub">{t('hero.sub')}</p>
          <div className="tp-hero-ctas">
            <a href="#" className="tp-hero-cta" target="_blank" rel="noopener noreferrer">
              {t('nav.download')}
            </a>
          </div>
        </div>
        <div ref={phonesRef} className="tp-hero-phones" aria-hidden="true">
          <svg className="tp-hero-lines" viewBox="0 0 1400 520" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="tpHeroLineFade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="15%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.85)" />
                <stop offset="85%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path className="tp-hero-line tp-hero-line-1" d="M -40 220 C 260 220, 400 470, 700 470 S 1140 220, 1440 220" />
            <path className="tp-hero-line tp-hero-line-2" d="M -40 260 C 280 260, 420 500, 700 500 S 1120 260, 1440 260" />
            <path className="tp-hero-line tp-hero-line-3" d="M -40 190 C 240 190, 380 440, 700 440 S 1160 190, 1440 190" />
          </svg>
          <div className="tp-hero-phone-slot tp-hero-phone-slot-left">
            <img src="/hero_phone_left.png" alt="" className="tp-hero-phone tp-hero-phone-left" />
          </div>
          <div className="tp-hero-phone-slot tp-hero-phone-slot-right">
            <img src="/hero_phone_right.png" alt="" className="tp-hero-phone tp-hero-phone-right" />
          </div>
          <div className="tp-hero-phone-slot tp-hero-phone-slot-center">
            <img src="/hero_phone_center.png" alt="" className="tp-hero-phone tp-hero-phone-center" />
          </div>
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
/*  Letter-by-letter reveal on scroll                     */
/* ────────────────────────────────────────────────────── */
function LetterReveal({ text, className = '', tag: Tag = 'h2' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`${className} lr-wrap${visible ? ' lr-visible' : ''}`}>
      {text.split('').map((ch, i) => (
        <span key={i} className="lr-char" style={{ transitionDelay: `${i * 40}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HOW IT WORKS  (3-card Figma layout)                   */
/* ────────────────────────────────────────────────────── */
function TPHowItWorks() {
  const { t } = useT()
  const [active, setActive] = useState(0)

  const states = [
    { key: 'hiw', color: '/hiw_opponents_color.png', dashed: '/hiw_opponents.png' },
    { key: 'hiw.stats', color: '/hiw_stats_color.png', dashed: '/hiw_stats.png' },
    { key: 'hiw.session', color: '/hiw_session_analytics_color.png', dashed: '/hiw_session_analytics.png' },
  ]
  const navIcons = ['/hiw_tab_users.svg', '/hiw_tab_stats.svg', '/hiw_tab_clock.svg']

  const cur = states[active]

  // Figma X positions per phone (left edge, on 1512-wide canvas). Frame is always centered at 756.
  const phonePositions = [572, 974, 1387]
  // Distance we need to shift everything so the active phone lands at slot 0 (opponents position = 572).
  const trackShift = phonePositions[0] - phonePositions[active]

  return (
    <section className="hiw-section" id="how-it-works" data-nav-theme="dark">
      <div className="hiw-canvas">
        <div className="hiw-text">
          <p className="hiw-eyebrow">{t('hiw.section.title')}</p>
          <h2 className="hiw-title">
            {t(`${cur.key}.title`).map((line, i) => (
              <span key={i} className="hiw-title-line">{line}</span>
            ))}
          </h2>
          <p className="hiw-body">{t(`${cur.key}.body`)}</p>
        </div>

        <div className="hiw-track" style={{ transform: `translateX(${trackShift}px)` }}>
          {states.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`hiw-slide ${i === active ? 'is-active' : ''}`}
              style={{ left: `${phonePositions[i]}px` }}
              onClick={() => setActive(i)}
              aria-label={s.key}
            >
              <img
                src={i === active ? s.color : s.dashed}
                alt=""
                className="hiw-slide-img"
              />
            </button>
          ))}
        </div>

        <img src="/hiw_iphone.png" alt="" className="hiw-frame-overlay" aria-hidden="true" />

        <div className="hiw-mini-nav" role="tablist" aria-label="How it works stages">
          <span className="hiw-mini-highlight" data-pos={active} />
          {navIcons.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`hiw-mini-btn ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-selected={i === active}
              role="tab"
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  WHAT FINAL TABLE ISN'T                                */
/* ────────────────────────────────────────────────────── */
function TPNotHud() {
  const { t } = useT()
  const gridRef = useRef(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.nh-card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('nh-card--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const cards = [
    { titleKey: 'notHud.item1Title', descKey: 'notHud.item1Desc' },
    { titleKey: 'notHud.item2Title', descKey: 'notHud.item2Desc' },
    { titleKey: 'notHud.item3Title', descKey: 'notHud.item3Desc' },
  ]
  return (
    <section className="nh-section" data-nav-theme="dark">
      <div className="nh-inner">
        <h2 className="nh-title">{t('notHud.title')}</h2>
        <div className="nh-grid" ref={gridRef}>
          {cards.map(({ titleKey, descKey }, i) => (
            <div key={titleKey} className="nh-card" style={{ transitionDelay: `${i * 100}ms` }}>
              <h3 className="nh-card-title">{t(titleKey)}</h3>
              <p className="nh-card-desc">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BUCKLE UP — features preview with scroll-linked phone */
/* ────────────────────────────────────────────────────── */
function TPBuckleUp() {
  const { t } = useT()
  const [active, setActive] = useState(0)
  const cp0 = useRef(null)
  const cp1 = useRef(null)
  const cp2 = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.state))
        })
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    )
    ;[cp0, cp1, cp2].forEach((r) => r.current && obs.observe(r.current))
    return () => obs.disconnect()
  }, [])

  const features = [
    { key: 'buckle.stats', screen: '/hiw_stats_color.png', ref: cp0 },
    { key: 'buckle.bankroll', screen: '/hiw_session_analytics_color.png', ref: cp1 },
    { key: 'buckle.ai', screen: '/hiw_opponents_color.png', ref: cp2 },
  ]

  return (
    <section className="bu-section" data-nav-theme="dark">
      <div className="bu-inner">
        <div className="bu-left">
          <div className="bu-header">
            <h2 className="bu-title">
              {t('buckle.title').map((line, j) => (
                <span key={j} className="bu-title-line">{line}</span>
              ))}
            </h2>
            <p className="bu-subtitle">{t('buckle.subtitle')}</p>
          </div>
          <div className="bu-features">
            {features.map((f, i) => (
              <div key={i} ref={f.ref} data-state={i} className="bu-feature">
                <div className="bu-feature-line" aria-hidden="true" />
                <div className="bu-feature-body">
                  <h3 className="bu-feature-title">{t(`${f.key}.title`)}</h3>
                  <p className="bu-feature-desc">{t(`${f.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="bu-visual">
          <div className="bu-phone">
            {features.map((f, i) => (
              <img
                key={i}
                src={f.screen}
                alt=""
                className="bu-phone-screen"
                style={{ opacity: active === i ? 1 : 0 }}
              />
            ))}
            <img src="/hiw_iphone.png" alt="" className="bu-phone-frame" />
          </div>
        </aside>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BUILT FOR THE LIVE GAME — 2x2 feature grid            */
/* ────────────────────────────────────────────────────── */
function TPBuiltForLive() {
  const { t } = useT()
  const cards = [
    { titleKey: 'live.gesture.title', descKey: 'live.gesture.desc' },
    { titleKey: 'live.reads.title', descKey: 'live.reads.desc' },
    { titleKey: 'live.session.title', descKey: 'live.session.desc' },
    { titleKey: 'live.dealer.title', descKey: 'live.dealer.desc', badge: true },
  ]

  return (
    <section className="bfl-section" data-nav-theme="dark">
      <div className="bfl-inner">
        <div className="bfl-header">
          <p className="bfl-eyebrow">{t('live.eyebrow')}</p>
          <h2 className="bfl-title">
            {t('live.title').map((line, j) => (
              <span key={j} className="bfl-title-line">{line}</span>
            ))}
          </h2>
        </div>
        <div className="bfl-grid">
          {cards.map(({ titleKey, descKey, badge }, i) => (
            <div key={i} className="bfl-card">
              <div className="bfl-card-media" aria-hidden="true" />
              <h3 className="bfl-card-title">{t(titleKey)}</h3>
              <p className="bfl-card-desc">{t(descKey)}</p>
              {badge && (
                <div className="bfl-card-badge">
                  <span className="bfl-badge-pill">{t('live.dealer.badge')}</span>
                  <span className="bfl-badge-tag">{t('live.dealer.tag')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DISCORD — JOIN THE COMMUNITY                          */
/* ────────────────────────────────────────────────────── */
function TPDiscord() {
  const { t } = useT()

  const messages = [
    { key: 'msg1', avatarColor: '#5865f2', initial: 'M', showRole: true },
    { key: 'msg2', avatarColor: '#43b581', initial: 'FT', showRole: false },
    { key: 'msg3', avatarColor: '#f47fff', initial: 'M', showRole: true },
  ]

  return (
    <section className="dc-section" data-nav-theme="dark">
      <div className="dc-inner">
        <div className="dc-left">
          <p className="dc-eyebrow">{t('discord.eyebrow')}</p>
          <h2 className="dc-title">{t('discord.title')}</h2>
          <p className="dc-body">{t('discord.body')}</p>
          <a
            className="dc-cta"
            href="https://discord.gg/finaltable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.075.075 0 0 0-.079.037c-.34.6-.717 1.383-.98 1.998a18.27 18.27 0 0 0-5 0 12.6 12.6 0 0 0-.995-1.998.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 5.664 4.37a.07.07 0 0 0-.032.027C2.533 8.66 1.678 12.82 2.098 16.928a.083.083 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.09 13.09 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.28 12.28 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.699.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-4.744-.838-8.87-3.548-12.532a.06.06 0 0 0-.031-.028zM8.02 14.422c-1.183 0-2.157-1.085-2.157-2.418 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.418 0-1.333.955-2.419 2.157-2.419 1.211 0 2.175 1.095 2.157 2.419 0 1.333-.946 2.418-2.157 2.418z" fill="#000"/>
            </svg>
            <span>{t('discord.cta')}</span>
          </a>
        </div>
        <div className="dc-right">
          <div className="dc-card">
            <div className="dc-tabs">
              <span className="dc-tab">{t('discord.tab1')}</span>
              <span className="dc-tab-sep" aria-hidden="true" />
              <span className="dc-tab">{t('discord.tab2')}</span>
            </div>
            <div className="dc-inner-card">
              <div className="dc-server-head">
                <div className="dc-server-logo" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.075.075 0 0 0-.079.037c-.34.6-.717 1.383-.98 1.998a18.27 18.27 0 0 0-5 0 12.6 12.6 0 0 0-.995-1.998.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 5.664 4.37a.07.07 0 0 0-.032.027C2.533 8.66 1.678 12.82 2.098 16.928a.083.083 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.09 13.09 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.28 12.28 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.699.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-4.744-.838-8.87-3.548-12.532a.06.06 0 0 0-.031-.028z" fill="#fff"/>
                  </svg>
                </div>
                <span className="dc-server-name">{t('discord.server.name')}</span>
                <span className="dc-server-type">{t('discord.server.type')}</span>
                <span className="dc-server-status"><span className="dc-status-dot" aria-hidden="true" />{t('discord.status')}</span>
              </div>
              <div className="dc-messages">
                {messages.map(({ key, avatarColor, initial, showRole }) => (
                  <div key={key} className="dc-msg">
                    <div className="dc-avatar" style={{ background: avatarColor }}>{initial}</div>
                    <div className="dc-msg-body">
                      <div className="dc-msg-head">
                        <span className="dc-msg-name">{t(`discord.${key}.name`)}</span>
                        {showRole && <span className="dc-msg-role">{t(`discord.${key}.role`)}</span>}
                        <span className="dc-msg-time">{t(`discord.${key}.time`)}</span>
                      </div>
                      <p className="dc-msg-text">{t(`discord.${key}.text`)}</p>
                    </div>
                  </div>
                ))}
                <div className="dc-typing">
                  <div className="dc-avatar dc-avatar-you" style={{ background: '#faa61a' }}>YOU</div>
                  <div className="dc-typing-bubble" aria-hidden="true">
                    <span className="dc-dot" /><span className="dc-dot" /><span className="dc-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BOTTOM CTA                                            */
/* ────────────────────────────────────────────────────── */
function TPBottomCTA() {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [platform, setPlatform] = useState('ios')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async e => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    try {
      const result = await submitToWaitlist(email, '', '', platform)
      if (result?.status === 'already') { setStatus('already'); return }
      if (result?.status === 'new') sendWelcomeEmail(email, platform)
      setStatus('done')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bc-section" data-nav-theme="light">
      <div className="bc-inner">
        <div className="bc-left">
          <a href="#" className="bc-logo">
            <img src="/logo.png" alt="Final Table" className="bc-logo-img" />
          </a>
          <div className="bc-content">
            <div className="bc-headline-group">
              <h2 className="bc-h2">{t('bottomCta.title')}</h2>
              <p className="bc-sub">{t('bottomCta.sub')}</p>
            </div>
            <div className="bc-form-group">
              {status === 'done' || status === 'already' ? (
                <div className="tp-hero-waitlist-success">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                  <span className="tp-hero-success-text">{status === 'already' ? t('hero.already') : t('hero.successText')}</span>
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
                  <div className="fc-platform-toggle fc-platform-toggle-inline">
                    <button type="button" className={`fc-platform-btn${platform === 'ios' ? ' fc-platform-active' : ''}`} onClick={() => setPlatform('ios')}>
                      <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      iOS
                    </button>
                    <button type="button" className={`fc-platform-btn${platform === 'android' ? ' fc-platform-active' : ''}`} onClick={() => setPlatform('android')}>
                      <svg width="14" height="14" viewBox="0 0 576 512" fill="currentColor"><path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48l47.94-83a10 10 0 1 0-17.27-10l-48.54 84.07a306.2 306.2 0 0 0-134.63 0l-48.54-84.07a10 10 0 1 0-17.27 10l47.94 83C208.09 194.27 160 270.33 160 360h416c0-89.67-48.09-165.73-136.85-202.55"/></svg>
                      Android
                    </button>
                  </div>
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
          </div>
        </div>
        <div className="bc-right" aria-hidden="true">
          <img src="/cta_cluster.png" alt="" className="bc-phone-img" />
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FOOTER                                                */
/* ────────────────────────────────────────────────────── */
const TPFooter = forwardRef(function TPFooter(_, ref) {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy' },
    { title: t('footer.terms'),    href: '/terms' },
  ]

  const resources = [
    { title: t('nav.howItWorks'),   href: '#how-it-works' },
    { title: t('nav.features'),     href: '#features' },
    { title: t('nav.compare'),      href: '#compare' },
    { title: t('about.nav'),        href: '/about' },
    { title: t('nav.faq'),          href: '#faq' },
  ]

  return (
    <footer ref={ref} className="mf-footer">
      <div className="mf-inner">
        <a href="#" className="mf-logo">
          <img src="/logo.png" alt="Final Table" className="mf-logo-img" />
        </a>

        <div className="mf-grid">
          <div className="mf-brand">
            <div className="mf-brand-content">
              <div className="mf-headline">
                {t('footer.tagline')}
              </div>
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
        <div className="mf-bottom-row">
          <p className="mf-copy">{t('footer.copy', { year })}</p>
          <a href="https://discord.gg/bEFGeAR6X" target="_blank" rel="noopener noreferrer" className="mf-discord-link" aria-label="Join our Discord">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mf-discord-icon" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
})

/* ────────────────────────────────────────────────────── */
/*  FIXED TAB BAR                                         */
/* ────────────────────────────────────────────────────── */
const getTabs = (t) => [
  { icon: IMG_TAB_ICON_1, label: t('tabs.0.label'), mockup: '/phonemain_1.png' },
  { icon: IMG_TAB_ICON_2, label: t('tabs.1.label'), mockup: '/at_the_table_1.png' },
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

/* ────────────────────────────────────────────────────── */
/*  FINAL CTA  (Figma 110:9602)                          */
/* ────────────────────────────────────────────────────── */
const getFinalFaqs = (t) => [0, 1, 2, 3].map(i => ({
  q: t(`faq.${i}.q`),
  a: t(`faq.${i}.a`),
}))


function TPFinalCTA() {
  const { t } = useT()
  const FINAL_FAQS = getFinalFaqs(t)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '' })
  const [platform, setPlatform] = useState('ios')
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
      const result = await submitNicknameClaim(form.username, form.email, form.firstName, form.lastName, platform)
      if (result.taken) { setStatus('taken'); return }
      const wlResult = await submitToWaitlist(form.email, form.firstName, form.lastName, platform).catch(() => ({}))
      if (wlResult?.status === 'new') sendWelcomeEmail(form.email, platform)
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
                    <img
                      src="/plus-bold.svg"
                      alt=""
                      className={`fc-faq-icon${openFaq === i ? ' fc-faq-icon-open' : ''}`}
                    />
                  </button>
                  <div className="fc-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
            <p className="fc-support">{t('cta.support')}</p>
          </div>

          {/* Form card */}
          <div className="fc-card">
            <div className="fc-card-header">
              <p className="fc-card-title">
                7-day free trial to<br /><em>Reserve Username in advance</em>
              </p>
            </div>
            <form className="fc-form" onSubmit={handleSubmit}>
              <div className="fc-fields">
                <div className="fc-top-fields">
                  <div className="fc-name-row">
                    <input className="fc-input" type="text" name="firstName" placeholder="Enter first name" value={form.firstName} onChange={handleChange} />
                    <input className="fc-input" type="text" name="lastName" placeholder="Enter last name" value={form.lastName} onChange={handleChange} />
                  </div>
                  <div className="fc-field-group">
                    <input className="fc-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                    <p className="fc-hint">Your future sign-in email — this can't be changed later.</p>
                  </div>
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
              <div className="fc-platform-toggle">
                <button
                  type="button"
                  className={`fc-platform-btn${platform === 'ios' ? ' fc-platform-active' : ''}`}
                  onClick={() => setPlatform('ios')}
                >
                  <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  iOS
                </button>
                <button
                  type="button"
                  className={`fc-platform-btn${platform === 'android' ? ' fc-platform-active' : ''}`}
                  onClick={() => setPlatform('android')}
                >
                  <svg width="16" height="16" viewBox="0 0 576 512" fill="currentColor"><path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48l47.94-83a10 10 0 1 0-17.27-10l-48.54 84.07a306.2 306.2 0 0 0-134.63 0l-48.54-84.07a10 10 0 1 0-17.27 10l47.94 83C208.09 194.27 160 270.33 160 360h416c0-89.67-48.09-165.73-136.85-202.55"/></svg>
                  Android
                </button>
              </div>
              {status === 'taken' && <p className="ru-error">{t('cta.errorTaken')}</p>}
              {status === 'error' && <p className="ru-error">{t('cta.errorGeneric')}</p>}
              <button className="fc-submit" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? t('cta.btnLoading') : 'Reserve my spot'}
                {status !== 'sending' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Success modal overlay */}
          {status === 'done' && (
            <div className="spotlight-success-overlay" onClick={() => { setStatus('idle'); setForm({ firstName: '', lastName: '', email: '', username: '' }) }}>
              <div className="spotlight-success-card" onClick={e => e.stopPropagation()}>
                <p className="spotlight-success-pretitle">
                  3 months free trial to{' '}
                  <em>Reserve Username in advance</em>
                </p>
                <div className="spotlight-success-body">
                  <svg className="spotlight-success-icon" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="ssi-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6dd5c0" />
                        <stop offset="100%" stopColor="#1ea87c" />
                      </linearGradient>
                    </defs>
                    <circle cx="17" cy="17" r="17" fill="url(#ssi-grad)" />
                    <path d="M10.5 17.5L14.5 21.5L23.5 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="spotlight-success-heading">You're on the list!</h3>
                  <p className="spotlight-success-text">We'll drop you a note once Final Table is live. Until then dream up your next game. We'll take care of the rest.</p>
                </div>
                <button
                  className="spotlight-success-btn"
                  onClick={() => { setStatus('idle'); setForm({ firstName: '', lastName: '', email: '', username: '' }) }}
                >
                  Reserve another
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const footerRef = useRef(null)

  useEffect(() => {
    if (typeof Lenis === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({
      duration: 1.8,
      easing: t => 1 - Math.pow(1 - t, 4),
    })
    window.__lenis = lenis
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => { lenis.destroy(); delete window.__lenis }
  }, [])

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    const update = () => {
      document.documentElement.style.setProperty('--footer-height', footer.offsetHeight + 'px')
    }
    const ro = new ResizeObserver(update)
    ro.observe(footer)
    update()
    return () => ro.disconnect()
  }, [])

  return (
    <div className="tp-root">
      <TPNavbar />
      <div className="tp-page-body">
        <main>
          <TPHero />
          <TPHowItWorks />
          <TPNotHud />
          <TPBuckleUp />
          <TPBuiltForLive />
          <TPDiscord />
        </main>
      </div>
      <TPFooter ref={footerRef} />
    </div>
  )
}
