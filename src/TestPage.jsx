import { useState, useEffect, useRef } from 'react'
import { submitNicknameClaim, submitToWaitlist } from './lib/firebase'
import { Eye, Activity, Scale, TrendingUp, Crosshair, Clock, Users, BarChart2 } from 'lucide-react'
import './TestPage.css'

/* ── Social icon SVGs (lucide-react v1+ dropped brand icons) ── */
const FacebookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const GithubIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
const InstagramIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const LinkedinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
const TwitterIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
const YoutubeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>

/* ── Hero assets ── */
const IMG_HERO_BG       = "/Frame 9.png"   // permanent background
const IMG_HERO_MOCKUP_1 = "/phone_mockup_1.png"
const IMG_HERO_MOCKUP_2 = "/phone_mockup_2.png"
const IMG_HERO_MOCKUP_3 = "/phone_mockup_3.png"  // replace when ready
const IMG_HERO_MOCKUP_4 = "/phone_mockup_4.png"  // replace when ready
const IMG_TAB_ICON_1    = "https://www.figma.com/api/mcp/asset/c416dc6e-c330-4b98-b184-6a4328e5edd6"
const IMG_TAB_ICON_2    = "https://www.figma.com/api/mcp/asset/59fc0826-2748-4f1d-9ed4-0b8f91470509"
const IMG_TAB_ICON_3    = "https://www.figma.com/api/mcp/asset/f93fdd33-2253-4d45-96c9-38b1e5dee5d2"
const IMG_TAB_ICON_4    = "https://www.figma.com/api/mcp/asset/ac64f25e-4570-4103-a6bf-adfaa92cbbc6"
const IMG_DARK_CARD1_BG = "https://www.figma.com/api/mcp/asset/4f0edfce-4d90-486e-a9b7-de268a9d77a4"
const IMG_DARK_CARD2_BG = "https://www.figma.com/api/mcp/asset/9e4f72ad-d4aa-47af-aed9-8249fb02e938"
const IMG_DARK_CARD2_INNER = "https://www.figma.com/api/mcp/asset/400339f8-99be-4166-8739-0e235a3bc4ee"
const IMG_DARK_CARD3_BG = "https://www.figma.com/api/mcp/asset/01ae5780-35dc-4bdb-b291-e07513e281b3"
const IMG_DARK_CARD4_BG = "https://www.figma.com/api/mcp/asset/b095f0a5-e3f9-4d12-9f19-493a5f7f6ddf"
const IMG_PHONE_BACK    = "https://www.figma.com/api/mcp/asset/3b63c095-77f6-4a02-a184-76f79696cf1c"
const IMG_PHONE_FRONT   = "https://www.figma.com/api/mcp/asset/5a386700-dcaf-4439-ae7c-9c2ba1ca0636"
const IMG_MORE_ICON1    = "https://www.figma.com/api/mcp/asset/840cd99f-17c0-43d2-b60e-6cd0eb35ca84"
const IMG_MORE_ICON2    = "https://www.figma.com/api/mcp/asset/06955dbc-4c1f-4097-8ec7-1a1b1e7f8c22"

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

  return (
    <header className={`tp-nav-wrap tp-nav-${theme}${scrolled ? ' tp-nav-scrolled' : ''}${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <div className="tp-nav-logo">
          <img src={logo} alt="Final Table" className={`tp-nav-logo-img${scrolled ? ' tp-nav-logo-hidden' : ''}`} />
          <img src={iconSrc} alt="Final Table" className={`tp-nav-logo-icon-img${scrolled ? '' : ' tp-nav-logo-hidden'}`} />
        </div>
        <div className="tp-nav-links">
          <a href="#">Features</a>
          <a href="#">Stats</a>
          <a href="#">Pricing</a>
          <a href="#">Help</a>
        </div>
        <a href="#" className="tp-nav-cta">
          <img src="/device-mobile-camera.svg" alt="" className="tp-nav-cta-icon" />
          Get the app
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
        <a href="#" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#" onClick={() => setMenuOpen(false)}>Stats</a>
        <a href="#" onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="#" onClick={() => setMenuOpen(false)}>Help</a>
        <a href="#" className="tp-nav-mobile-cta" onClick={() => setMenuOpen(false)}>Get the app</a>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */
const heroTabs = [
  { icon: IMG_TAB_ICON_1, label: 'Hand-by-hand logging', mockup: IMG_HERO_MOCKUP_1 },
  { icon: IMG_TAB_ICON_2, label: '7 Core Statistics',    mockup: IMG_HERO_MOCKUP_2 },
  { icon: IMG_TAB_ICON_3, label: 'Play Style Detection', mockup: IMG_HERO_MOCKUP_3 },
  { icon: IMG_TAB_ICON_4, label: 'Download',             mockup: IMG_HERO_MOCKUP_4 },
]

function TPHero() {
  const [email, setEmail] = useState('')
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

  const handleWaitlist = (e) => {
    e.preventDefault()
    alert(`Thanks! We'll reach out to ${email}`)
    setEmail('')
  }

  return (
    <section className="tp-hero" ref={sectionRef} data-nav-theme="light">
      <div className="tp-hero-content" ref={contentRef}>
        <h1 className="tp-hero-h1">Your poker game,<br />fully tracked.</h1>
        <p className="tp-hero-sub">
          The only app that tells you everything about your game. Real-time stats,
          opponent reads, and hand history — all in one place.
        </p>

        <form className="tp-hero-waitlist" onSubmit={handleWaitlist}>
          <input
            type="email"
            className="tp-hero-email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="tp-hero-waitlist-btn">
            Join the waitlist
          </button>
        </form>
      </div>
    </section>
  )
}

/* ── Notification cards per tab ── */
const tabCards = [
  {
    left: [
      { title: 'Hand #4,291 logged', sub: 'Pot: $340 · You won with two pair' },
      { title: 'Session started', sub: '6-max · $1/$2 · 9:41 PM' },
    ],
    right: [
      { title: 'New hand recorded', sub: 'Preflop raise → fold by BB' },
      { title: 'Streak: 3 winning hands', sub: 'Keep it up' },
    ],
  },
  {
    left: [
      { title: 'Your VPIP: 24%', sub: 'Up 3% from last session' },
      { title: '3-bet frequency: 12%', sub: 'Slightly above baseline' },
    ],
    right: [
      { title: 'Aggression factor: 2.4', sub: 'Healthy range · 1.8–3.0' },
      { title: 'Win rate: +4.2 BB/100', sub: 'Last 300 hands' },
    ],
  },
  {
    left: [
      { title: 'Mike → LAG detected', sub: 'VPIP 51% · PFR 38%' },
      { title: 'Sarah is a Nit', sub: 'Fold to 3-bet: 74%' },
    ],
    right: [
      { title: 'Alex: Calling Station', sub: 'Don\'t bluff · value bet thin' },
      { title: 'Jordan tagged: TAG', sub: 'Respect his 3-bets' },
    ],
  },
  {
    left: [
      { title: 'Final Table', sub: 'Available on iOS & Android' },
      { title: 'Free to start', sub: 'No credit card required' },
    ],
    right: [
      { title: '2,400+ players tracking', sub: 'Join the community' },
      { title: 'Sync across devices', sub: 'Your data, everywhere' },
    ],
  },
]

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
      <section className="tp-bg-section" ref={sectionRef} data-nav-theme="light">
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
/*  FEATURE SECTION (light bg, phones + cards)           */
/* ────────────────────────────────────────────────────── */
const opponentNotifs = [
  { icon: '♠', title: 'Mike is flying hot', sub: '3-bet frequency 22% this session' },
  { icon: '♥', title: 'Alex took off for big blind', sub: 'Calling Station · VPIP 51%' },
  { icon: '♦', title: 'Sarah folded to your 3-bet', sub: 'Fold-to-3bet: 74% — keep firing' },
]

const playerTags = [
  { name: 'Alex M.', tag: 'Calling Station', color: '#e74c3c' },
  { name: 'Jordan K.', tag: 'TAG', color: '#08a85b' },
  { name: 'Sam R.', tag: 'LAG', color: '#f39c12' },
  { name: 'Chris P.', tag: 'Nit', color: '#3498db' },
]

function TPFeatureSection() {
  return (
    <section className="tp-feature-section">
      <div className="tp-feature-container">
        {/* Heading */}
        <div className="tp-feature-heading">
          <h2 className="tp-feature-h2">Build reads on every opponent,<br />automatically.</h2>
          <p className="tp-feature-body-lg">
            Final Table tracks every player you face. Watch their stats update in real time
            and know exactly how they play — before they even act.
          </p>
        </div>

        <div className="tp-feature-grid">

          {/* Large card: text + phones */}
          <div className="tp-feat-card-lg">
            <div className="tp-feat-lg-text">
              <p className="tp-feat-label">Real-time opponent tracking</p>
              <h3 className="tp-feat-lg-h3">Never sit down without a read ever again.</h3>
              <p className="tp-feat-lg-body">
                Choose who you want to track. They'll have stats
                updated live so you can adjust your strategy
                before they even realise you're watching.
              </p>
            </div>
            {/* Phones */}
            <div className="tp-feat-phones-clip">
              <div className="tp-feat-phone tp-feat-phone-back">
                <img src={IMG_PHONE_BACK} alt="" className="tp-feat-phone-img" />
              </div>
              <div className="tp-feat-phone tp-feat-phone-front">
                <img src={IMG_PHONE_FRONT} alt="" className="tp-feat-phone-img" />
              </div>
            </div>
          </div>

          {/* Two smaller cards */}
          <div className="tp-feat-2col">

            {/* Left: notification stack */}
            <div className="tp-feat-card-sm">
              <p className="tp-feat-label">Stop guessing. Start knowing.</p>
              {opponentNotifs.map((n, i) => (
                <div key={i} className={`tp-feat-notif tp-feat-notif-${i + 1}`}>
                  <div className="tp-feat-notif-icon">{n.icon}</div>
                  <div className="tp-feat-notif-text">
                    <p className="tp-feat-notif-title">{n.title}</p>
                    <p className="tp-feat-notif-sub">{n.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: player tags */}
            <div className="tp-feat-card-sm">
              <p className="tp-feat-label">Tag players. Never forget a hand.</p>
              {playerTags.map((p, i) => (
                <div key={i} className={`tp-feat-notif tp-feat-notif-${i + 1}`}>
                  <div className="tp-feat-notif-avatar">{p.name[0]}</div>
                  <span className="tp-feat-notif-name">{p.name}</span>
                  <span className="tp-feat-notif-tag" style={{ background: p.color + '18', color: p.color, borderColor: p.color + '33' }}>
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  MORE REASONS                                          */
/* ────────────────────────────────────────────────────── */
function TPMoreReasons() {
  return (
    <section className="tp-more-section">
      <div className="tp-more-container">
        <h2 className="tp-more-h2">More reasons you'll want to bring<br />Final Table to your next game</h2>
        <div className="tp-more-grid">
          <div className="tp-more-card">
            <div className="tp-more-icon">
              <img src={IMG_MORE_ICON1} alt="" />
            </div>
            <p className="tp-more-text">
              <strong>Club sharing.</strong>
              {' '}
              <span>Share Final Table with your home game club — everyone tracks hands together.</span>
            </p>
          </div>
          <div className="tp-more-card">
            <div className="tp-more-icon">
              <img src={IMG_MORE_ICON2} alt="" />
            </div>
            <p className="tp-more-text">
              <strong>Privacy first.</strong>
              {' '}
              <span>All of your hand history and stats are viewable only by you.</span>
            </p>
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
  const year = new Date().getFullYear()

  const company = [
    { title: 'About Us',        href: '#' },
    { title: 'Careers',         href: '#' },
    { title: 'Brand assets',    href: '#' },
    { title: 'Privacy Policy',  href: '/privacy.html' },
    { title: 'Terms of Service',href: '/terms.html' },
  ]

  const resources = [
    { title: 'Features',         href: '#' },
    { title: 'Stats',            href: '#' },
    { title: 'Pricing',          href: '#' },
    { title: 'Help',             href: '#' },
    { title: 'Contact Support',  href: '#' },
  ]

  const socialLinks = [
    { label: 'Facebook',  href: '#', icon: <FacebookIcon size={16} /> },
    { label: 'GitHub',    href: '#', icon: <GithubIcon size={16} /> },
    { label: 'Instagram', href: '#', icon: <InstagramIcon size={16} /> },
    { label: 'LinkedIn',  href: '#', icon: <LinkedinIcon size={16} /> },
    { label: 'Twitter',   href: '#', icon: <TwitterIcon size={16} /> },
    { label: 'YouTube',   href: '#', icon: <YoutubeIcon size={16} /> },
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
            <p className="mf-tagline">Your poker game, fully tracked.</p>
            <div className="mf-socials">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} aria-label={s.label} className="mf-social-btn" target="_blank" rel="noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
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
  { icon: IMG_TAB_ICON_1, label: 'Hand-by hand logging', mockup: '/phonemain_1.png' },
  { icon: IMG_TAB_ICON_2, label: '7 Core Statistics',    mockup: '/phonemain_2.png' },
  { icon: IMG_TAB_ICON_3, label: 'Play Style Detection', mockup: '/phonemain_3.png' },
  { icon: IMG_TAB_ICON_4, label: 'Download',             mockup: '/phonemain_3.png' },
]

const tabInfo = [
  {
    eyebrow: 'Logging',
    title: 'Every hand,\ncaptured live.',
    body: 'Log each action as it happens — raises, calls, folds, and showdowns. Your full hand history builds automatically in real time.',
  },
  {
    eyebrow: 'Statistics',
    title: 'Seven stats\nthat tell the truth.',
    body: 'VPIP, PFR, 3-bet %, aggression factor, and more. Know exactly where you\'re winning and where you\'re leaking chips.',
  },
  {
    eyebrow: 'Play Style',
    title: 'Know your\ngame inside out.',
    body: 'Final Table reads your tendencies and classifies your style — TAG, LAG, Nit, or Calling Station — so you can adjust.',
  },
  {
    eyebrow: 'Download',
    title: 'Ready when\nyou are.',
    body: 'Free to download on iOS and Android. No credit card required. Your first session takes 60 seconds to set up.',
  },
]

function TPTabBar() {
  const [active, setActive] = useState(0)

  return (
    <div className="tp-tabbar-wrap">
      <div className="tp-tabbar">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`tp-tab${active === i ? ' tp-tab-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <img
              src={tab.icon}
              alt=""
              className="tp-tab-icon"
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FEATURES GRID  (Chronicle-style editorial layout)    */
/* ────────────────────────────────────────────────────── */
const fgBottomFeatures = [
  { icon: '👤', title: 'Opponent Profiles',      desc: 'Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you\'ve played against them.' },
  { icon: '💰', title: 'Bankroll Tracking',      desc: 'Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows your cumulative results over time.' },
  { icon: '⚡', title: 'Quick Session Logger',   desc: 'Don\'t want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.' },
  { icon: '🤖', title: 'AI Hand Analysis',       desc: 'Get GTO-based feedback on your hands. The AI reviews your decisions and suggests improvements.' },
  { icon: '🏛️', title: 'Club Management',        desc: 'Create or join a poker club. Manage members, roles, tables, and run events — all from the app.' },
  { icon: '🏆', title: 'Multi-Table Tournaments',desc: 'Run live tournaments with multiple tables, real-time rankings, final standings, and prize distribution.' },
  { icon: '🎙️', title: 'Dealer Mode',            desc: 'Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.' },
  { icon: '📱', title: 'QR Seat Assignments',    desc: 'Players scan a QR code to claim their seat. No manual setup, no confusion.' },
  { icon: '🔄', title: 'Real-Time Sync',         desc: 'Every action broadcasts instantly to all players and spectators via live updates.' },
  { icon: '📋', title: 'Cash Game Waitlists',    desc: 'Stakes-scoped waitlists let players queue for the game they want. Admins manage seating from the dashboard.' },
]

function TPFeaturesGrid() {
  return (
    <section className="fg-section" data-nav-theme="dark">
      <div className="fg-container">

        {/* Left-aligned header */}
        <div className="fg-header">
          <h2 className="fg-title">The core<br />experience.</h2>
          <p className="fg-sub">Hand-by-hand logging and seven statistics that give you a complete picture of your game.</p>
        </div>

        <div className="fg-rule" />

        {/* Two hero cells: screenshot above, text below */}
        <div className="fg-main-grid">
          <div className="fg-main-cell">
            <div className="fg-preview">
              <img src="/phonemain_1.png" alt="" className="fg-preview-img" />
            </div>
            <div className="fg-cell-bottom">
              <div className="fg-cell-header">
                <img src={IMG_TAB_ICON_1} alt="" className="fg-cell-icon" />
                <h3 className="fg-cell-title">Hand-by-hand logging</h3>
              </div>
              <p className="fg-cell-desc">Log every action live — raises, calls, folds, and showdowns. Your full hand history builds automatically as you play.</p>
            </div>
          </div>
          <div className="fg-main-cell">
            <div className="fg-preview">
              <img src="/phonemain_2.png" alt="" className="fg-preview-img" />
            </div>
            <div className="fg-cell-bottom">
              <div className="fg-cell-header">
                <img src={IMG_TAB_ICON_2} alt="" className="fg-cell-icon" />
                <h3 className="fg-cell-title">7 Core Statistics</h3>
              </div>
              <p className="fg-cell-desc">VPIP, PFR, 3-bet %, aggression factor, and more. Know exactly where you're winning and where chips are slipping away.</p>
            </div>
          </div>
        </div>

        <div className="fg-rule" />

        {/* 10 supporting features — 2-col spec-sheet list */}
        <div className="fg-list-grid">
          {fgBottomFeatures.map((f, i) => (
            <div key={i} className="fg-list-item">
              <div className="fg-list-header">
                <span className="fg-list-icon">{f.icon}</span>
                <h3 className="fg-list-title">{f.title}</h3>
              </div>
              <p className="fg-list-desc">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}


/* ────────────────────────────────────────────────────── */
/*  CONTACT                                               */
/* ────────────────────────────────────────────────────── */
function TPContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      if (typeof window.submitContactForm === 'function') {
        await window.submitContactForm(form.name, form.email, form.message)
      }
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="ct-section" data-nav-theme="dark">
      <div className="ct-inner">
        <div className="ct-left">
          <p className="ct-eyebrow">Get in touch</p>
          <h2 className="ct-title">Questions? We'd love to hear from you.</h2>
          <p className="ct-body">
            Whether you're curious about features, need help with your account, or just want to say hello — drop us a message.
          </p>
          <div className="ct-detail">
            <span className="ct-detail-label">Response time</span>
            <span className="ct-detail-value">Usually within 24 hours</span>
          </div>
          <div className="ct-detail">
            <span className="ct-detail-label">Support email</span>
            <span className="ct-detail-value">support@finaltable.app</span>
          </div>
        </div>

        <div className="ct-right">
          {status === 'sent' ? (
            <div className="ct-success">
              <div className="ct-success-icon">✓</div>
              <h3 className="ct-success-title">Message sent</h3>
              <p className="ct-success-body">Thanks for reaching out. We'll get back to you shortly.</p>
              <button className="ct-success-reset" onClick={() => setStatus('idle')}>Send another</button>
            </div>
          ) : (
            <form className="ct-form" onSubmit={handleSubmit}>
              <div className="ct-row">
                <div className="ct-field">
                  <label className="ct-label">Name</label>
                  <input
                    className="ct-input"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ct-field">
                  <label className="ct-label">Email</label>
                  <input
                    className="ct-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="ct-field">
                <label className="ct-label">Message</label>
                <textarea
                  className="ct-textarea"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              {status === 'error' && (
                <p className="ct-error">Something went wrong. Please try again.</p>
              )}
              <button className="ct-submit" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────── */
/*  RESERVE USERNAME                                      */
/* ────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Can I change my username later?',
    a: 'Once reserved, your username is locked in. Choose carefully — this becomes your permanent handle in Final Table.',
  },
  {
    q: 'Is reserving free?',
    a: 'Yes. Reserving your username is completely free. Just enter your email and desired handle below.',
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

function TPReserveUsername() {
  const [form, setForm]     = useState({ email: '', username: '' })
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
      // Also add to waitlist for marketing
      await submitToWaitlist(form.email).catch(() => {})
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="ru-section" id="reserve-username" data-nav-theme="light">
      <div className="ru-glow" />

      <div className="ru-inner">
        {/* Left — copy */}
        <div className="ru-left">
          <p className="ru-eyebrow">Early access</p>
          <h2 className="ru-title">Reserve your username<br />before anyone else does.</h2>
          <p className="ru-body">
            Claim your permanent handle ahead of launch. Usernames are first-come, first-served — once it's gone, it's gone.
          </p>

          {/* Social proof avatars */}
          <div className="ru-proof">
            <div className="ru-avatars">
              {['A','J','K','Q','T'].map((l,i) => (
                <div key={i} className="ru-avatar" style={{ '--i': i }}>{l}</div>
              ))}
            </div>
            <p className="ru-proof-text"><strong>2,400+</strong> players already on the waitlist</p>
          </div>

          {/* FAQ */}
          <div className="ru-faq">
            {FAQS.map((f, i) => (
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
        </div>

        {/* Right — form card */}
        <div className="ru-right">
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

/* ────────────────────────────────────────────────────── */
/*  FEATURES SHOWCASE  (bento grid, 10 cards)            */
/* ────────────────────────────────────────────────────── */
const QR_PATTERN = [
  1,1,1,1,1,1,1,0,1,0,
  1,0,0,0,0,0,1,0,0,1,
  1,0,1,1,1,0,1,0,1,1,
  1,0,1,1,1,0,1,0,0,1,
  1,0,1,1,1,0,1,1,1,0,
  1,0,0,0,0,0,1,0,1,1,
  1,1,1,1,1,1,1,0,0,1,
  0,1,0,1,0,0,0,1,0,0,
  1,0,0,1,1,0,1,0,1,1,
  0,1,1,0,1,1,0,1,0,1,
]

/* ────────────────────────────────────────────────────── */
/*  PROBLEMS SECTION (dark bg, glass cards)              */
/* ────────────────────────────────────────────────────── */
const problems = [
  {
    headline: 'Live poker players play ~25–30 hands/hour on average.',
    question: 'How many of those hands do you actually remember?',
    solution: 'Final Table tracks every hand you play, so you can review every action and find leaks you never knew you had.',
  },
  {
    headline: 'Online players review thousands of hands to find leaks.',
    question: 'How do you spot that you overfold rivers vs aggression with zero data?',
    solution: 'Final Table logs your decisions across hundreds of hands and surfaces the patterns — so your leaks have nowhere to hide.',
  },
  {
    headline: 'You study GTO solvers for hours before a session.',
    question: 'But can you actually compare your live play to what the solver says?',
    solution: 'Final Table lets you export your logged hands and review them against solver outputs — bridging the gap between study and real play.',
  },
  {
    headline: 'Ask any live player their win rate. Most guess.',
    question: 'Do you actually know your $/hr by stakes, casino, or game type?',
    solution: 'Final Table tracks every session with precision — win rate, duration, stakes — so you always know exactly where you stand.',
  },
  {
    headline: 'Position is the single biggest edge in poker.',
    question: 'Do you know your actual stats from the BTN vs the BB vs UTG?',
    solution: 'Final Table breaks down your performance by position, so you can see where you print money and where you bleed chips.',
  },
  {
    headline: 'Hour 1 you and Hour 7 you are not the same player.',
    question: 'Can you tell when your game starts falling apart during a long session?',
    solution: 'Final Table tracks your performance over time within a session, so you can see exactly when tilt creeps in — and learn when to walk away.',
  },
  {
    headline: '"He always 3-bets light." "She never folds the river."',
    question: 'Are those real reads or just feelings from one memorable hand?',
    solution: 'Final Table builds opponent profiles from logged hands — real stats, real tendencies — so your reads are backed by data, not memory.',
  },
  {
    headline: 'Moving up in stakes is the dream. Going broke is the nightmare.',
    question: 'Are you making that decision based on actual ROI or just a hot streak?',
    solution: 'Final Table gives you the bankroll data to make smart stake decisions — track your true ROI and know when you\'re actually ready.',
  },
]

/* ── Gooey SVG filter ── */
function GooeyFilter({ id = 'goo-filter', strength = 10 }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

/* ── WebGL shader background ── */
const SC_VERT = `
  attribute vec2 aPos;
  attribute vec2 aUv;
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  void main() {
    vUv = aUv;
    vec2 pos = aPos;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0  + time * 1.5) * 0.05 * intensity;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`
const SC_FRAG = `
  precision mediump float;
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float noise  = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
    noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(0.08, 0.35, 0.16), pow(abs(noise), 2.0) * intensity * 0.35);
    float glow = clamp(1.0 - length(uv - 0.5) * 1.6, 0.0, 1.0);
    glow = pow(glow, 1.4);
    gl_FragColor = vec4(color, glow * 0.75 + 0.25);
  }
`

function SCShaderBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const makeShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER,   SC_VERT))
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, SC_FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1])
    const uvs  = new Float32Array([ 0, 0, 1, 0,  0,1, 1,1])

    const bindAttr = (data, name, size) => {
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    }
    bindAttr(quad, 'aPos', 2)
    bindAttr(uvs,  'aUv',  2)

    const uTime      = gl.getUniformLocation(prog, 'time')
    const uIntensity = gl.getUniformLocation(prog, 'intensity')
    gl.uniform3f(gl.getUniformLocation(prog, 'color1'), 0.04, 0.10, 0.05)
    gl.uniform3f(gl.getUniformLocation(prog, 'color2'), 0.07, 0.22, 0.10)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    let rafId
    const t0 = performance.now()
    const render = () => {
      const t = (performance.now() - t0) / 1000
      gl.uniform1f(uTime,      t)
      gl.uniform1f(uIntensity, 1.0 + Math.sin(t * 2) * 0.3)
      gl.clearColor(0.04, 0.04, 0.04, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(render)
    }
    render()

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="sc-bg-canvas" />
}

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
    icon: Activity,
    left: {
      stat: 'Online players review thousands of hands to find leaks.',
      question: 'How do you spot that you overfold rivers vs aggression with zero data?',
    },
    body: 'Final Table logs your decisions across hundreds of hands and surfaces the patterns so your leaks have nowhere to hide.',
  },
  {
    icon: Scale,
    left: {
      stat: 'You study GTO solvers for hours before a session.',
      question: 'But can you actually compare your live play to what the solver says?',
    },
    body: 'Final Table lets you export your logged hands and review them against solver outputs — bridging the gap between study and real play.',
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
    icon: Clock,
    left: {
      stat: 'Hour 1 you and Hour 7 you are not the same player.',
      question: 'Can you tell when your game starts falling apart during a long session?',
    },
    body: 'Final Table tracks your performance over time within a session, so you can see exactly when tilt creeps in — and learn when to walk away.',
  },
  {
    icon: Users,
    left: {
      stat: <>"He always 3-bets light." "She never folds the river."</>,
      question: 'Are those real reads or just feelings from one memorable hand?',
    },
    body: 'Final Table builds opponent profiles from logged hands — real stats, real tendencies — so your reads are backed by data, not memory.',
  },
  {
    icon: BarChart2,
    left: {
      stat: 'Moving up in stakes is the dream. Going broke is the nightmare.',
      question: 'Are you making that decision based on actual ROI or just a hot streak?',
    },
    body: 'Final Table gives you the bankroll data to make smart stake decisions — track your true ROI and know when you\'re actually ready.',
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
    const CONTAINER_H = 340  // must match .sc-right height in CSS
    const ACTIVE_Y    = 48
    const PEEK        = 10
    const LERP        = 0.1  // smoothing factor (lower = silkier)

    const curY = Array(n).fill(CONTAINER_H + 40)
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
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="sc-section"
      data-nav-theme="dark"
      ref={wrapperRef}
      style={{ height: `${STACK_CARDS.length * 130}vh` }}
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
    <section className="fs-section" data-nav-theme="light">
      <div className="fs-container">

        <div className="fs-head">
          <h2 className="fs-title">Built for every<br />kind of player.</h2>
          <p className="fs-subtitle">From casual home games to serious grinders — Final Table has the tools to match how you play.</p>
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
              <h3 className="fs-card-title">AI Hand Analysis</h3>
              <p className="fs-card-desc">Get GTO-based feedback on your hands. The AI reviews your decisions and suggests improvements.</p>
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
              <p className="fs-card-desc">Run live tournaments with multiple tables, real-time rankings, final standings, and prize distribution.</p>
            </div>
          </div>

          {/* 6. Club Management — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-club-list">
                {[
                  { init: 'A', name: 'Alex',   role: 'Admin',  cls: 'fs-role-admin' },
                  { init: 'J', name: 'Jordan', role: 'Dealer', cls: 'fs-role-dealer' },
                  { init: 'S', name: 'Sam',    role: 'Member', cls: 'fs-role-member' },
                  { init: 'C', name: 'Chris',  role: 'Member', cls: 'fs-role-member' },
                ].map((m, i) => (
                  <div key={i} className="fs-club-row">
                    <div className="fs-club-av">{m.init}</div>
                    <span className="fs-club-name">{m.name}</span>
                    <span className={`fs-club-role ${m.cls}`}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">Club Management</h3>
              <p className="fs-card-desc">Create or join a poker club. Manage members, roles, tables, and run events — all from the app.</p>
            </div>
          </div>

          {/* 7. Dealer Mode — narrow */}
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
              <h3 className="fs-card-title">Dealer Mode</h3>
              <p className="fs-card-desc">Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.</p>
            </div>
          </div>

          {/* 8. QR Seat Assignments — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-qr-visual">
                <div className="fs-qr-grid">
                  {QR_PATTERN.map((on, i) => (
                    <div key={i} className={`fs-qr-cell ${on ? 'fs-qr-on' : ''}`} style={{ '--qi': i }} />
                  ))}
                </div>
                <div className="fs-qr-info">
                  <p className="fs-qr-seat">Seat 4</p>
                  <p className="fs-qr-sub">Table 1 · $2/$5</p>
                </div>
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">QR Seat Assignments</h3>
              <p className="fs-card-desc">Players scan a QR code to claim their seat. No manual setup, no confusion.</p>
            </div>
          </div>

          {/* 9. Real-Time Sync — narrow */}
          <div className="fs-card fs-card-1">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-sync-visual">
                <div className="fs-sync-device" />
                <div className="fs-sync-dots">
                  <div className="fs-sync-dot fs-sd-1" />
                  <div className="fs-sync-dot fs-sd-2" />
                  <div className="fs-sync-dot fs-sd-3" />
                </div>
                <div className="fs-sync-device" />
                <div className="fs-sync-dots">
                  <div className="fs-sync-dot fs-sd-2" />
                  <div className="fs-sync-dot fs-sd-3" />
                  <div className="fs-sync-dot fs-sd-1" />
                </div>
                <div className="fs-sync-device" />
              </div>
              <p className="fs-sync-label">Instant broadcast · all devices</p>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">Real-Time Sync</h3>
              <p className="fs-card-desc">Every action broadcasts instantly to all players and spectators via live updates.</p>
            </div>
          </div>

          {/* 10. Cash Game Waitlists — full width */}
          <div className="fs-card fs-card-3">
            <div className="fs-visual fs-visual-dark">
              <div className="fs-waitlist-cols">
                {[
                  { stakes: '$1/$2 NLH', queue: [{ n: 'Alex M.',   t: '8m' }, { n: 'Jordan K.', t: '6m' }, { n: 'Sam R.',    t: '4m' }] },
                  { stakes: '$2/$5 NLH', queue: [{ n: 'Chris P.',  t: '3m' }, { n: 'Mike R.',   t: '1m' }] },
                  { stakes: '$5/$10 NLH',queue: [{ n: 'Taylor B.', t: '12m' }] },
                ].map((col, ci) => (
                  <div key={ci} className="fs-wl-col">
                    <div className="fs-wl-stakes">{col.stakes}</div>
                    {col.queue.map((p, pi) => (
                      <div key={pi} className="fs-wl-row">
                        <span className="fs-wl-pos">#{pi + 1}</span>
                        <span className="fs-wl-name">{p.n}</span>
                        <span className="fs-wl-wait">{p.t}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="fs-card-body">
              <h3 className="fs-card-title">Cash Game Waitlists</h3>
              <p className="fs-card-desc">Stakes-scoped waitlists let players queue for the game they want. Admins manage seating from the dashboard.</p>
            </div>
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
        <TPBgSection />
        <TPProblems />
        <TPFeaturesShowcase />
        <TPReserveUsername />
        <TPContact />
      </main>
      <TPFooter />
    </div>
  )
}
