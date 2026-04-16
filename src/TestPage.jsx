import { useState, useEffect, useRef } from 'react'
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
  const [darkBg, setDarkBg] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const darkSections = document.querySelectorAll('[data-nav-dark]')
    const observer = new IntersectionObserver(
      (entries) => {
        const anyDark = entries.some(e => e.isIntersecting)
        setDarkBg(anyDark)
      },
      { rootMargin: '-56px 0px -90% 0px', threshold: 0 }
    )
    darkSections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={`tp-nav-wrap${scrolled ? ' tp-nav-scrolled' : ''}${darkBg ? ' tp-nav-dark' : ''}`}>
      <nav className="tp-nav">
        <div className="tp-nav-logo">
          <img src="/assets/logo_light.svg" alt="Final Table" className={`tp-nav-logo-img${scrolled ? ' tp-nav-logo-hidden' : ''}`} />
          <img src="/assets/logo_cion.svg" alt="Final Table" className={`tp-nav-logo-icon-img${scrolled ? '' : ' tp-nav-logo-hidden'}`} />
        </div>
        <div className="tp-nav-links">
          <a href="#">Features</a>
          <a href="#">Stats</a>
          <a href="#">Club Mode</a>
          <a href="#">Pricing</a>
          <a href="#">Help</a>
        </div>
        <a href="#" className="tp-nav-cta">
          <img src="/device-mobile-camera.svg" alt="" className="tp-nav-cta-icon" />
          Get the app
        </a>
      </nav>
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
    <section className="tp-hero">
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

/* ────────────────────────────────────────────────────── */
/*  BG IMAGE SECTION  (scroll-driven tabs)                */
/* ────────────────────────────────────────────────────── */
function TPBgSection() {
  const [activeTab, setActiveTab] = useState(0)
  const [tabsVisible, setTabsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const scrolledIn = -rect.top
      const scrollableRange = section.offsetHeight - window.innerHeight

      if (scrolledIn < 0 || scrolledIn > scrollableRange) {
        setTabsVisible(false)
        return
      }

      setTabsVisible(true)
      const tabIndex = Math.min(
        Math.floor(scrolledIn / window.innerHeight),
        tabs.length - 1
      )
      setActiveTab(Math.max(0, tabIndex))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="tp-bg-section" ref={sectionRef}>
      <div className="tp-bg-sticky">
        <img src="/phone_mockup_1.png" alt="" className="tp-bg-section-mockup" />

        {/* Tab bar — absolute inside sticky, never leaves the section */}
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
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DARK FEATURE SECTION                                  */
/* ────────────────────────────────────────────────────── */
function TPDarkSection() {
  return (
    <section className="tp-dark-section" data-nav-dark>
      <div className="tp-dark-container">
        {/* Heading */}
        <div className="tp-dark-heading">
          <h2 className="tp-dark-h2">Everything you've ever wanted to<br />know about your game—and more.</h2>
          <p className="tp-dark-sub">
            Final Table keeps you sharp by tracking more information about every hand than any
            other app — like the #1 and #2 leaks destroying your winrate.
          </p>
        </div>

        {/* Card grid */}
        <div className="tp-dark-grid">

          {/* Full-width card */}
          <div className="tp-dark-card tp-dc-full" style={{ backgroundImage: `url(${IMG_DARK_CARD1_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="tp-dc-overlay" />
            <div className="tp-dc-text">
              <h3 className="tp-dc-title">See why you're losing.<br />Finally!</h3>
              <p className="tp-dc-body">
                Opponents often exploit your leaks before you notice them. Final Table doesn't hide
                anything. We track your tendencies across every hand — so you can fix leaks before
                they cost you more.
              </p>
            </div>
            <div className="tp-dc-phone-right">
              <img src={IMG_DARK_CARD2_INNER} alt="" className="tp-dc-phone-img" />
            </div>
            <div className="tp-dc-fade-bottom" />
            <div className="tp-dc-border" />
          </div>

          {/* Two-column row */}
          <div className="tp-dc-row">

            {/* Left card */}
            <div className="tp-dark-card tp-dc-half" style={{ backgroundImage: `url(${IMG_DARK_CARD2_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="tp-dc-overlay" />
              <div className="tp-dc-text-sm">
                <p className="tp-dc-label">
                  <strong>Spot bad habits. Long before you notice.</strong>
                  {' '}
                  <span>Late players are your #1 opponent. Final Table uses pattern recognition to predict tilt behaviour — up to 6 hands before it shows up in your stats.</span>
                </p>
              </div>
              <div className="tp-dc-fade-bottom" />
              <div className="tp-dc-border" />
            </div>

            {/* Right card */}
            <div className="tp-dark-card tp-dc-half" style={{ backgroundImage: `url(${IMG_DARK_CARD4_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="tp-dc-atc">
                <div className="tp-dc-atc-header">
                  <span>Hand #4,291</span>
                </div>
                <div className="tp-dc-atc-row">
                  <span className="tp-dc-atc-red">⚠ 3-bet % spiking</span>
                </div>
                <p className="tp-dc-atc-body">
                  Mike has 3-bet 4 times in the last 8 hands. Current frequency: 38% — well above
                  baseline. Probability of bluff squeeze on next orbit: high.
                </p>
                <div className="tp-dc-atc-divider" />
                <div className="tp-dc-atc-row">
                  <strong>Thunderstorm pattern</strong>
                </div>
                <p className="tp-dc-atc-sub">Aggression spike flagged by Final Table AI</p>
              </div>
              <div className="tp-dc-text-sm" style={{ position: 'absolute', top: 40, left: 40, right: 28 }}>
                <p className="tp-dc-label">
                  <strong>Direct from the felt.</strong>
                  {' '}
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Opponent aggression spikes are the #2 cause of chip loss. Final Table surfaces these and tells you what might impact your stack — ground stops, weather patterns in their play style, or sudden aggression.</span>
                </p>
              </div>
              <div className="tp-dc-border" />
            </div>

          </div>

          {/* Second two-column row */}
          <div className="tp-dc-row">

            {/* Left card */}
            <div className="tp-dark-card tp-dc-half" style={{ backgroundImage: `url(${IMG_DARK_CARD3_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="tp-dc-overlay" />
              <div className="tp-dc-text-sm">
                <p className="tp-dc-label">
                  <strong>First to know. First to act.</strong>
                  {' '}
                  <span>Hear about big hands and betting patterns before the rest of the table. Final Table's alerts are instant, clear, and unfiltered — giving you the earliest signal to adapt.</span>
                </p>
              </div>
              <div className="tp-dc-fade-bottom" />
              <div className="tp-dc-border" />
            </div>

            {/* Right card */}
            <div className="tp-dark-card tp-dc-half">
              <div className="tp-dc-text-sm">
                <p className="tp-dc-label">
                  <strong>Putting the 'Pro' in approachable.</strong>
                  {' '}
                  <span>Powerful, coach-grade data that you can actually understand. Get VPIP, PFR, 3-bet, aggression factor, and booking notes — all at a glance. Never stare at a confusing spreadsheet again.</span>
                </p>
              </div>
              <div className="tp-dc-border" />
            </div>

          </div>
        </div>

        {/* CTA inside dark section */}
        <div className="tp-dark-cta">
          <p className="tp-dark-cta-text">Import your hands in seconds</p>
          <p className="tp-dark-cta-sub">
            Works seamlessly with PokerNow, ClubGG, and any CSV export.
          </p>
          <a href="#" className="tp-dark-cta-btn">Start logging free →</a>
        </div>
      </div>
    </section>
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
  return (
    <footer className="tp-footer" data-nav-dark>
      <div className="tp-footer-container">
        <div className="tp-footer-logo">
          <div className="tp-footer-logo-icon">♠</div>
        </div>
        <div className="tp-footer-cols">
          <div className="tp-footer-col">
            <p className="tp-footer-col-head">Product</p>
            <a href="#">Features</a>
            <a href="#">Stats Tracking</a>
            <a href="#">Club Mode</a>
            <a href="#">Pricing</a>
            <a href="#">Changelog</a>
          </div>
          <div className="tp-footer-col">
            <p className="tp-footer-col-head">Compare</p>
            <a href="#">vs PokerTracker</a>
            <a href="#">vs Hold'em Manager</a>
            <a href="#">vs DriveHUD</a>
            <a href="#">vs Poker Analytics</a>
          </div>
          <div className="tp-footer-col">
            <p className="tp-footer-col-head">Company</p>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="/privacy.html">Privacy Policy</a>
            <a href="/terms.html">Terms of Service</a>
          </div>
          <div className="tp-footer-col">
            <p className="tp-footer-col-head">Support</p>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <div className="tp-footer-social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Discord">💬</a>
            </div>
          </div>
        </div>
      </div>
      <div className="tp-footer-bottom">
        <span>Made with ♠ for serious players.</span>
      </div>
    </footer>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FIXED TAB BAR                                         */
/* ────────────────────────────────────────────────────── */
const tabs = [
  { icon: IMG_TAB_ICON_1, label: 'Hand-by hand logging' },
  { icon: IMG_TAB_ICON_2, label: '7 Core Statistics' },
  { icon: IMG_TAB_ICON_3, label: 'Play Style Detection' },
  { icon: IMG_TAB_ICON_4, label: 'Download' },
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
export default function TestPage() {
  return (
    <div className="tp-root">
      <TPNavbar />
      <main>
        <TPHero />
        <TPBgSection />
        <TPDarkSection />
        <TPFeatureSection />
        <TPMoreReasons />
      </main>
      <TPFooter />
    </div>
  )
}
