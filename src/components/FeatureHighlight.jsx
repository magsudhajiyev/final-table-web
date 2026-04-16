const notifCards = [
  {
    suit: '♠',
    title: 'Mike 3-bet pre-flop again',
    sub: '3-bet frequency: 22% over 30 hands',
  },
  {
    suit: '♥',
    title: 'Alex is playing very loose',
    sub: 'VPIP 51% — Calling Station profile',
  },
  {
    suit: '♦',
    title: 'Sarah folded to your 3-bet',
    sub: 'Fold-to-3-bet: 74% lifetime',
  },
]

const players = [
  { name: 'Alex M.', tag: 'Calling Station', color: '#e74c3c' },
  { name: 'Jordan K.', tag: 'TAG', color: '#08a85b' },
  { name: 'Sam R.', tag: 'LAG', color: '#f39c12' },
  { name: 'Chris P.', tag: 'Nit', color: '#3498db' },
]

function PhoneMockup({ colorTop, colorBottom }) {
  return (
    <div className="fh-phone-mockup">
      <div className="fh-pm-speaker" />
      <div
        className="fh-pm-screen"
        style={{ background: `linear-gradient(160deg, ${colorTop} 0%, ${colorBottom} 100%)` }}
      >
        <div className="fh-pm-bar" style={{ width: '55%', opacity: 0.25, marginBottom: 10 }} />
        <div className="fh-pm-bar" style={{ width: '75%', opacity: 0.18, marginBottom: 8 }} />
        <div className="fh-pm-bar" style={{ width: '40%', opacity: 0.12, marginBottom: 20 }} />
        <div className="fh-pm-stat-row">
          <div className="fh-pm-stat" />
          <div className="fh-pm-stat" />
          <div className="fh-pm-stat" />
        </div>
        <div className="fh-pm-bar" style={{ width: '80%', opacity: 0.1, marginTop: 16 }} />
        <div className="fh-pm-bar" style={{ width: '60%', opacity: 0.08, marginTop: 8 }} />
      </div>
      <div className="fh-pm-home" />
    </div>
  )
}

export default function FeatureHighlight() {
  return (
    <section className="fh-section">
      <div className="fh-container">

        {/* Section heading — left-aligned, outside cards */}
        <div className="fh-header">
          <h2 className="fh-title">Build reads on every opponent, automatically.</h2>
          <p className="fh-desc">
            Final Table tracks every player you face. Watch their stats update in real time
            and know exactly how they play — before they even act.
          </p>
        </div>

        <div className="fh-grid">

          {/* ── Large card: text left, phones right (clipped) ── */}
          <div className="fh-card-lg">
            {/* Text — absolutely positioned per Figma */}
            <p className="fh-feature-hl fh-lg-label">Real-time opponent tracking</p>
            <h3 className="fh-card-headline fh-lg-headline">
              Never sit down without a read ever again.
            </h3>
            <p className="fh-card-body fh-lg-body">
              VPIP, 3-bet frequency, aggression factor, and play style classification
              update live as every hand is logged.
            </p>

            {/* Back phone */}
            <div className="fh-phone-wrap fh-phone-back">
              <PhoneMockup colorTop="#0d1f3c" colorBottom="#1a3560" />
            </div>

            {/* Front phone */}
            <div className="fh-phone-wrap fh-phone-front">
              <PhoneMockup colorTop="#101820" colorBottom="#0d2a4a" />
            </div>
          </div>

          {/* ── Two smaller cards ── */}
          <div className="fh-cards-2col">

            {/* Left: notification stack */}
            <div className="fh-card-sm">
              <p className="fh-feature-hl fh-sm-label">Stop guessing. Start knowing.</p>

              <div className="fh-notif fh-notif-1">
                <div className="fh-notif-icon">♠</div>
                <div className="fh-notif-text">
                  <p className="fh-notif-title">{notifCards[0].title}</p>
                  <p className="fh-notif-sub">{notifCards[0].sub}</p>
                </div>
              </div>
              <div className="fh-notif fh-notif-2">
                <div className="fh-notif-icon">♥</div>
                <div className="fh-notif-text">
                  <p className="fh-notif-title">{notifCards[1].title}</p>
                  <p className="fh-notif-sub">{notifCards[1].sub}</p>
                </div>
              </div>
              <div className="fh-notif fh-notif-3">
                <div className="fh-notif-icon">♦</div>
                <div className="fh-notif-text">
                  <p className="fh-notif-title">{notifCards[2].title}</p>
                  <p className="fh-notif-sub">{notifCards[2].sub}</p>
                </div>
              </div>
            </div>

            {/* Right: player tags */}
            <div className="fh-card-sm">
              <p className="fh-feature-hl fh-sm-label">Tag players. Never forget a hand.</p>

              {players.map((p, i) => (
                <div
                  className={`fh-notif fh-notif-${i + 1}`}
                  key={i}
                  style={{ '--item-idx': i }}
                >
                  <div className="fh-notif-avatar">{p.name[0]}</div>
                  <div className="fh-notif-text" style={{ flex: 1 }}>
                    <p className="fh-notif-title">{p.name}</p>
                  </div>
                  <span
                    className="fh-player-tag"
                    style={{
                      background: p.color + '18',
                      color: p.color,
                      borderColor: p.color + '33',
                    }}
                  >
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
