import { useEffect, useRef } from 'react'

const bentoItems = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" className="al-fill-target"/><polyline points="16 11 18 13 22 9"/></svg>,
    title: 'Opponent Profiles',
    body: "Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you've played against them.",
  },
  {
    large: true,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" className="al-fill-target"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>,
    title: 'Bankroll Tracking',
    body: 'Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows your cumulative results over time.',
    chart: true,
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 12h8"/><path d="M13 18h8"/><path d="M13 6h8"/><path d="M3 12h1" className="al-fill-target"/><path d="M3 18h1" className="al-fill-target"/><path d="M3 6h1" className="al-fill-target"/><path d="M8 12h1"/><path d="M8 18h1"/><path d="M8 6h1"/></svg>,
    title: 'Quick Session Logger',
    body: "Don't want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.",
  },
  {
    large: true,
    premium: true,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" className="al-fill-target"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    title: 'AI Hand Analysis',
    body: 'Get GTO-based feedback on your hands. The AI reviews your decisions and suggests improvements.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19.16l4.03 2.22a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L12.92 10l-9.95 2.92z" className="al-fill-target"/><path d="m12 22-8.5-4.5"/><path d="M12 22v-9"/><path d="m12 13 8.5 4.5"/><path d="M12 9V2"/><path d="m12 9-5-3"/><path d="m12 9 5-3"/></svg>,
    title: 'Club Management',
    body: 'Create or join a poker club. Manage members, roles, tables, and run events — all from the app.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z" className="al-fill-target"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/></svg>,
    title: 'Multi-Table Tournaments',
    body: 'Run live tournaments with multiple tables, real-time rankings, final standings, and prize distribution.',
  },
  {
    large: true,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4c0-1.1.9-2 2-2" className="al-fill-target"/><path d="M20 2c1.1 0 2 .9 2 2"/><path d="M22 8c0 1.1-.9 2-2 2"/><path d="M16 10c-1.1 0-2-.9-2-2"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5c0-1.7 1.3-3 3-3h1"/><rect width="8" height="8" x="2" y="14" rx="2"/><path d="M14 14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M20 14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/></svg>,
    title: 'Dealer Mode',
    body: 'Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 12v4a1 1 0 0 1-1 1h-4"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M17 21h2a2 2 0 0 0 2-2v-2"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="4" height="4" rx="1" className="al-fill-target"/><rect x="13" y="7" width="4" height="4" rx="1"/><rect x="7" y="13" width="4" height="4" rx="1"/></svg>,
    title: 'QR Seat Assignments',
    body: 'Players scan a QR code to claim their seat. No manual setup, no confusion.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" className="al-fill-target"/><path d="M12 12v5h5"/><path d="M12 17a5 5 0 0 0 4.34-2.5"/><path d="M12 22a5 5 0 0 1-4.34-2.5"/><path d="M12 17v5h-5"/></svg>,
    title: 'Real-Time Sync',
    body: 'Every action broadcasts instantly to all players and spectators via live updates.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="al-svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M21 12h-6" className="al-fill-target"/></svg>,
    title: 'Cash Game Waitlists',
    body: 'Stakes-scoped waitlists let players queue for the game they want. Admins manage seating from the dashboard.',
  },
]

const trustBadges = [
  { label: 'Works Offline', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'Position-aware Stats', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { label: 'Pinch-to-zoom Charts', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: 'Calendar Reminders', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" className="cal-line"/><path d="M16 2v4" className="cal-line"/><rect width="18" height="18" x="3" y="4" rx="2" className="cal-rect"/><path d="M3 10h18" className="cal-divider"/><circle cx="8" cy="14" r="1.5" className="cal-dot" fill="currentColor" stroke="currentColor"/></svg> },
  { label: 'Dark Theme', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  { label: 'iOS & Android', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
]

function IPhoneFrame({ src, alt }) {
  return (
    <div className="iphone-container">
      <div className="iphone-frame">
        <div className="iphone-button-mute" />
        <div className="iphone-button-vol-up" />
        <div className="iphone-button-vol-down" />
        <div className="iphone-button-power" />
        <div className="iphone-notch" />
        <div className="iphone-screen">
          <img src={src} alt={alt} />
        </div>
      </div>
    </div>
  )
}

export default function Features() {
  const chartRef = useRef(null)

  // Animate chart bars on scroll into view
  useEffect(() => {
    const bars = document.querySelectorAll('.fake-chart .bar')
    if (!bars.length) return
    bars.forEach(bar => {
      bar.dataset.targetHeight = bar.style.height
      bar.style.height = '0%'
    })
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bars.forEach((bar, i) => setTimeout(() => { bar.style.height = bar.dataset.targetHeight }, i * 150))
          obs.disconnect()
        }
      })
    }, { threshold: 0.5 })
    if (chartRef.current) obs.observe(chartRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Showcase Grid */}
      <section id="hero-features" className="features-section" style={{ paddingTop: '40px' }}>
        <div className="showcase-grid">
          <div className="showcase-card bg-showcase-1 observe-me">
            <div className="showcase-text-content">
              <h3>Hand-by-Hand Logging</h3>
              <p>Track every action at the table &mdash; folds, raises, all-ins, board cards, showdowns, chopped pots. Full history of every hand you've ever played.</p>
            </div>
            <img src="/assets/mockups/feature_logging.png" className="pre-framed-mockup" alt="Hand Logging Feature Screenshot" />
          </div>

          <div className="showcase-card bg-showcase-2 observe-me">
            <div className="showcase-text-content">
              <h3>7 Core Statistics</h3>
              <p>VPIP, PFR, 3-Bet, C-Bet, Steal, Check-Raise, Fold-to-3Bet &mdash; updated in real time after every hand. Know exactly how you play.</p>
            </div>
            <IPhoneFrame src="/assets/mockups/app_dashboard_preview.png" alt="7 Core Statistics Feature" />
          </div>

          <div className="showcase-card showcase-large bg-showcase-3 observe-me">
            <div className="showcase-text-content">
              <h3>Play Style Detection</h3>
              <p>Are you a TAG, LAG, Nit, or Calling Station? The app classifies your style (and your opponents') based on real data.</p>
            </div>
            <IPhoneFrame src="/assets/mockups/app_dashboard_preview.png" alt="Play Style Detection Feature" />
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="features" className="features-section">
        <div className="section-header observe-me">
          <h2>Everything You Need to Win</h2>
        </div>
        <div className="bento-grid">
          {bentoItems.map((item, i) => (
            <div key={i} className={`bento-item${item.large ? ' bento-large' : ''} observe-me`}>
              <div className="bento-content">
                {item.premium && <div className="premium-badge">Premium</div>}
                <div className="bento-icon-wrapper al-loop">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.chart && (
                  <div className="fake-chart" ref={chartRef}>
                    <div className="bar" style={{ height: '40%' }} />
                    <div className="bar" style={{ height: '60%' }} />
                    <div className="bar" style={{ height: '50%' }} />
                    <div className="bar" style={{ height: '80%' }} />
                    <div className="bar highlight" style={{ height: '100%' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </>
  )
}
