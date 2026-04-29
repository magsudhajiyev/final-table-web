import { useState, useEffect, useRef } from 'react'
import { submitNicknameClaim, submitToWaitlist } from './lib/firebase'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import './TestPage.css'

// Tab icons as inline SVG data URIs (Lucide-style)
const IMG_TAB_ICON_1    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>')}`
const IMG_TAB_ICON_2    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>')}`
const IMG_TAB_ICON_3    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>')}`
const IMG_TAB_ICON_4    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>')}`

/* ────────────────────────────────────────────────────── */
/*  NAVBAR                                                */
/* ────────────────────────────────────────────────────── */
function TPNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light') // 'dark' | 'light'
  const [menuOpen, setMenuOpen] = useState(false)

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
        <div className="tp-nav-logo">
          <img src={logo} alt="Final Table" className={`tp-nav-logo-img${scrolled ? ' tp-nav-logo-hidden' : ''}`} />
          <img src={iconSrc} alt="Final Table" className={`tp-nav-logo-icon-img${scrolled ? '' : ' tp-nav-logo-hidden'}`} />
        </div>
        <div className="tp-nav-links">
          <a href="#features" onClick={smoothScroll}>Features</a>
          <a href="#how-it-works" onClick={smoothScroll}>How it works</a>
          <a href="#compare" onClick={smoothScroll}>Compare</a>
          <a href="#faq" onClick={smoothScroll}>FAQ</a>
        </div>
        <a href="#reserve-form" className="tp-nav-cta" onClick={smoothScroll}>
          Reserve your handle
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
        <a href="#features" onClick={smoothScroll}>Features</a>
        <a href="#how-it-works" onClick={smoothScroll}>How it works</a>
        <a href="#compare" onClick={smoothScroll}>Compare</a>
        <a href="#faq" onClick={smoothScroll}>FAQ</a>
        <a href="#reserve-form" className="tp-nav-mobile-cta" onClick={smoothScroll}>Reserve your handle</a>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */

function TPHero() {
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
        <h1 className="tp-hero-h1">Log a hand in three gestures.<br />Not three minutes.</h1>
        <p className="tp-hero-sub">
          Final Table is the live poker tracker built for the table itself — fast enough to use
          one-handed between hands, accurate enough to study after.
        </p>

        <div id="reserve-form">
          {status === 'done' ? (
            <div className="tp-hero-waitlist tp-hero-waitlist-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17L4 12" />
              </svg>
              <span className="tp-hero-success-text">
                <span className="ru-username-preview">@{form.username || 'yourhandle'}</span> is reserved. We'll reach out when Final Table opens.
              </span>
              <button className="tp-hero-reset-btn" onClick={() => { setStatus('idle'); setForm({ email: '', username: '' }) }}>
                Reserve another
              </button>
            </div>
          ) : (
            <form className="tp-hero-reserve-form" onSubmit={handleSubmit}>
              <div className="tp-hero-fields">
                <input
                  type="email"
                  name="email"
                  className="tp-hero-email"
                  placeholder="you@example.com"
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
                    placeholder="yourhandle"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <span className="tp-hero-charcount">{form.username.length}/20</span>
                </div>
              </div>
              {status === 'taken' && <p className="tp-hero-form-error">That username is already taken. Try a different one.</p>}
              {status === 'error' && <p className="tp-hero-form-error">Something went wrong. Please try again.</p>}
              <button
                type="submit"
                className="tp-hero-waitlist-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Reserving…' : 'Reserve my handle →'}
              </button>
              <p className="tp-hero-proof">Free · Takes 10 seconds · 2,400+ players already reserved</p>
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
  return (
    <section className="tp-compare-section" id="compare" data-nav-theme="light">
      <div className="tp-compare-inner">
        <p className="tp-compare-eyebrow">WHAT MAKES IT DIFFERENT</p>
        <h2 className="tp-compare-title">Built for the live game.<br />Designed for the player at the rail.</h2>
        <p className="tp-compare-subtitle">
          Live poker trackers exist. None of them feel like they belong at the table.
          Final Table feels like part of the game.
        </p>

        <div className="tp-compare-grid">
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Zap size={24} /></div>
            <h3 className="tp-compare-card-title">Three-gesture logging</h3>
            <p className="tp-compare-card-desc">
              Log any action — raise, call, fold — in three taps. No typing, no menus. Fast enough to use between hands without missing a beat.
            </p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Target size={24} /></div>
            <h3 className="tp-compare-card-title">Opponent reads in real time</h3>
            <p className="tp-compare-card-desc">
              Build stat-backed profiles on every player you face. Know their VPIP, aggression, and tendencies before you act.
            </p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Layers size={24} /></div>
            <h3 className="tp-compare-card-title">Session + hand-level data</h3>
            <p className="tp-compare-card-desc">
              Track everything from a quick buy-in/cash-out to full hand-by-hand action logging. Use what fits your game.
            </p>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Mic size={24} /></div>
            <h3 className="tp-compare-card-title">Dealer Mode</h3>
            <p className="tp-compare-card-desc">
              Dealers run the table hands-free with voice commands. Players follow along on their own phones in real time.
            </p>
            <span className="tp-compare-coming-soon">COMING SOON · VENUE PARTNERSHIPS</span>
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
  const year = new Date().getFullYear()

  const company = [
    { title: 'Privacy Policy',  href: '/privacy.html' },
    { title: 'Terms of Service',href: '/terms.html' },
  ]

  const resources = [
    { title: 'Features',      href: '#features' },
    { title: 'How it works',  href: '#how-it-works' },
    { title: 'Compare',       href: '#compare' },
    { title: 'FAQ',           href: '#faq' },
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
            <p className="mf-tagline">Log a hand in three gestures. Not three minutes.</p>
            <p className="mf-support">Questions? <a href="mailto:support@finaltable.app">support@finaltable.app</a></p>
          </div>

          {/* Resources col */}
          <div className="mf-col">
            <span className="mf-col-head">Resources</span>
            {resources.map(({ href, title }, i) => (
              <a key={i} href={href} className="mf-link">{title}</a>
            ))}
          </div>

          {/* Company col */}
          <div className="mf-col">
            <span className="mf-col-head">Company</span>
            {company.map(({ href, title }, i) => (
              <a key={i} href={href} className="mf-link">{title}</a>
            ))}
          </div>
        </div>

        <div className="mf-bottom-border" />
        <p className="mf-copy">© Final Table. All rights reserved {year}</p>
      </div>
    </footer>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FIXED TAB BAR                                         */
/* ────────────────────────────────────────────────────── */
const tabs = [
  { icon: IMG_TAB_ICON_1, label: 'Before the session', mockup: '/phonemain_1.png' },
  { icon: IMG_TAB_ICON_2, label: 'At the table',       mockup: '/phonemain_2.png' },
  { icon: IMG_TAB_ICON_3, label: 'After the session',  mockup: '/phonemain_3.png' },
  { icon: IMG_TAB_ICON_4, label: 'Over time',          mockup: '/phonemain_3.png' },
]

const tabInfo = [
  {
    eyebrow: 'BEFORE THE SESSION',
    title: 'Walk in knowing\nwho you\'re playing.',
    body: 'Review opponent profiles and past hand history before you even sit down. Know who\'s tight, who\'s wild, and where the money is.',
  },
  {
    eyebrow: 'AT THE TABLE',
    title: 'Three gestures.\nZero lost flow.',
    body: 'Log any action — raise, call, fold — in three taps. No typing, no menus. Fast enough to use one-handed between hands.',
  },
  {
    eyebrow: 'AFTER THE SESSION',
    title: 'See the leaks\nyou couldn\'t feel.',
    body: 'Review every hand, spot patterns in your play, and compare your decisions to GTO baselines. The data tells the truth.',
  },
  {
    eyebrow: 'OVER TIME',
    title: 'Know your real\nwin rate. Finally.',
    body: 'Track your true $/hr by stakes, casino, and game type. Make stake decisions based on data, not gut feelings.',
  },
]

/* ────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────── */
/*  FEATURES SHOWCASE  (bento grid, 10 cards)            */
/* ────────────────────────────────────────────────────── */
const STACK_CARDS = [
  {
    icon: Eye,
    left: {
      stat: <>Live poker players play<br /><strong>~25–30 hands/hour</strong> on average.</>,
      question: 'How many of those hands do you actually remember?',
    },
    body: 'Final Table tracks every hand you play, so you can review every action and find leaks you never knew you had.',
  },
  {
    icon: TrendingUp,
    left: {
      stat: 'Ask any live player their win rate. Most guess.',
      question: 'Do you actually know your $/hr by stakes, casino, or game type?',
    },
    body: 'Final Table tracks every session with precision — win rate, duration, stakes — so you always know exactly where you stand.',
  },
  {
    icon: Crosshair,
    left: {
      stat: 'Position is the single biggest edge in poker.',
      question: 'Do you know your actual stats from the BTN vs the BB vs UTG?',
    },
    body: 'Final Table breaks down your performance by position, so you can see where you print money and where you bleed chips.',
  },
  {
    icon: Users,
    left: {
      stat: <>"He always 3-bets light." "She never folds the river."</>,
      question: 'Are those real reads or just feelings from one memorable hand?',
    },
    body: 'Final Table builds opponent profiles from logged hands — real stats, real tendencies — so your reads are backed by data, not memory.',
  },
]

function TPProblems() {
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
          <h2 className="fs-title">For the hands you'll<br />want to remember.</h2>
          <p className="fs-subtitle">Every tool you need to log, review, and improve — without leaving the table.</p>
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
              <h3 className="fs-card-title">Opponent Profiles</h3>
              <p className="fs-card-desc">Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you've played against them.</p>
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
              <h3 className="fs-card-title">Bankroll Tracking</h3>
              <p className="fs-card-desc">Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows cumulative results over time.</p>
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
              <h3 className="fs-card-title">Quick Session Logger</h3>
              <p className="fs-card-desc">Don't want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.</p>
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
              <h3 className="fs-card-title">Hand Review</h3>
              <p className="fs-card-desc">Replay every hand you logged. Walk through each street, compare your decisions to GTO baselines, and spot the leaks you couldn't feel at the table.</p>
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
                ].map((t, i) => (
                  <div key={i} className="fs-mtt-row">
                    <span className="fs-mtt-name">{t.name}</span>
                    <div className="fs-mtt-pips">
                      {Array.from({ length: t.total }).map((_, j) => (
                        <div key={j} className={`fs-pip ${j < t.players ? 'fs-pip-on' : 'fs-pip-off'}`} />
                      ))}
                    </div>
                    <span className={`fs-mtt-tag ${t.tagClass}`}>{t.tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">Multi-Table Tournaments</h3>
              <p className="fs-card-desc">Run live tournaments with multiple tables, real-time rankings, and prize distribution. Create clubs, manage members and roles — all from the app.</p>
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
              <h3 className="fs-card-title">Dealer Mode <span className="fs-coming-soon">COMING SOON</span></h3>
              <p className="fs-card-desc">Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.</p>
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
const FINAL_FAQS = [
  {
    q: 'Can I change my username later?',
    a: 'Once reserved, your username is locked in. Choose carefully — this becomes your permanent handle in Final Table.',
  },
  {
    q: 'Is reserving free?',
    a: 'Yes. Reserving your username is completely free. Just enter your email and desired handle.',
  },
  {
    q: 'What if my username is taken?',
    a: 'Usernames are first-come, first-served. If your preferred handle is gone, try a variation — underscores and numbers are fair game.',
  },
  {
    q: 'When will the app launch?',
    a: 'Final Table is in closed beta. Waitlist members get early access before the public launch.',
  },
]

function TPFinalCTA() {
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
          <p className="ru-eyebrow">Early access</p>
          <h2 className="ru-title">Reserve your username<br />before anyone else does.</h2>
          <p className="ru-body">
            Claim your permanent handle ahead of launch. Usernames are first-come, first-served — once it's gone, it's gone.
          </p>

          <div className="ru-proof">
            <div className="ru-avatars">
              {['A','J','K','Q','T'].map((l,i) => (
                <div key={i} className="ru-avatar" style={{ '--i': i }}>{l}</div>
              ))}
            </div>
            <p className="ru-proof-text"><strong>2,400+</strong> players already on the waitlist</p>
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

          <p className="fc-support">Questions? <a href="mailto:support@finaltable.app">support@finaltable.app</a></p>
        </div>

        {/* Right — form card */}
        <div className="fc-right">
          <div className="ru-card">
            {status === 'done' ? (
              <div className="ru-success">
                <div className="ru-success-chip">✓ Reserved</div>
                <h3 className="ru-success-title">You're on the list.</h3>
                <p className="ru-success-body">
                  <span className="ru-username-preview">@{form.username || 'yourhandle'}</span> is reserved for you. We'll reach out when Final Table opens.
                </p>
                <button className="ru-success-reset" onClick={() => { setStatus('idle'); setForm({ email: '', username: '' }) }}>
                  Reserve another
                </button>
              </div>
            ) : (
              <>
                <div className="ru-card-header">
                  <p className="ru-card-title">Claim your handle</p>
                  <p className="ru-card-sub">Free · Takes 10 seconds</p>
                </div>

                <form className="ru-form" onSubmit={handleSubmit}>
                  <div className="ru-field">
                    <label className="ru-label">Email</label>
                    <input
                      className="ru-input"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <p className="ru-hint">Your future sign-in email — can't be changed later.</p>
                  </div>

                  <div className="ru-field">
                    <label className="ru-label">
                      Username
                      <span className="ru-char-count">{form.username.length}/20</span>
                    </label>
                    <div className="ru-input-prefix-wrap">
                      <span className="ru-prefix">@</span>
                      <input
                        className="ru-input ru-input-with-prefix"
                        type="text"
                        name="username"
                        placeholder="yourhandle"
                        value={form.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <p className="ru-hint">Letters, numbers and underscores only. 3–20 characters.</p>
                  </div>

                  {status === 'taken' && (
                    <p className="ru-error">That username is already taken. Try a different one.</p>
                  )}
                  {status === 'error' && (
                    <p className="ru-error">Something went wrong. Please try again.</p>
                  )}

                  <button className="ru-submit" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Reserving…' : 'Reserve my spot →'}
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
