import { useState, useEffect, useRef } from 'react'
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'
import './TestPage.css'

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
  const [theme, setTheme] = useState('dark') // 'dark' | 'light'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  // Switch theme based on which section the nav is over
  useEffect(() => {
    const lightSections = document.querySelectorAll('[data-nav-light]')
    const observer = new IntersectionObserver(
      (entries) => {
        const overLight = entries.some(e => e.isIntersecting)
        setTheme(overLight ? 'light' : 'dark')
      },
      { rootMargin: '-56px 0px -90% 0px', threshold: 0 }
    )
    lightSections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
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
    <section className="tp-hero" data-nav-light>
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

      // Nav colour: 120px lag behind tab switch so it doesn't flip early
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
      <section className="tp-bg-section" ref={sectionRef} data-nav-light>
        <div className="tp-bg-sticky">


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

          {/* Phone mockup — stacked images, opacity crossfade */}
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
  { icon: IMG_TAB_ICON_1, label: 'Hand-by hand logging', mockup: '/phone_mockup_1.png' },
  { icon: IMG_TAB_ICON_2, label: '7 Core Statistics',    mockup: '/phone_2.png'        },
  { icon: IMG_TAB_ICON_3, label: 'Play Style Detection', mockup: '/phone_5.png'        },
  { icon: IMG_TAB_ICON_4, label: 'Download',             mockup: '/phone_mockup_1.png' },
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
  return (
    <section className="fg-section" data-nav-light>
      <div className="fg-container">
        <div className="fg-header">
          <p className="fg-eyebrow">Everything you need</p>
          <h2 className="fg-title">Built for every kind of player.</h2>
          <p className="fg-sub">From casual home games to serious grinders — Final Table has the tools to match how you play.</p>
        </div>

        <div className="fg-grid">
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
      </main>
      <TPFooter />
    </div>
  )
}
