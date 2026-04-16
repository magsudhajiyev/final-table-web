import { useEffect, useRef, useState } from 'react'

export default function Footer({
  leftLinks = [
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About Us' },
    { href: '#contact', label: 'Contact' },
    { href: '#download', label: 'Download App' },
  ],
  rightLinks = [
    { href: '#', label: 'Privacy' },
    { href: '#', label: 'Terms' },
  ],
  copyrightText = '© 2026 Final Table. All rights reserved.',
  barCount = 23,
}) {
  const waveRefs = useRef([])
  const footerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark-theme'))

  // Sync with body theme class changes
  useEffect(() => {
    const mo = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-theme'))
    })
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  // Visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  // Wave animation
  useEffect(() => {
    let t = 0

    const animate = () => {
      let offset = 0
      waveRefs.current.forEach((el, index) => {
        if (!el) return
        offset += Math.max(0, 20 * Math.sin((t + index) * 0.3))
        el.style.transform = `translateY(${index + offset}px)`
      })
      t += 0.1
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (isVisible) {
      animate()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isVisible])

  const barColor = isDark ? 'rgb(255,255,255)' : 'rgb(0,0,0)'

  return (
    <footer ref={footerRef} className={`footer-wave-root${isDark ? ' footer-wave-dark' : ' footer-wave-light'}`}>
      <div className="footer-wave-inner">
        <div className="footer-wave-left">
          <ul className="footer-wave-links">
            {leftLinks.map((link, i) => (
              <li key={i}><a href={link.href} className="footer-wave-link">{link.label}</a></li>
            ))}
          </ul>
          <p className="footer-wave-copy">
            <svg className="footer-wave-copy-icon" viewBox="0 0 80 80">
              <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M67.4307 11.5693C52.005 -3.85643 26.995 -3.85643 11.5693 11.5693C-3.85643 26.995 -3.85643 52.005 11.5693 67.4307C26.995 82.8564 52.005 82.8564 67.4307 67.4307C82.8564 52.005 82.8564 26.995 67.4307 11.5693ZM17.9332 17.9332C29.8442 6.02225 49.1558 6.02225 61.0668 17.9332C72.9777 29.8442 72.9777 49.1558 61.0668 61.0668C59.7316 62.4019 58.3035 63.5874 56.8032 64.6232L56.8241 64.6023C46.8657 54.6439 46.8657 38.4982 56.8241 28.5398L58.2383 27.1256L51.8744 20.7617L50.4602 22.1759C40.5018 32.1343 24.3561 32.1343 14.3977 22.1759L14.3768 22.1968C15.4126 20.6965 16.5981 19.2684 17.9332 17.9332ZM34.0282 38.6078C25.6372 38.9948 17.1318 36.3344 10.3131 30.6265C7.56889 39.6809 9.12599 49.76 14.9844 57.6517L34.0282 38.6078ZM21.3483 64.0156C29.24 69.874 39.3191 71.4311 48.3735 68.6869C42.6656 61.8682 40.0052 53.3628 40.3922 44.9718L21.3483 64.0156Z"/>
            </svg>
            {copyrightText}
          </p>
        </div>

        <div className="footer-wave-right">
          <ul className="footer-wave-links">
            {rightLinks.map((link, i) => (
              <li key={i}><a href={link.href} className="footer-wave-link">{link.label}</a></li>
            ))}
          </ul>
          <div className="footer-wave-back">
            <button className="footer-wave-back-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
            </button>
          </div>
        </div>
      </div>

      <div className="footer-wave-bars" aria-hidden="true">
        <div>
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              ref={el => { waveRefs.current[i] = el }}
              className="wave-segment"
              style={{
                height: `${i + 1}px`,
                backgroundColor: barColor,
                transition: 'transform 0.1s ease',
                willChange: 'transform',
                marginTop: '-2px',
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  )
}
