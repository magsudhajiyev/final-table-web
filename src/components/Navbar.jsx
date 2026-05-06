import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const handleNavClick = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <a href="/" className="logo-link">
            <img src="/logo.png" alt="Final Table Logo" className="logo-img" />
          </a>
        </div>

        <nav className="nav desktop-nav">
          <div className="nav-rounded-container">
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#features" className="nav-link"><span className="nav-text">Features</span></a>
              </li>
              <li className="nav-item">
                <a href="#about" className="nav-link"><span className="nav-text">About Us</span></a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="nav-cta">
          <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label="Toggle Dark Mode">
            <svg className="sun-icon" style={{ display: isDark ? 'none' : 'block' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg className="moon-icon" style={{ display: isDark ? 'block' : 'none' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <a href="#contact" className="btn btn-secondary nav-contact-btn desktop-cta">Contact</a>
          <a href="#download" className="btn btn-primary desktop-cta">Download App</a>
        </div>

        <button
          className={`hamburger-menu${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      <div className={`mobile-nav${menuOpen ? ' active' : ''}`} onClick={e => e.target === e.currentTarget && setMenuOpen(false)}>
        <nav className="mobile-nav-content">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item"><a href="#features" className="mobile-nav-link" onClick={handleNavClick}>Features</a></li>
            <li className="mobile-nav-item"><a href="#about" className="mobile-nav-link" onClick={handleNavClick}>About Us</a></li>
            <li className="mobile-nav-item"><a href="#contact" className="mobile-nav-link" onClick={handleNavClick}>Contact</a></li>
            <li className="mobile-nav-item"><a href="#download" className="mobile-nav-link cta-link" onClick={handleNavClick}>Download App</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
