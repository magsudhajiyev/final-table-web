import { useEffect, useRef } from 'react'

const slides = [
  {
    number: '01',
    title: 'Log Every Hand',
    body: 'Record folds, raises, all-ins, board cards, and showdowns in seconds. Your full hand history, always at your fingertips.',
    bg: '#0a0a0a',
    accent: '#A2F69A',
    img: '/assets/mockups/feature_logging.png',
  },
  {
    number: '02',
    title: 'Track Your Stats',
    body: 'VPIP, PFR, 3-Bet, C-Bet — all seven core stats updated in real time after every hand. Know your game inside out.',
    bg: '#111827',
    accent: '#A2F69A',
    img: '/assets/mockups/app_dashboard_preview.png',
  },
  {
    number: '03',
    title: 'Know Your Style',
    body: 'TAG, LAG, Nit, or Calling Station? The app classifies your play style and your opponents based on real data.',
    bg: '#0d1f1b',
    accent: '#A2F69A',
    img: '/assets/mockups/app_dashboard_preview.png',
  },
  {
    number: '04',
    title: 'Run Your Club',
    body: 'Create or join a poker club. Manage members, waitlists, tournaments, and prize distributions — all from one app.',
    bg: '#1a0f00',
    accent: '#A2F69A',
    img: '/assets/mockups/feature_logging.png',
  },
]

export default function HorizontalScroll() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Amount to scroll: total track width minus one viewport width
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth)

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="hscroll-section">
      <div ref={trackRef} className="hscroll-track">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hscroll-card"
            style={{ '--card-bg': slide.bg, '--card-accent': slide.accent }}
          >
            <div className="hscroll-card-inner">
              <div className="hscroll-card-text">
                <span className="hscroll-number">{slide.number}</span>
                <h2 className="hscroll-title">{slide.title}</h2>
                <p className="hscroll-body">{slide.body}</p>
              </div>
              <div className="hscroll-card-visual">
                <div className="hscroll-phone-wrap">
                  <img src={slide.img} alt={slide.title} className="hscroll-phone-img" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
