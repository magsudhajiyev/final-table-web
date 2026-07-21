import { useState, useEffect, useRef, forwardRef } from 'react'
import { submitToWaitlist, submitNicknameClaim } from './lib/firebase'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import { FinalTableLogo } from './components/FinalTableLogo'
import './LandingPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru', tr: 'tr', uk: 'ua' }

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
    const R = 0.7
    const BASE_ALPHA = 0.14
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

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * SPACING
          const y = offY + j * SPACING
          const dx = x - mx
          const dy = y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          const t = Math.max(0, 1 - dist / RADIUS)
          const alpha = BASE_ALPHA + 0.4 * t
          const shade = Math.round(255 - 90 * t)
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, R, 0, Math.PI * 2)
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

const HERO_H1_ROTATORS = {
  en: { prefix: 'Log a hand ', words: ['in three gestures', 'effortlessly', 'in seconds'], suffix: '.' },
  de: { prefix: 'Erfasse eine Hand ', words: ['in drei Gesten', 'mühelos', 'in Sekunden'], suffix: '.' },
  es: { prefix: 'Registra una mano ', words: ['en tres gestos', 'sin esfuerzo', 'en segundos'], suffix: '.' },
  fr: { prefix: 'Enregistre une main ', words: ['en trois gestes', 'sans effort', 'en quelques secondes'], suffix: '.' },
  pl: { prefix: 'Zapisz rozdanie ', words: ['w trzech gestach', 'bez wysiłku', 'w sekundę'], suffix: '.' },
  pt: { prefix: 'Registre uma mão ', words: ['em três gestos', 'sem esforço', 'em segundos'], suffix: '.' },
  ru: { prefix: 'Запиши раздачу ', words: ['за три жеста', 'без усилий', 'за секунды'], suffix: '.' },
  tr: { prefix: 'Bir eli ', words: ['üç hareketle', 'zahmetsizce', 'saniyeler içinde'], suffix: ' kaydet.' },
  uk: { prefix: 'Записуй роздачу ', words: ['в три жести', 'без зусиль', 'за секунди'], suffix: '.' },
}

function TPHero() {
  const { t, locale } = useT()
  const heroRef = useRef(null)
  const phonesRef = useRef(null)
  const rot = HERO_H1_ROTATORS[locale]
  const [rotIdx, setRotIdx] = useState(0)

  useEffect(() => {
    if (!rot) return
    const id = setInterval(() => setRotIdx(i => (i + 1) % rot.words.length), 2200)
    return () => clearInterval(id)
  }, [rot])

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
            {rot ? (
              <>
                <span className="tp-hero-h1-line">
                  {rot.prefix}
                  <span className="tp-hero-h1-rot">
                    <span key={rotIdx} className="tp-hero-h1-rot-word">{rot.words[rotIdx]}</span>
                  </span>
                  {rot.suffix}
                </span>
                <span className="tp-hero-h1-line">{t('hero.h1')[1]}</span>
              </>
            ) : (
              t('hero.h1').map((line, i) => (
                <span key={i} className="tp-hero-h1-line">{line}</span>
              ))
            )}
          </h1>
          <p className="tp-hero-sub">{t('hero.sub')}</p>
          <div className="tp-hero-ctas">
            <a href="#" className="tp-hero-store-btn" aria-label="Download on the App Store" target="_blank" rel="noopener noreferrer">
              <img src="/store_appstore.svg" alt="" className="tp-hero-store-img" />
            </a>
            <a href="#" className="tp-hero-store-btn" aria-label="Get it on Google Play" target="_blank" rel="noopener noreferrer">
              <img src="/store_googleplay.svg" alt="" className="tp-hero-store-img" />
            </a>
          </div>
        </div>
        <div ref={phonesRef} className="tp-hero-phones" aria-hidden="true">
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
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  const wrapperRef = useRef(null)
  const stickyRef = useRef(null)
  const autoRef = useRef(null)
  const canvasRef = useRef(null)
  const statsDashedRef = useRef(null)
  const statsColorRef = useRef(null)
  const sessDashedRef = useRef(null)
  const sessColorRef = useRef(null)

  const stages = [{ key: 'hiw' }, { key: 'hiw.stats' }, { key: 'hiw.session' }]
  const navTabs = [
    { src: '/hiw_nav_users.svg', mod: 'users' },
    { src: '/hiw_nav_stats.svg', mod: 'stats' },
    { src: '/hiw_nav_clock.svg', mod: 'clock' },
  ]

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    if (isMobile) {
      // Mobile: no scroll choreography — stages auto-cycle and screens
      // crossfade in place (dashed screens are hidden in CSS). The canvas
      // is scaled so the nav bar (widest element, 690px) spans the viewport.
      const applyScale = () => {
        const canvas = canvasRef.current
        const sticky = stickyRef.current
        if (!canvas || !sticky) return
        const s = Math.min(1, window.innerWidth / 720)
        canvas.style.transform = `scale(${s.toFixed(4)})`
        sticky.style.height = `${Math.round(1050 * s)}px`
      }
      window.addEventListener('resize', applyScale)
      applyScale()
      autoRef.current = setInterval(() => setActive(a => (a + 1) % 3), 4000)
      return () => {
        window.removeEventListener('resize', applyScale)
        clearInterval(autoRef.current)
        autoRef.current = null
      }
    }

    const sticky = stickyRef.current
    if (sticky) sticky.style.height = ''

    // Geometry on the 1512x1050 canvas (frame window measured from hiw2_frame.png alpha,
    // enlarged ~27% with the bottom 25% cropped at the y=910 cut line).
    const WIN_X = 533.79           // settled screen position (window left edge)
    const WIN_R = 533.79 + 444.42  // window right edge — the color/dashed split line
    const PARK = 1032              // parked "next up" slot
    const ENTER = 1420             // where a queued screen fades in from
    const BOT = 217.3              // dashed bottom inset so the crop lands on y=910

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const LERP = reduce ? 1 : 0.16

    // Scroll-linked until halfway (0..0.5 -> 0..40% in), then the target jumps to
    // fully-in and the LERP eases it home. Reversing past 0.5 jumps the target back
    // to 40%-in: a fast eased ~60% slide-out, then scroll-linked the rest of the way.
    const inFrac = (p) => (p >= 0.5 ? 1 : Math.max(0, p) * 0.8)
    const clamp01 = (v) => Math.max(0, Math.min(1, v))

    const pos = { stats: PARK, sess: ENTER, sessOp: 0 }
    let rafId = null
    let running = false
    let activeIdx = 0

    const apply = () => {
      const sd = statsDashedRef.current, sc = statsColorRef.current
      const zd = sessDashedRef.current, zc = sessColorRef.current
      if (sd) {
        sd.style.transform = `translateX(${pos.stats.toFixed(2)}px)`
        sd.style.clipPath = `inset(0 0 ${BOT}px ${Math.max(0, WIN_R - pos.stats).toFixed(2)}px)`
      }
      if (sc) sc.style.transform = `translateX(${(pos.stats - WIN_X).toFixed(2)}px)`
      if (zd) {
        zd.style.transform = `translateX(${pos.sess.toFixed(2)}px)`
        zd.style.clipPath = `inset(0 0 ${BOT}px ${Math.max(0, WIN_R - pos.sess).toFixed(2)}px)`
        zd.style.opacity = pos.sessOp.toFixed(3)
      }
      if (zc) zc.style.transform = `translateX(${(pos.sess - WIN_X).toFixed(2)}px)`
    }

    const tick = () => {
      const rect = wrapper.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      // fi: 0..2 across the two transitions (stats in, then sessions in)
      const fi = total > 0 ? clamp01(-rect.top / total) * 2 : 0

      const tStats = PARK + (WIN_X - PARK) * inFrac(clamp01(fi))
      let tSess, tSessOp
      if (fi < 1) {
        // queued: fade + drift in from the right, driven by the same commit curve
        // as the slide-in — so when stats snaps into the frame, sessions snaps
        // forward into the parking slot (same rest gap) and waits there.
        const q = inFrac(clamp01(fi))
        tSess = ENTER + (PARK - ENTER) * q
        tSessOp = q
      } else {
        tSess = PARK + (WIN_X - PARK) * inFrac(fi - 1)
        tSessOp = 1
      }

      const a = fi < 0.5 ? 0 : fi < 1.5 ? 1 : 2
      if (a !== activeIdx) { activeIdx = a; setActive(a) }

      pos.stats += (tStats - pos.stats) * LERP
      pos.sess += (tSess - pos.sess) * LERP
      pos.sessOp += (tSessOp - pos.sessOp) * LERP
      const needsMore =
        Math.abs(pos.stats - tStats) > 0.05 ||
        Math.abs(pos.sess - tSess) > 0.05 ||
        Math.abs(pos.sessOp - tSessOp) > 0.002
      if (!needsMore) { pos.stats = tStats; pos.sess = tSess; pos.sessOp = tSessOp }
      apply()

      if (needsMore) rafId = requestAnimationFrame(tick)
      else running = false
    }

    const onScroll = () => {
      if (!running) { running = true; rafId = requestAnimationFrame(tick) }
    }

    // Scale the fixed 1512x1050 canvas to fit inside the pinned viewport
    const applyScale = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const s = Math.min(1, window.innerWidth / 1512, window.innerHeight / 1050)
      canvas.style.transform = `scale(${s.toFixed(4)})`
    }
    const onResize = () => { applyScale(); onScroll() }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    applyScale()
    tick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  const jumpTo = (i) => {
    if (autoRef.current) {
      // Mobile auto-cycle: jump straight to the stage and restart the timer
      clearInterval(autoRef.current)
      autoRef.current = setInterval(() => setActive(a => (a + 1) % 3), 4000)
      setActive(i)
      return
    }
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const target = window.scrollY + rect.top + (i / 2) * total
    if (window.__lenis) window.__lenis.scrollTo(target)
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  const textInner = (
    <>
      <p className="hiw-eyebrow">{t('hiw.section.title')}</p>
      <div className="hiw-text-stack">
        {stages.map((s, i) => (
          <div key={s.key} className={`hiw-stage-text${i === active ? ' is-active' : ''}`}>
            <h2 className="hiw-title">
              {t(`${s.key}.title`).map((line, j) => (
                <span key={j} className="hiw-title-line">{line}</span>
              ))}
            </h2>
            <p className="hiw-body">{t(`${s.key}.body`)}</p>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <section className="hiw-section" id="how-it-works" ref={wrapperRef} data-nav-theme="dark">
      {/* Mobile-only copy of the text, outside the scaled canvas so it stays crisp */}
      <div className="hiw-text hiw-text--mobile">{textInner}</div>
      <div className="hiw-sticky" ref={stickyRef}>
        <div className="hiw-text hiw-text--desktop">{textInner}</div>
        <div className="hiw-canvas" ref={canvasRef}>
          {/* Color screens, clipped to the frame's screen window. Stack order = stage order.
              On mobile they crossfade in place via .is-on instead of sliding. */}
          <div className="hiw-clip" aria-hidden="true">
            <img src="/hiw2_opponents_color.png" alt="" className={`hiw-screen${active === 0 ? ' is-on' : ''}`} />
            <img ref={statsColorRef} src="/hiw2_stats_color.png" alt="" className={`hiw-screen${active === 1 ? ' is-on' : ''}`} style={{ transform: 'translateX(498.21px)' }} />
            <img ref={sessColorRef} src="/hiw2_sessions_color.png" alt="" className={`hiw-screen${active === 2 ? ' is-on' : ''}`} style={{ transform: 'translateX(886.21px)' }} />
          </div>

          {/* Fixed iPhone frame (transparent screen window) */}
          <img src="/hiw2_frame.png" alt="" className="hiw-frame" aria-hidden="true" />

          {/* Dashed screens: visible only right of the window edge (clip-path), slide under the bezel */}
          <img ref={statsDashedRef} src="/hiw2_stats_dashed.png" alt="" className="hiw-dashed" style={{ transform: 'translateX(1032px)', clipPath: 'inset(0 0 217.3px 0)' }} aria-hidden="true" />
          <img ref={sessDashedRef} src="/hiw2_sessions_dashed.png" alt="" className="hiw-dashed" style={{ transform: 'translateX(1420px)', clipPath: 'inset(0 0 217.3px 0)', opacity: 0 }} aria-hidden="true" />

          {/* App tab bar (Figma 2081:18100) floating over the phone's cut-off bottom */}
          <div className="hiw-nav">
            <div className="hiw-nav-pill" role="tablist" aria-label="How it works stages">
              <span className="hiw-nav-highlight" data-pos={active} />
              <span className="hiw-nav-item" aria-hidden="true">
                <span className="hiw-nav-ico"><span className="hiw-nav-vec hiw-nav-vec--home"><img src="/hiw_nav_home.svg" alt="" /></span></span>
              </span>
              {navTabs.map((tab, i) => (
                <button
                  key={tab.mod}
                  type="button"
                  className={`hiw-nav-item hiw-nav-btn${i === active ? ' is-active' : ''}`}
                  onClick={() => jumpTo(i)}
                  aria-selected={i === active}
                  role="tab"
                >
                  <span className="hiw-nav-ico"><span className={`hiw-nav-vec hiw-nav-vec--${tab.mod}`}><img src={tab.src} alt="" /></span></span>
                </button>
              ))}
            </div>
          </div>
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
  const titleRef = useRef(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.nh-card')
    const title = titleRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.classList.contains('nh-title') ? 'nh-title--visible' : 'nh-card--visible'
            )
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    cards?.forEach(card => observer.observe(card))
    if (title) observer.observe(title)
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
        <h2 className="nh-title" ref={titleRef}>{t('notHud.title')}</h2>
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
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  const features = [
    { key: 'buckle.stats', image: '/buckle_stats.png' },
    { key: 'buckle.bankroll', image: '/buckle_bankroll.png' },
    { key: 'buckle.ai', image: '/buckle_handphone.png' },
  ]

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('bu-title--visible'); obs.disconnect() }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollable = rect.height - vh
      if (scrollable <= 0) { setActive(0); setProgress(0); return }
      const p = Math.max(0, Math.min(1, -rect.top / scrollable))
      setProgress(p)
      const idx = Math.min(features.length - 1, Math.floor(p * features.length))
      setActive(idx)
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
  }, [features.length])

  return (
    <section ref={sectionRef} className="bu-section" data-nav-theme="dark">
      <div className="bu-inner">
        <div className="bu-left">
          <div className="bu-header">
            <h2 className="bu-title" ref={titleRef}>
              {t('buckle.title').map((line, j) => (
                <span key={j} className="bu-title-line">{line}</span>
              ))}
            </h2>
            <p className="bu-subtitle">{t('buckle.subtitle')}</p>
          </div>
          <div className="bu-features">
            {features.map((f, i) => {
              const featProgress = Math.max(0, Math.min(1, progress * features.length - i))
              return (
                <div
                  key={i}
                  className={`bu-feature ${i === active ? 'is-active' : ''}`}
                >
                  <div className="bu-feature-line" aria-hidden="true">
                    <div className="bu-feature-line-fill" style={{ height: `${featProgress * 100}%` }} />
                  </div>
                  <div className="bu-feature-body">
                    <h3 className="bu-feature-title">{t(`${f.key}.title`)}</h3>
                    <div className="bu-feature-desc-wrap">
                      <p className="bu-feature-desc">{t(`${f.key}.desc`)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <aside className="bu-visual">
          {features.map((f, i) => (
            <img
              key={i}
              src={f.image}
              alt=""
              className="bu-handphone"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
        </aside>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BUILT FOR THE LIVE GAME — 2x2 feature grid            */
/* ────────────────────────────────────────────────────── */
const TG_HAND_PATH = 'M224,104v50.93c0,46.2-36.85,84.55-83,85.06A83.71,83.71,0,0,1,80.6,215.4C58.79,192.33,34.15,136,34.15,136a16,16,0,0,1,6.53-22.23c7.66-4,17.1-.84,21.4,6.62l21,36.44a6.09,6.09,0,0,0,6,3.09l.12,0A8.19,8.19,0,0,0,96,151.74V32a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V104a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25V88a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V112a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25v-7.28c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,224,104Z'

function SessionHandAnim() {
  const hands = [
    { label: 'Hand #482', win: true,  amount: '$18' },
    { label: 'Hand #481', win: false, amount: '$10' },
    { label: 'Hand #480', win: true,  amount: '$34' },
    { label: 'Hand #479', win: false, amount: '$6'  },
    { label: 'Hand #478', win: true,  amount: '$44' },
  ]
  const OPEN_STAGGER = 140
  const CLOSE_STAGGER = 120

  const [detailed, setDetailed] = useState(false)
  const [openCount, setOpenCount] = useState(0)

  useEffect(() => {
    let alive = true
    const timeouts = []
    const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timeouts.push(t) }

    const run = () => {
      // Quick mode hold
      later(() => {
        setDetailed(true)
        // stagger-open each hand
        hands.forEach((_, i) => later(() => setOpenCount(i + 1), 350 + i * OPEN_STAGGER))
        const expandDone = 350 + (hands.length - 1) * OPEN_STAGGER + 500

        later(() => {
          // stagger-close from last to first
          hands.forEach((_, i) => later(() => setOpenCount(hands.length - 1 - i), i * CLOSE_STAGGER))
          const collapseDone = (hands.length - 1) * CLOSE_STAGGER + 500
          later(() => {
            setDetailed(false)
            setOpenCount(0)
            later(run, 400)
          }, collapseDone)
        }, expandDone + 2600)
      }, 2200)
    }
    run()

    return () => { alive = false; timeouts.forEach(clearTimeout) }
  }, [])

  return (
    <div className={`sh-wrap${detailed ? ' sh-detailed' : ''}`} aria-hidden="true">
      <div className="sh-toggle">
        <div className="sh-toggle-slider" />
        <div className="sh-toggle-opt sh-toggle-quick">Quick</div>
        <div className="sh-toggle-opt sh-toggle-det">Hand-by-hand</div>
      </div>
      <div className="sh-anchor sh-top">
        <span className="sh-label">Buy-in</span>
        <span className="sh-amount">$200</span>
      </div>
      <div className="sh-quicknet">Net +$80</div>
      <div className="sh-list">
        {hands.map((h, i) => (
          <div key={i} className={`sh-hand${i < openCount ? ' sh-open' : ''}`}>
            <div className="sh-hand-inner">
              <div className="sh-hand-row">
                <span className="sh-chip">{h.label}</span>
                <span className="sh-value">
                  <span className="sh-arrow">{h.win ? '▲' : '▼'}</span>
                  {h.amount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="sh-anchor sh-bottom">
        <span className="sh-label">Cash-out</span>
        <span className="sh-amount">$280</span>
      </div>
    </div>
  )
}

function ThreeGestureAnim() {
  const phases = ['tap', 'drag', 'swipe']
  const durations = [2200, 2600, 2400]
  const labels = [
    ['Tap', 'Check / Call'],
    ['Press & Drag Up', 'Bet / Raise'],
    ['Swipe Out', 'Fold'],
  ]
  const [idx, setIdx] = useState(0)
  const [chip, setChip] = useState(20)

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % phases.length), durations[idx])
    return () => clearTimeout(t)
  }, [idx])

  useEffect(() => {
    if (phases[idx] !== 'drag') { setChip(20); return }
    let raf = 0
    const t0 = performance.now()
    const startT = 520, endT = 1430
    const tick = (now) => {
      const t = now - t0
      if (t < startT) { setChip(20); raf = requestAnimationFrame(tick); return }
      const p = Math.min((t - startT) / (endT - startT), 1)
      const eased = 1 - Math.pow(1 - p, 2)
      setChip(Math.round(20 + 40 * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [idx])

  const Hand = () => (
    <div className="tg-hand">
      <svg viewBox="0 0 256 256"><path d={TG_HAND_PATH} /></svg>
    </div>
  )

  return (
    <div className="tg-wrap" data-phase={phases[idx]} aria-hidden="true">
      <div className="tg-stage">
        <div className="tg-group tg-tap">
          <div className="tg-ripple" />
          <Hand />
        </div>
        <div className="tg-group tg-drag">
          <div className="tg-chip">${chip}</div>
          <Hand />
        </div>
        <div className="tg-group tg-swipe">
          <div className="tg-pcard" />
          <Hand />
        </div>
      </div>
      <div className="tg-copy" key={idx}>
        <div className="tg-title">{labels[idx][0]}</div>
        <div className="tg-sub">{labels[idx][1]}</div>
      </div>
      <div className="tg-dots">
        {phases.map((p, i) => (
          <span key={p} className={`tg-dot${i === idx ? ' tg-dot-on' : ''}`} />
        ))}
      </div>
    </div>
  )
}

function GestureLoggingAnim() {
  return (
    <div className="gla-fit" aria-hidden="true">
      <div className="gla-wrap">
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <symbol id="gla-hand" viewBox="0 0 64 64">
              <circle cx="32" cy="58" r="7" fill="currentColor" />
            </symbol>
          </defs>
        </svg>
        <div className="gla-index">FIG. 01 — TOUCH INPUT</div>
        <div className="gla-dim">
          <div className="gla-tick gla-tick-top" />
          <div className="gla-shaft" />
          <div className="gla-tick gla-tick-bottom" />
          <div className="gla-dim-label">240 × 480</div>
        </div>
        <div className="gla-reg gla-reg-tl" />
        <div className="gla-reg gla-reg-tr" />
        <div className="gla-reg gla-reg-bl" />
        <div className="gla-reg gla-reg-br" />
        <div className="gla-phone">
        <div className="gla-rmark gla-rmark-tl" />
        <div className="gla-rmark gla-rmark-tr" />
        <div className="gla-rmark gla-rmark-bl" />
        <div className="gla-rmark gla-rmark-br" />
        <div className="gla-guide-h" />
        <div className="gla-guide-v" />
        <div className="gla-cam" />
        <div className="gla-speaker" />
        <div className="gla-content">
          <div className="gla-stage">
            <svg className="gla-gfx" viewBox="0 0 168 168">
              <circle className="gla-tap-ring" cx="84" cy="126" r="20" fill="none" stroke="#A6A6F2" strokeWidth="1.5" />
              <line className="gla-slide-track" x1="84" y1="96" x2="84" y2="156" />
              <path className="gla-swipe-trail" d="M 32 126 L 152 126" />
              <g className="gla-hand">
                <use className="gla-cursor" href="#gla-hand" width="64" height="64" />
              </g>
            </svg>
          </div>
          <div className="gla-label-wrap">
            <div className="gla-label gla-label-tap">Tap</div>
            <div className="gla-label gla-label-slide">Slide</div>
            <div className="gla-label gla-label-swipe">Swipe</div>
          </div>
            <div className="gla-dots">
              <div className="gla-dot gla-dot-1" />
              <div className="gla-dot gla-dot-2" />
              <div className="gla-dot gla-dot-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OpponentRadarAnim() {
  const nodes = [
    { angle: 0, label: 'VPIP 24%' },
    { angle: 60, label: 'PFR 18%' },
    { angle: 120, label: 'Aggressive' },
    { angle: 180, label: '3-Bet 9%' },
    { angle: 240, label: 'C-Bet 71%' },
    { angle: 300, label: 'Tight-Passive' },
  ]
  return (
    <div className="rr-wrap" aria-hidden="true">
      <div className="rr-radar">
        <div className="rr-ring rr-r1" />
        <div className="rr-ring rr-r2" />
        <div className="rr-ring rr-r3" />
        <div className="rr-sweep-wrap"><div className="rr-sweep" /></div>
        <div className="rr-center-dot" />
        {nodes.map((n, i) => (
          <div key={i} className={`rr-node rr-node-${i}`} style={{ '--rr-angle': `${n.angle}deg` }}>
            <div className="rr-node-content">
              <div className="rr-node-dot" />
              <div className="rr-node-tag">{n.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DealerBroadcastAnim() {
  const CENTER = { x: 140, y: 95 }
  const seats = [
    { x: 92,  y: 167 },
    { x: 19,  y: 127 },
    { x: 5,   y: 66  },
    { x: 50,  y: 11  },
    { x: 140, y: 5   },
    { x: 230, y: 11  },
    { x: 275, y: 66  },
    { x: 261, y: 133 },
    { x: 188, y: 173 },
  ]
  const script = [
    { seat: 0, action: 'Bet $20',   amount: 20 },
    { seat: 1, action: 'Call $20',  amount: 20 },
    { seat: 2, action: 'Fold',      fold: true },
    { seat: 3, action: 'Fold',      fold: true },
    { seat: 4, action: 'Raise $60', amount: 60 },
    { seat: 5, action: 'Fold',      fold: true },
    { seat: 6, action: 'Call $60',  amount: 60 },
    { seat: 7, action: 'Fold',      fold: true },
    { seat: 8, action: 'Fold',      fold: true },
    { seat: 0, action: 'Call $60',  amount: 60 },
    { seat: 1, action: 'Fold',      fold: true },
  ]
  const STEP = 1500

  const chipPos = (i) => {
    const s = seats[i]
    const t = 0.28
    return { x: s.x + (CENTER.x - s.x) * t, y: s.y + (CENTER.y - s.y) * t }
  }

  const [caption, setCaption] = useState('')
  const [showCaption, setShowCaption] = useState(false)
  const [flash, setFlash] = useState(false)
  const [active, setActive] = useState(-1)
  const [seatStates, setSeatStates] = useState({}) // { [i]: 'inhand' | 'folded' }
  const [chips, setChips] = useState({}) // { [seat]: { amount, phase: 'in' | 'bump' | 'collect', bumpKey } }

  useEffect(() => {
    let alive = true
    const timeouts = []
    const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timeouts.push(t); return t }

    const announce = (text) => {
      setCaption(text)
      setShowCaption(true)
      setFlash(true)
      later(() => setFlash(false), 500)
      later(() => setShowCaption(false), STEP - 250)
    }

    const playStep = (i) => {
      if (!alive) return
      if (i >= script.length) return endHand()
      const step = script[i]
      setActive(step.seat)
      announce(step.action)

      later(() => {
        if (step.fold) {
          setSeatStates((s) => ({ ...s, [step.seat]: 'folded' }))
        } else if (step.amount) {
          setSeatStates((s) => ({ ...s, [step.seat]: 'inhand' }))
          setChips((c) => {
            const existing = c[step.seat]
            if (existing) {
              return { ...c, [step.seat]: { amount: step.amount, phase: 'in', bumpKey: (existing.bumpKey || 0) + 1 } }
            }
            return { ...c, [step.seat]: { amount: step.amount, phase: 'in', bumpKey: 0 } }
          })
        }
      }, 420)

      later(() => {
        setActive(-1)
        playStep(i + 1)
      }, STEP)
    }

    const endHand = () => {
      announce('Next Hand')
      setChips((c) => {
        const next = { ...c }
        Object.keys(next).forEach((k) => { next[k] = { ...next[k], phase: 'collect' } })
        return next
      })
      later(() => {
        setChips({})
        setSeatStates({})
      }, 900)
      later(() => playStep(0), 2400)
    }

    const start = later(() => playStep(0), 700)

    return () => {
      alive = false
      timeouts.forEach(clearTimeout)
      clearTimeout(start)
    }
  }, [])

  return (
    <div className="db-wrap" aria-hidden="true">
      <div className="db-vis">
        <svg className="db-table" viewBox="0 0 280 190">
          <path d="M 83,5 L 197,5 Q 275,5 275,95 Q 275,185 197,185 L 160,185 A 20,20 0 0 0 120,185 L 83,185 Q 5,185 5,95 Q 5,5 83,5 Z" />
        </svg>
        {seats.map((s, i) => {
          const state = seatStates[i]
          const cls = [
            'db-seat',
            active === i ? 'db-active' : '',
            state === 'inhand' ? 'db-inhand' : '',
            state === 'folded' ? 'db-folded' : '',
          ].filter(Boolean).join(' ')
          return <div key={i} className={cls} style={{ left: `${s.x}px`, top: `${s.y}px` }} />
        })}
        {Object.entries(chips).map(([seat, chip]) => {
          const pos = chip.phase === 'collect' ? CENTER : chipPos(Number(seat))
          const cls = [
            'db-chip',
            chip.phase === 'in' ? 'db-in' : '',
            chip.phase === 'collect' ? 'db-collect' : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              key={`${seat}-${chip.bumpKey}`}
              className={cls}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            >{chip.amount}</div>
          )
        })}
        <div className={`db-mic${flash ? ' db-flash' : ''}`}>
          <div className="db-wave db-wave-1" />
          <div className="db-wave db-wave-2" />
          <div className="db-wave db-wave-3" />
          <svg className="db-mic-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
      </div>
      <div className={`db-caption${showCaption ? ' db-show' : ''}`}>{caption}</div>
    </div>
  )
}

function TPBuiltForLive() {
  const { t } = useT()
  const topCards = [
    { titleKey: 'live.gesture.title', descKey: 'live.gesture.desc', media: <ThreeGestureAnim /> },
    { titleKey: 'live.reads.title', descKey: 'live.reads.desc', media: <OpponentRadarAnim /> },
    { titleKey: 'live.session.title', descKey: 'live.session.desc', media: <SessionHandAnim /> },
  ]

  return (
    <section className="bfl-section" data-nav-theme="dark">
      <div className="bfl-inner">
        <div className="bfl-row bfl-row-top">
          <div className="bfl-card bfl-card-intro">
            <div className="bfl-intro-header">
              <p className="bfl-intro-eyebrow">{t('live.eyebrow')}</p>
              <p className="bfl-intro-title">
                {t('live.title').map((line, j) => (
                  <span key={j} className="bfl-intro-title-line">{line}</span>
                ))}
              </p>
            </div>
          </div>
          {topCards.map(({ titleKey, descKey, media }, i) => (
            <div key={i} className="bfl-card bfl-card-feature">
              <p className="bfl-feature-title">{t(titleKey)}</p>
              <div className="bfl-feature-media" aria-hidden="true">{media}</div>
              <p className="bfl-feature-desc">{t(descKey)}</p>
            </div>
          ))}
        </div>

        <div className="bfl-row bfl-row-bottom">
          <div className="bfl-card bfl-card-image">
            <DealerBroadcastAnim />
          </div>
          <div className="bfl-bottom-right">
            <div className="bfl-card bfl-card-dealer">
              <div className="bfl-dealer-copy">
                <p className="bfl-feature-title">{t('live.dealer.title')}</p>
                <p className="bfl-feature-desc">{t('live.dealer.desc')}</p>
              </div>
              <div className="bfl-dealer-badge">
                <span className="bfl-dealer-pill">{t('live.dealer.badge')}</span>
                <span className="bfl-dealer-tag">{t('live.dealer.tag')}</span>
              </div>
            </div>
            <div className="bfl-card bfl-card-download">
              <p className="bfl-download-label">{t('live.download')}</p>
              <div className="bfl-download-badges">
                <a href="#" className="bfl-store-btn" aria-label="Download on the App Store">
                  <img src="/store_appstore.svg" alt="" className="bfl-store-img" />
                </a>
                <a href="#" className="bfl-store-btn" aria-label="Get it on Google Play">
                  <img src="/store_googleplay.svg" alt="" className="bfl-store-img" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DISCORD — JOIN THE COMMUNITY                          */
/* ────────────────────────────────────────────────────── */
function TPBottomHero() {
  const { t } = useT()
  const titleRef = useRef(null)

  const titleLines = t('bh.title')

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const N = titleLines.length
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - rect.top) / (vh * 0.9)
      const total = Math.min(1, Math.max(0, progress))
      for (let i = 0; i < N; i++) {
        const p = Math.min(1, Math.max(0, total * N - i))
        el.style.setProperty(`--scrub-${i}`, (p * 100).toFixed(1) + '%')
      }
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
  }, [titleLines.length])

  return (
    <section className="bh-section" data-nav-theme="dark">
      <div className="bh-inner">
        <h2 className="bh-title bh-title--scrub" ref={titleRef}>
          {titleLines.map((line, i) => (
            <span key={i} className="bh-title-line">
              {line}
              <span className="bh-title-line-fill" aria-hidden="true">{line}</span>
            </span>
          ))}
        </h2>
        <img src="/bottom_hero_phone.png" alt="" className="bh-phone" aria-hidden="true" />
        <div className="bh-right">
          <p className="bh-body">
            {t('bh.body').map((line, i) => (
              <span key={i} className="bh-body-line">{line}</span>
            ))}
          </p>
          <div className="bh-badges">
            <a href="#" className="bh-store-btn" aria-label="Download on the App Store">
              <img src="/store_appstore.svg" alt="" className="bh-store-img" />
            </a>
            <a href="#" className="bh-store-btn" aria-label="Get it on Google Play">
              <img src="/store_googleplay.svg" alt="" className="bh-store-img" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function TPDiscord() {
  const { t } = useT()

  return (
    <section className="dc-section" data-nav-theme="dark">
      <div className="dc-card">
        <div className="dc-overlay" aria-hidden="true" />
        <div className="dc-copy">
          <div className="dc-copy-text">
            <p className="dc-eyebrow">{t('discord.eyebrow')}</p>
            <div className="dc-copy-group">
              <h2 className="dc-title">{t('discord.title')}</h2>
              <p className="dc-body">{t('discord.body')}</p>
            </div>
          </div>
          <a
            className="dc-cta"
            href="https://discord.gg/finaltable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{t('discord.cta')}</span>
            <img src="/discord.svg" alt="" className="dc-cta-icon" aria-hidden="true" />
          </a>
        </div>
        <div className="dc-preview" aria-hidden="true" />
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
function FooterHalftone() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const CELL = 8
    const MAX_R = 3.2
    const CURSOR_RADIUS = 140
    const CURSOR_BOOST = 1.6
    // Bayer 4x4 ordered-dither matrix, normalized to 0..1
    const BAYER = [
      [ 0, 8, 2,10],
      [12, 4,14, 6],
      [ 3,11, 1, 9],
      [15, 7,13, 5],
    ].map(row => row.map(v => v / 16))

    let w = 0, h = 0
    let raf = 0
    let last = performance.now()
    const mouse = { x: -9999, y: -9999 }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const heart = new Image()
    heart.crossOrigin = 'anonymous'
    heart.src = '/footer_heart.svg'

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d', { willReadFrequently: true })
    let px = null // ImageData buffer of the offscreen heart art

    const rebuildSample = () => {
      if (!heart.complete || heart.naturalWidth === 0 || w === 0 || h === 0) return
      off.width = Math.max(1, Math.floor(w))
      off.height = Math.max(1, Math.floor(h))
      offCtx.clearRect(0, 0, off.width, off.height)
      offCtx.drawImage(heart, 0, 0, off.width, off.height)
      try {
        px = offCtx.getImageData(0, 0, off.width, off.height).data
      } catch (e) {
        px = null
      }
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rebuildSample()
    }

    const draw = () => {
      // Card colour bg — full clear each frame (no trail for halftone)
      ctx.fillStyle = 'rgba(31, 31, 31, 1)'
      ctx.fillRect(0, 0, w, h)

      if (!px) {
        if (!reduce) raf = requestAnimationFrame(draw)
        return
      }

      const cols = Math.ceil(w / CELL)
      const rows = Math.ceil(h / CELL)
      const wi = off.width

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * CELL + CELL / 2
          const y = cy * CELL + CELL / 2
          if (x >= w || y >= h) continue

          const sx = Math.min(wi - 1, Math.floor(x))
          const sy = Math.min(off.height - 1, Math.floor(y))
          const idx = (sy * wi + sx) * 4
          const r = px[idx], g = px[idx + 1], b = px[idx + 2]

          // Heart if red-dominant; else treat pixel as background (dim white cells)
          const isHeart = r > 120 && g < 100 && b < 100
          // Luminance normalized 0..1
          const lum = isHeart
            ? Math.min(1, r / 255) // heart pixels: intensity of red
            : 0.4 // baseline for bg cells (below Bayer threshold so most cells go dim/small)

          // Cursor influence
          const dx = x - mouse.x
          const dy = y - mouse.y
          const cursorT = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / CURSOR_RADIUS)

          // Bayer threshold check — creates the ordered-dither posterization
          const threshold = BAYER[cy & 3][cx & 3]
          const effectiveLum = Math.min(1, lum + cursorT * 0.4)
          if (effectiveLum < threshold * 0.95) continue

          const radius = MAX_R * (effectiveLum) * (1 + cursorT * (CURSOR_BOOST - 1))
          if (radius < 0.4) continue

          if (cursorT > 0.02) {
            // Blend toward hot white near cursor
            const baseR = isHeart ? 255 : 220
            const baseG = isHeart ? 72 : 220
            const baseB = isHeart ? 63 : 220
            const rr = Math.round(baseR + (255 - baseR) * cursorT)
            const gg = Math.round(baseG + (255 - baseG) * cursorT)
            const bb = Math.round(baseB + (255 - baseB) * cursorT)
            const a = Math.min(1, (isHeart ? 0.95 : 0.5) + cursorT * 0.4)
            ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${a})`
          } else if (isHeart) {
            ctx.fillStyle = 'rgba(255, 72, 63, 0.95)'
          } else {
            ctx.fillStyle = 'rgba(220, 220, 220, 0.35)'
          }

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const kick = () => {
      last = performance.now()
      if (!raf) raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    if (heart.complete && heart.naturalWidth > 0) {
      rebuildSample()
      kick()
    } else {
      heart.onload = () => {
        rebuildSample()
        kick()
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="mf-hero-halftone" aria-hidden="true" />
}

function FooterMatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const FONT_SIZE = 14
    const COL_WIDTH = 14
    const TRAIL_FADE = 'rgba(31, 31, 31, 0.14)'
    const CARD_FILL = 'rgba(31, 31, 31, 1)'
    const REPEL_RADIUS = 100
    const REPEL_STRENGTH = 14

    let w = 0, h = 0
    let raf = 0
    let last = performance.now()
    let columns = []
    let mask = null // Uint8Array of size w*h, 1 inside heart
    const mouse = { x: -9999, y: -9999 }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const heart = new Image()
    heart.crossOrigin = 'anonymous'
    heart.src = '/footer_heart.svg'

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d', { willReadFrequently: true })

    const buildMask = () => {
      if (!heart.complete || heart.naturalWidth === 0 || w === 0 || h === 0) return
      const wi = Math.max(1, Math.floor(w))
      const hi = Math.max(1, Math.floor(h))
      off.width = wi
      off.height = hi
      offCtx.clearRect(0, 0, wi, hi)
      offCtx.drawImage(heart, 0, 0, wi, hi)
      let px
      try {
        px = offCtx.getImageData(0, 0, wi, hi).data
      } catch (e) {
        return
      }
      mask = new Uint8Array(wi * hi)
      for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
        // Red-dominant → inside heart silhouette
        mask[i] = (px[p] > 120 && px[p + 1] < 100 && px[p + 2] < 100) ? 1 : 0
      }
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Paint solid card colour once so the trail fade has something to darken toward.
      ctx.fillStyle = CARD_FILL
      ctx.fillRect(0, 0, w, h)

      const nCols = Math.ceil(w / COL_WIDTH)
      columns = new Array(nCols).fill(0).map(() => ({
        y: -Math.random() * h,
        speed: 40 + Math.random() * 60,
      }))
      buildMask()
    }

    const inHeart = (x, y) => {
      if (!mask) return false
      const wi = off.width
      const hi = off.height
      const ix = Math.max(0, Math.min(wi - 1, Math.round(x)))
      const iy = Math.max(0, Math.min(hi - 1, Math.round(y)))
      return mask[iy * wi + ix] === 1
    }

    const draw = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now

      // Trail fade toward card colour
      ctx.fillStyle = TRAIL_FADE
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${FONT_SIZE}px "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]
        col.y += col.speed * dt

        if (col.y > h + FONT_SIZE) {
          if (Math.random() < 0.4) {
            col.y = -FONT_SIZE
            col.speed = 40 + Math.random() * 60
          }
          continue
        }
        if (col.y < 0) continue

        const baseX = i * COL_WIDTH + COL_WIDTH / 2
        let x = baseX
        let y = col.y

        // Cursor repulsion
        let hotT = 0
        const dx = x - mouse.x
        const dy = y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_RADIUS) {
          hotT = 1 - dist / REPEL_RADIUS
          const inv = dist > 0.001 ? 1 / dist : 0
          x += dx * inv * REPEL_STRENGTH * hotT
          y += dy * inv * REPEL_STRENGTH * hotT
        }

        const char = Math.random() < 0.5 ? '0' : '1'

        // Colour selection
        if (hotT > 0) {
          const isHeart = inHeart(x, y)
          const baseR = isHeart ? 255 : 220
          const baseG = isHeart ? 72 : 220
          const baseB = isHeart ? 63 : 220
          const baseA = isHeart ? 0.9 : 0.55
          const r = Math.round(baseR + (255 - baseR) * hotT)
          const g = Math.round(baseG + (255 - baseG) * hotT)
          const b = Math.round(baseB + (255 - baseB) * hotT)
          const a = baseA + (1 - baseA) * hotT
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
        } else if (inHeart(x, y)) {
          ctx.fillStyle = 'rgba(255, 72, 63, 0.9)'
        } else {
          ctx.fillStyle = 'rgba(220, 220, 220, 0.55)'
        }

        ctx.fillText(char, x, y)
      }

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const kick = () => {
      last = performance.now()
      if (!raf) raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    if (heart.complete && heart.naturalWidth > 0) {
      buildMask()
      kick()
    } else {
      heart.onload = () => {
        buildMask()
        kick()
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="mf-hero-matrix" aria-hidden="true" />
}


const TPFooter = forwardRef(function TPFooter(_, ref) {
  const { t, locale } = useT()
  const year = new Date().getFullYear()

  const companyLinks = [
    { title: t('nav.howItWorks'), href: '#how-it-works' },
    { title: t('nav.features'),   href: '#features' },
    { title: t('nav.compare'),    href: '#compare' },
    { title: t('about.nav'),      href: '/about' },
  ]
  const termsLinks = [
    { title: t('footer.termsOfUse'),   href: '/terms' },
    { title: t('footer.privacyPolicy'), href: '/privacy' },
  ]

  const flagIso = FLAG_ISO[locale] || 'gb'
  const langLabel = { de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français', pl: 'Polski', pt: 'Português', ru: 'Русский', tr: 'Türkçe' }[locale] || 'English'

  return (
    <footer ref={ref} className="mf-footer">
      <div className="mf-top-line" aria-hidden="true" />
      <div className="mf-outer">
        <div className="mf-card">
          <div className="mf-card-inner">
            <div className="mf-row">
              <div className="mf-brand">
                <a href="#" className="mf-logo">
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
                  <div className="mf-theme-toggle">
                    <button type="button" className="mf-theme-btn mf-theme-btn-active" aria-label="Light theme">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                      </svg>
                    </button>
                    <button type="button" className="mf-theme-btn" aria-label="Dark theme">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    </button>
                    <button type="button" className="mf-theme-btn" aria-label="Auto theme">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 1 0 20V2z" fill="rgba(255,255,255,0.55)" />
                      </svg>
                    </button>
                  </div>
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
      duration: 1.1,
      easing: t => 1 - Math.pow(1 - t, 3),
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
          <TPBottomHero />
        </main>
      </div>
      <TPFooter ref={footerRef} />
    </div>
  )
}
