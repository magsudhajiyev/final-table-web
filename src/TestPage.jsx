import { useState, useEffect, useRef } from 'react'
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

  const handleWaitlist = (e) => {
    e.preventDefault()
    // TODO: wire up to Firebase waitlist
    alert(`Thanks! We'll reach out to ${email}`)
    setEmail('')
  }

  return (
    <section className="tp-hero" data-nav-theme="light">
      <div className="tp-hero-content">
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
const darkTabs = [0, 2, 3]

// Cards: final position + how far to translate back toward phone center (ox, oy)
// ox/oy are the offset applied when hidden — positive ox = card is to the left, needs to slide right to reach phone
const SESSION_CARDS = [
  { src: '/session-history/s1.png', w: 220, top: '10%',  left: '25%',  rot: -3, dur: 6.2, fd: 0.00, ox:  280, oy:  160 },
  { src: '/session-history/s2.png', w: 210, top: '42%',  left: '22%',  rot:  2, dur: 7.0, fd: 0.08, ox:  310, oy:   10 },
  { src: '/session-history/s3.png', w: 230, bot: '10%',  left: '24%',  rot: -2, dur: 5.8, fd: 0.05, ox:  290, oy: -170 },
  { src: '/session-history/s5.png', w: 210, top: '14%',  right: '23%', rot:  2, dur: 6.0, fd: 0.12, ox: -240, oy:  130 },
  { src: '/session-history/s4.png', w: 200, top: '48%',  right: '21%', rot: -2, dur: 6.8, fd: 0.04, ox: -260, oy:   20 },
  { src: '/session-history/s6.png', w: 200, bot: '10%',  right: '23%', rot:  1, dur: 7.2, fd: 0.09, ox: -250, oy: -160 },
]

function TPBgSection() {
  const [activeTab, setActiveTab] = useState(0)
  const [spread, setSpread] = useState(false)
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
        if (scrolledIn < 0) setSpread(false)
        return
      }

      setSpread(true)

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
      <section className="tp-bg-section" ref={sectionRef} data-nav-theme="dark">
        <div className="tp-bg-sticky">

          {/* Session cards — hidden behind phone, fan out on scroll */}
          <div className="tp-session-layer">
            {SESSION_CARDS.map((card, i) => (
              <div
                key={i}
                className={`tp-session-wrap${spread ? ' is-spread' : ''}`}
                style={{
                  top: card.top,
                  bottom: card.bot,
                  left: card.left,
                  right: card.right,
                  '--ox': `${card.ox}px`,
                  '--oy': `${card.oy}px`,
                  '--rot': `${card.rot}deg`,
                  transitionDelay: spread ? `${card.fd}s` : '0s',
                }}
              >
                <img
                  src={card.src}
                  alt=""
                  className="tp-session-card"
                  style={{
                    width: card.w,
                    '--dur': `${card.dur}s`,
                    '--fdelay': `${card.fd + 0.7}s`,
                  }}
                />
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
/*  PAGE ROOT                                             */
/* ────────────────────────────────────────────────────── */
/*  FEATURES GRID                                         */
/* ────────────────────────────────────────────────────── */
const featuresGrid = [
  {
    icon: '👤',
    title: 'Opponent Profiles',
    desc: 'Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you\'ve played against them.',
    size: 'sm',
  },
  {
    icon: '💰',
    title: 'Bankroll Tracking',
    desc: 'Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows your cumulative results over time.',
    size: 'sm',
    chart: true,
  },
  {
    icon: '⚡',
    title: 'Quick Session Logger',
    desc: 'Don\'t want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.',
    size: 'sm',
  },
  {
    icon: '🤖',
    title: 'AI Hand Analysis',
    desc: 'Get GTO-based feedback on your hands. The AI reviews your decisions and suggests improvements.',
    size: 'lg',
    premium: true,
  },
  {
    icon: '🏛️',
    title: 'Club Management',
    desc: 'Create or join a poker club. Manage members, roles, tables, and run events — all from the app.',
    size: 'sm',
  },
  {
    icon: '🏆',
    title: 'Multi-Table Tournaments',
    desc: 'Run live tournaments with multiple tables, real-time rankings, final standings, and prize distribution.',
    size: 'sm',
  },
  {
    icon: '🎙️',
    title: 'Dealer Mode',
    desc: 'Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.',
    size: 'sm',
  },
  {
    icon: '📱',
    title: 'QR Seat Assignments',
    desc: 'Players scan a QR code to claim their seat. No manual setup, no confusion.',
    size: 'sm',
  },
  {
    icon: '🔄',
    title: 'Real-Time Sync',
    desc: 'Every action broadcasts instantly to all players and spectators via live updates.',
    size: 'sm',
  },
  {
    icon: '📋',
    title: 'Cash Game Waitlists',
    desc: 'Stakes-scoped waitlists let players queue for the game they want. Admins manage seating from the dashboard.',
    size: 'sm',
  },
]

function MiniChart() {
  const bars = [30, 45, 35, 60, 50, 75, 90]
  return (
    <div className="fg-chart">
      {bars.map((h, i) => (
        <div key={i} className="fg-chart-bar" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function TPFeaturesGrid() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      const track = trackRef.current
      if (!section || !track) return

      const rect = section.getBoundingClientRect()
      const scrolledIn = -rect.top
      const scrollableRange = section.offsetHeight - window.innerHeight
      if (scrolledIn < 0 || scrolledIn > scrollableRange) return

      const progress = scrolledIn / scrollableRange
      const maxTranslate = track.scrollWidth - track.parentElement.offsetWidth
      track.style.transform = `translateX(${-progress * maxTranslate}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="fg-section" ref={sectionRef} data-nav-theme="dark">
      <div className="fg-sticky">
        <div className="fg-header">
          <p className="fg-eyebrow">Everything you need</p>
          <h2 className="fg-title">Built for every kind of player.</h2>
          <p className="fg-sub">From casual home games to serious grinders — Final Table has the tools to match how you play.</p>
        </div>
        <div className="fg-track-wrap">
          <div className="fg-track" ref={trackRef}>
            {featuresGrid.map((f, i) => (
              <div key={i} className={`fg-card${f.size === 'lg' ? ' fg-card-lg' : ''}`}>
                {f.premium && <span className="fg-premium">PREMIUM</span>}
                <div className="fg-icon">{f.icon}</div>
                <h3 className="fg-card-title">{f.title}</h3>
                <p className="fg-card-desc">{f.desc}</p>
                {f.chart && <MiniChart />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  GET FINAL TABLE TODAY                                 */
/* ────────────────────────────────────────────────────── */
function TPGetToday() {
  return (
    <section className="gt-section" data-nav-theme="dark">
      <div className="gt-glow" />
      <div className="gt-inner">
        <p className="gt-eyebrow">Available now</p>
        <h2 className="gt-headline">
          Get&nbsp;Final&nbsp;Table<br />today.
        </h2>
        <p className="gt-sub">
          Your poker game, fully tracked. Download free on iOS and Android.
        </p>
        <div className="gt-badges">
          {/* App Store */}
          <a href="#" className="gt-badge" aria-label="Download on the App Store">
            <svg className="gt-badge-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="gt-badge-text">
              <span className="gt-badge-sub">Download on the</span>
              <span className="gt-badge-name">App Store</span>
            </span>
          </a>
          {/* Google Play */}
          <a href="#" className="gt-badge" aria-label="Get it on Google Play">
            <svg className="gt-badge-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.3.17.64.24.99.2l.06-.03 11.2-11.2-2.39-2.39zM20.47 10.6L17.6 9l-2.7 2.7 2.7 2.7 2.9-1.62c.83-.46.83-1.62-.03-2.18zM2.01 1.05C1.7 1.38 1.5 1.9 1.5 2.6v18.8c0 .7.2 1.22.52 1.55l.08.07 10.54-10.54v-.25z"/>
            </svg>
            <span className="gt-badge-text">
              <span className="gt-badge-sub">Get it on</span>
              <span className="gt-badge-name">Google Play</span>
            </span>
          </a>
        </div>
        <p className="gt-fine">Free to download · No credit card required</p>
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
export default function TestPage() {
  return (
    <div className="tp-root">
      <TPNavbar />
      <main>
        <TPHero />
        <TPBgSection />
        <TPFeaturesGrid />
        <TPGetToday />
        <TPContact />
      </main>
      <TPFooter />
    </div>
  )
}
