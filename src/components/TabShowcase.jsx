import { useState, useEffect, useRef } from 'react'

const SCROLL_PER_TAB = 80 // vh per tab

const tabs = [
  {
    id: 'logging',
    label: 'Hand-by-Hand Logging',
    headline: 'Every action at the table, captured.',
    body: 'Track folds, raises, all-ins, board cards, showdowns, and chopped pots. Full history of every hand you\'ve ever played, always at your fingertips.',
    screenColor: '#0d1f3c',
  },
  {
    id: 'stats',
    label: '7 Core Statistics',
    headline: 'Know exactly how you play.',
    body: 'VPIP, PFR, 3-Bet, C-Bet, Steal, Check-Raise, Fold-to-3Bet — updated in real time after every hand. Spot leaks and fix them fast.',
    screenColor: '#1a0d3c',
  },
  {
    id: 'playstyle',
    label: 'Play Style Detection',
    headline: 'Your style, classified by data.',
    body: 'Are you a TAG, LAG, Nit, or Calling Station? Final Table classifies your play style — and your opponents\' — based on real hand history.',
    screenColor: '#0d3c1a',
  },
  {
    id: 'download',
    label: 'Download',
    headline: 'Ready to level up your game?',
    body: 'Final Table is available on iOS and Android. Join thousands of players already tracking their game. Download free and start logging today.',
    screenColor: '#1a1a1a',
  },
]

export default function TabShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const [fading, setFading] = useState(false)
  const sectionRef = useRef(null)
  const prevTab = useRef(0)
  const isTransitioning = useRef(false)

  useEffect(() => {
    const section = sectionRef.current

    function onScroll() {
      const rect = section.getBoundingClientRect()
      const scrolledIn = -rect.top
      const totalScrollable = section.offsetHeight - window.innerHeight
      if (scrolledIn < 0 || scrolledIn > totalScrollable) return

      const progress = scrolledIn / totalScrollable
      const next = Math.min(Math.floor(progress * tabs.length), tabs.length - 1)

      if (next === prevTab.current) return
      if (isTransitioning.current) {
        prevTab.current = next
        return
      }

      isTransitioning.current = true
      setFading(true)
      setTimeout(() => {
        setActiveTab(next)
        prevTab.current = next
        setFading(false)
        isTransitioning.current = false
      }, 180)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tab = tabs[activeTab]
  // Section needs to be tall enough for all tabs to activate plus the 100vh sticky area
  const outerHeight = `calc(100vh + ${tabs.length * SCROLL_PER_TAB}vh)`

  return (
    <section
      ref={sectionRef}
      className="ts-outer"
      style={{ height: outerHeight }}
    >
      <div className="ts-sticky">

        {/* Changing content: text + phone mockup */}
        <div className={`ts-content${fading ? ' fading' : ''}`}>
          <div className="ts-text">
            <h2 className="ts-headline">{tab.headline}</h2>
            <p className="ts-body">{tab.body}</p>
          </div>

          {/* Dummy phone mockup */}
          <div className="ts-phone">
            <div className="ts-phone-speaker" />
            <div className="ts-phone-screen" style={{ background: tab.screenColor }}>
              <div className="ts-phone-screen-shimmer" />
            </div>
            <div className="ts-phone-home" />
          </div>
        </div>

        {/* Tab bar — bottom of viewport */}
        <div className="ts-tab-bar">
          <div className="ts-tab-pills">
            {tabs.map((t, i) => (
              <div
                key={t.id}
                className={`ts-pill${activeTab === i ? ' active' : ''}`}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
