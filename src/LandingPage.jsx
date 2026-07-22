import { useState, useEffect, useRef, forwardRef } from 'react'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import { ThemeToggle, useTheme } from './theme'
import { FinalTableLogo } from './components/FinalTableLogo'
import './LandingPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru', tr: 'tr', uk: 'ua' }

const APP_STORE_URL = 'https://apps.apple.com/us/app/final-table/id6760188970'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.finaltable.app'

function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

/* ── Deterministic daily player count ── */
function getPlayerCount() {
  const BASE = 283
  const START = new Date('2026-04-29')
  const now = new Date()
  const slots = Math.floor((now - START) / 10800000) // 3-hour slots
  let total = BASE
  for (let s = 0; s < slots; s++) {
    const seed = s * 2654435761 >>> 0
    total += (seed % 5) + 1 // random 1-5 per 30 min
  }
  return total.toLocaleString()
}

// Tab icons as inline SVG data URIs (Lucide-style)
const IMG_TAB_ICON_1    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>')}`
const IMG_TAB_ICON_2    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>')}`
const IMG_TAB_ICON_3    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>')}`
const IMG_TAB_ICON_4    = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>')}`

/* ────────────────────────────────────────────────────── */
/*  HOW-IT-WORKS heading helper                           */
/* ────────────────────────────────────────────────────── */
function HowTitle({ text }) {
  const nl = text.indexOf('\n')
  if (nl === -1) return <p className="tp-how-heading">{text}</p>
  const line1 = text.slice(0, nl)
  const line2 = text.slice(nl + 1)
  const dot1 = line1.endsWith('.')
  const dot2 = line2.endsWith('.')
  const core1 = dot1 ? line1.slice(0, -1) : line1
  const core2 = dot2 ? line2.slice(0, -1) : line2
  return (
    <div className="tp-how-heading">
      <span>{core1}{dot1 && '.'}</span>{' '}
      <em className="tp-how-italic">{core2}</em>{dot2 && '.'}
    </div>
  )
}

function HiwTitle({ text }) {
  const nl = text.indexOf('\n')
  if (nl === -1) return <p className="hiw-heading">{text}</p>
  const line1 = text.slice(0, nl)
  const line2 = text.slice(nl + 1)
  const dot1 = line1.endsWith('.')
  const dot2 = line2.endsWith('.')
  const core1 = dot1 ? line1.slice(0, -1) : line1
  const core2 = dot2 ? line2.slice(0, -1) : line2
  return (
    <div className="hiw-heading">
      <span>{core1}{dot1 && '.'}</span>
      <br />
      <em className="hiw-heading-italic">{core2}</em>{dot2 && '.'}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DOWNLOAD BUTTON  (nav, animated dot-matrix arrow)     */
/* ────────────────────────────────────────────────────── */
const DL_COLS = 9, DL_ROWS = 9, DL_CX = 4, DL_CY = 4, DL_R = 4.35
const DL_TICK_MS = 150
const DL_ARROW = [
  [0, 4], [1, 4], [2, 4], [3, 4],
  [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
  [5, 3], [5, 4], [5, 5],
  [6, 4],
]
const DL_ARROW_HEIGHT = 7
const DL_TRAY = new Set([[7, 3], [7, 4], [7, 5]].map(([r, c]) => r * DL_COLS + c))

function TPDownloadBtn({ label, iosHref, androidHref, iosLabel, androidLabel }) {
  const [offset, setOffset] = useState(-DL_ARROW_HEIGHT)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setOffset(0); return }
    const id = setInterval(() => {
      setOffset(o => (o > DL_ROWS ? -DL_ARROW_HEIGHT : o + 1))
    }, DL_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const litSet = new Set()
  DL_ARROW.forEach(([r, c]) => {
    const rr = r + offset
    if (rr >= 0 && rr < 7) litSet.add(rr * DL_COLS + c)
  })

  const cells = []
  for (let r = 0; r < DL_ROWS; r++) {
    for (let c = 0; c < DL_COLS; c++) {
      const inside = Math.hypot(c - DL_CX, r - DL_CY) <= DL_R
      const idx = r * DL_COLS + c
      const isLit = litSet.has(idx)
      const isTray = !isLit && DL_TRAY.has(idx)
      const cls = 'dl-btn-dot' +
        (!inside ? ' dl-btn-dot--hidden' : '') +
        (isLit ? ' dl-btn-dot--lit' : '') +
        (isTray ? ' dl-btn-dot--tray' : '')
      cells.push(<span key={idx} className={cls} />)
    }
  }

  return (
    <div className="dl-btn-wrap" ref={wrapRef}>
      <button
        type="button"
        className="dl-btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="dl-btn-label">{label}</span>
        <span className="dl-btn-matrix" aria-hidden="true">{cells}</span>
      </button>
      {open && (
        <div className="dl-btn-menu" role="menu">
          <a href={iosHref} className="dl-btn-menu-item" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.05 12.53c0-2.13 1.74-3.15 1.82-3.2-1-1.46-2.55-1.66-3.09-1.68-1.31-.13-2.56.77-3.23.77-.67 0-1.7-.75-2.8-.73-1.44.02-2.77.84-3.51 2.12-1.5 2.59-.38 6.42 1.07 8.52.71 1.03 1.55 2.18 2.65 2.14 1.07-.04 1.48-.69 2.77-.69 1.29 0 1.66.69 2.79.67 1.15-.02 1.88-1.04 2.58-2.08.82-1.19 1.15-2.36 1.17-2.42-.03-.01-2.24-.86-2.26-3.42zM15 5.85c.59-.72 1-1.71.89-2.71-.86.04-1.9.58-2.51 1.3-.55.63-1.03 1.65-.9 2.62.96.07 1.94-.49 2.52-1.21z"/></svg>
            {iosLabel}
          </a>
          <a href={androidHref} className="dl-btn-menu-item" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.6 9.48l1.84-3.18a.4.4 0 0 0-.69-.4l-1.87 3.23a11.5 11.5 0 0 0-9.76 0L5.25 5.9a.4.4 0 0 0-.69.4l1.84 3.18A10.85 10.85 0 0 0 1 18h22a10.85 10.85 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 1.25-1.25c0 .69-.56 1.25-1.25 1.25zm10 0a1.25 1.25 0 1 1 1.25-1.25c0 .69-.56 1.25-1.25 1.25z"/></svg>
            {androidLabel}
          </a>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/*  NAVBAR                                                */
/* ────────────────────────────────────────────────────── */
export function TPNavbar() {
  const { t, locale, setLocale } = useT()
  const { theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const langRef = useRef(null)
  const mobileLangRef = useRef(null)
  // When not on the landing page (e.g., /privacy, /terms) hash-only nav
  // links should send users home to that anchor instead of trying to
  // scroll on the current page (where those sections don't exist).
  const onLanding = typeof window !== 'undefined' && window.location.pathname === '/'
  const hashHref = (id) => (onLanding ? `#${id}` : `/#${id}`)

  useEffect(() => {
    const handler = (e) => {
      const inDesktop = langRef.current && langRef.current.contains(e.target)
      const inMobile = mobileLangRef.current && mobileLangRef.current.contains(e.target)
      if (!inDesktop && !inMobile) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => { if (menuOpen) setMenuOpen(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  useEffect(() => {
    const NAV_IDS = ['how-it-works', 'features', 'compare', 'faq']
    const updateActive = () => {
      const threshold = window.scrollY + 80
      let current = ''
      NAV_IDS.forEach(id => {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= threshold) current = id
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => window.removeEventListener('scroll', updateActive)
  }, [])

  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href')
    // Only intercept in-page hash-only clicks on the landing page.
    // On other routes, allow the browser to navigate (/#faq → landing + scroll).
    if (href && href.startsWith('#') && onLanding) {
      e.preventDefault()
      setMenuOpen(false)
      if (window.__lenis) {
        window.__lenis.scrollTo(href)
      } else {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className={`tp-nav-wrap${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <div className="tp-nav-left">
          <a
            href={onLanding ? '#' : '/'}
            className="tp-nav-logo"
            onClick={(e) => {
              if (!onLanding) return
              e.preventDefault()
              if (window.__lenis) window.__lenis.scrollTo(0)
              else window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            {theme === 'light'
              ? <img src="/light_nav_logo.svg" alt="Final Table" className="tp-nav-logo-svg" />
              : <FinalTableLogo className="tp-nav-logo-svg" />}
          </a>
          <div className="tp-nav-links">
            <a href={hashHref('how-it-works')} className={activeSection === 'how-it-works' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.howItWorks')}</a>
            <a href={hashHref('features')} className={activeSection === 'features' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.features')}</a>
            <a href="/about">{t('about.nav')}</a>
          </div>
        </div>
        <div className="tp-nav-right">
          <TPDownloadBtn
            label={t('nav.download')}
            iosHref={APP_STORE_URL}
            androidHref={PLAY_STORE_URL}
            iosLabel={t('nav.downloadIos')}
            androidLabel={t('nav.downloadAndroid')}
          />
          <div className="tp-lang-picker" ref={langRef}>
            <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Change language">
              <Flag locale={locale} />
              <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {langOpen && (
              <div className="tp-lang-dropdown">
                {SUPPORTED.map(l => (
                  <button key={l} className={`tp-lang-option${l === locale ? ' tp-lang-option-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                    <Flag locale={l} />
                    <span>{t(`lang.${l}`)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="tp-mobile-lang-picker" ref={mobileLangRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Change language">
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-lang-dropdown">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-lang-option${l === locale ? ' tp-lang-option-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <Flag locale={l} />
                  <span>{t(`lang.${l}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="tp-nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`tp-nav-mobile-menu${menuOpen ? ' tp-nav-mobile-menu-open' : ''}`}>
        <a href={hashHref('how-it-works')} onClick={smoothScroll}>{t('nav.howItWorks')}</a>
        <a href={hashHref('features')} onClick={smoothScroll}>{t('nav.features')}</a>
        <a href="/about">{t('about.nav')}</a>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */

function AppStoreButton({ size = 'md', ...props }) {
  const w = size === 'xl' ? 168 : size === 'lg' ? 132 : 120
  const h = size === 'xl' ? 56 : size === 'lg' ? 44 : 40
  return (
    <a
      aria-label="Download on the App Store"
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="tp-appstore-badge-link"
      {...props}
    >
      <svg width={w} height={h} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" rx="7" fill="black"/>
        <path d="M81.5257 19.2009V21.4919H80.0896V22.9944H81.5257V28.0994C81.5257 29.8425 82.3143 30.5398 84.2981 30.5398C84.6468 30.5398 84.9788 30.4983 85.2693 30.4485V28.9626C85.0203 28.9875 84.8626 29.0041 84.5887 29.0041C83.7005 29.0041 83.3104 28.5891 83.3104 27.6428V22.9944H85.2693V21.4919H83.3104V19.2009H81.5257Z" fill="white"/>
        <path d="M90.3232 30.6643C92.9628 30.6643 94.5815 28.8962 94.5815 25.9661C94.5815 23.0525 92.9545 21.2761 90.3232 21.2761C87.6835 21.2761 86.0566 23.0525 86.0566 25.9661C86.0566 28.8962 87.6752 30.6643 90.3232 30.6643ZM90.3232 29.0789C88.7709 29.0789 87.8994 27.9416 87.8994 25.9661C87.8994 24.0071 88.7709 22.8616 90.3232 22.8616C91.8671 22.8616 92.747 24.0071 92.747 25.9661C92.747 27.9333 91.8671 29.0789 90.3232 29.0789Z" fill="white"/>
        <path d="M95.9664 30.49H97.7511V25.1526C97.7511 23.8826 98.7056 23.0276 100.059 23.0276C100.374 23.0276 100.905 23.0857 101.055 23.1355V21.3757C100.864 21.3259 100.524 21.301 100.258 21.301C99.0792 21.301 98.0748 21.9485 97.8175 22.8367H97.6846V21.4504H95.9664V30.49Z" fill="white"/>
        <path d="M105.486 22.7952C106.806 22.7952 107.669 23.7165 107.711 25.136H103.145C103.245 23.7248 104.166 22.7952 105.486 22.7952ZM107.702 28.0496C107.37 28.7551 106.632 29.1453 105.552 29.1453C104.125 29.1453 103.203 28.1409 103.145 26.5554V26.4558H109.529V25.8332C109.529 22.9944 108.009 21.2761 105.494 21.2761C102.946 21.2761 101.327 23.1106 101.327 25.9993C101.327 28.8879 102.913 30.6643 105.503 30.6643C107.57 30.6643 109.014 29.6682 109.421 28.0496H107.702Z" fill="white"/>
        <path d="M69.8221 27.1518C69.9598 29.3715 71.8095 30.7911 74.5626 30.7911C77.505 30.7911 79.3462 29.3027 79.3462 26.9281C79.3462 25.0612 78.2966 24.0287 75.7499 23.4351L74.382 23.0996C72.7645 22.721 72.1106 22.2134 72.1106 21.3272C72.1106 20.2088 73.1259 19.4775 74.6487 19.4775C76.0941 19.4775 77.0921 20.1916 77.2727 21.3358H79.1483C79.0365 19.2452 77.1953 17.774 74.6745 17.774C71.9644 17.774 70.1576 19.2452 70.1576 21.4563C70.1576 23.2802 71.1815 24.3643 73.427 24.8891L75.0272 25.2763C76.6705 25.6634 77.3932 26.2312 77.3932 27.1776C77.3932 28.2789 76.2575 29.079 74.7089 29.079C73.0484 29.079 71.8955 28.3305 71.7321 27.1518H69.8221Z" fill="white"/>
        <path d="M51.3348 21.301C50.1063 21.301 49.0437 21.9153 48.4959 22.9446H48.3631V21.4504H46.6448V33.4949H48.4295V29.1204H48.5706C49.0437 30.0749 50.0647 30.6394 51.3514 30.6394C53.6341 30.6394 55.0867 28.8381 55.0867 25.9661C55.0867 23.094 53.6341 21.301 51.3348 21.301ZM50.8284 29.0373C49.3343 29.0373 48.3963 27.8586 48.3963 25.9744C48.3963 24.0818 49.3343 22.9031 50.8367 22.9031C52.3475 22.9031 53.2522 24.0569 53.2522 25.9661C53.2522 27.8835 52.3475 29.0373 50.8284 29.0373Z" fill="white"/>
        <path d="M61.3316 21.301C60.103 21.301 59.0405 21.9153 58.4927 22.9446H58.3599V21.4504H56.6416V33.4949H58.4263V29.1204H58.5674C59.0405 30.0749 60.0615 30.6394 61.3482 30.6394C63.6309 30.6394 65.0835 28.8381 65.0835 25.9661C65.0835 23.094 63.6309 21.301 61.3316 21.301ZM60.8252 29.0373C59.3311 29.0373 58.3931 27.8586 58.3931 25.9744C58.3931 24.0818 59.3311 22.9031 60.8335 22.9031C62.3443 22.9031 63.249 24.0569 63.249 25.9661C63.249 27.8835 62.3443 29.0373 60.8252 29.0373Z" fill="white"/>
        <path d="M43.4428 30.49H45.4905L41.008 18.0751H38.9346L34.4521 30.49H36.431L37.5752 27.1948H42.3072L43.4428 30.49ZM39.8724 20.3292H40.0186L41.8168 25.5774H38.0656L39.8724 20.3292Z" fill="white"/>
        <path d="M35.6514 8.71094V14.7H37.8137C39.5984 14.7 40.6318 13.6001 40.6318 11.6868C40.6318 9.80249 39.5901 8.71094 37.8137 8.71094H35.6514ZM36.5811 9.55762H37.71C38.9509 9.55762 39.6855 10.3462 39.6855 11.6992C39.6855 13.073 38.9634 13.8533 37.71 13.8533H36.5811V9.55762Z" fill="white"/>
        <path d="M43.7969 14.7871C45.1167 14.7871 45.9261 13.9031 45.9261 12.438C45.9261 10.9812 45.1126 10.093 43.7969 10.093C42.4771 10.093 41.6636 10.9812 41.6636 12.438C41.6636 13.9031 42.4729 14.7871 43.7969 14.7871ZM43.7969 13.9944C43.0208 13.9944 42.585 13.4258 42.585 12.438C42.585 11.4585 43.0208 10.8857 43.7969 10.8857C44.5689 10.8857 45.0088 11.4585 45.0088 12.438C45.0088 13.4216 44.5689 13.9944 43.7969 13.9944Z" fill="white"/>
        <path d="M52.8182 10.1802H51.9259L51.1207 13.6292H51.0501L50.1205 10.1802H49.2655L48.3358 13.6292H48.2694L47.4601 10.1802H46.5553L47.8004 14.7H48.7176L49.6473 11.3713H49.7179L50.6517 14.7H51.5772L52.8182 10.1802Z" fill="white"/>
        <path d="M53.8458 14.7H54.7382V12.0562C54.7382 11.3506 55.1574 10.9106 55.8173 10.9106C56.4772 10.9106 56.7926 11.2717 56.7926 11.998V14.7H57.685V11.7739C57.685 10.699 57.1288 10.093 56.1203 10.093C55.4396 10.093 54.9914 10.396 54.7714 10.8982H54.705V10.1802H53.8458V14.7Z" fill="white"/>
        <path d="M59.0903 14.7H59.9826V8.41626H59.0903V14.7Z" fill="white"/>
        <path d="M63.3386 14.7871C64.6584 14.7871 65.4678 13.9031 65.4678 12.438C65.4678 10.9812 64.6543 10.093 63.3386 10.093C62.0188 10.093 61.2053 10.9812 61.2053 12.438C61.2053 13.9031 62.0146 14.7871 63.3386 14.7871ZM63.3386 13.9944C62.5625 13.9944 62.1267 13.4258 62.1267 12.438C62.1267 11.4585 62.5625 10.8857 63.3386 10.8857C64.1106 10.8857 64.5505 11.4585 64.5505 12.438C64.5505 13.4216 64.1106 13.9944 63.3386 13.9944Z" fill="white"/>
        <path d="M68.1265 14.0234C67.6409 14.0234 67.2881 13.7869 67.2881 13.3801C67.2881 12.9817 67.5704 12.77 68.1929 12.7285L69.2969 12.658V13.0356C69.2969 13.5959 68.7989 14.0234 68.1265 14.0234ZM67.8982 14.7747C68.4917 14.7747 68.9856 14.5173 69.2554 14.0649H69.326V14.7H70.1851V11.6121C70.1851 10.6575 69.5459 10.093 68.4129 10.093C67.3877 10.093 66.6573 10.5911 66.566 11.3672H67.4292C67.5289 11.0476 67.8733 10.865 68.3714 10.865C68.9815 10.865 69.2969 11.1348 69.2969 11.6121V12.0022L68.0726 12.0728C66.9976 12.1392 66.3916 12.6082 66.3916 13.4216C66.3916 14.2476 67.0267 14.7747 67.8982 14.7747Z" fill="white"/>
        <path d="M73.2132 14.7747C73.8358 14.7747 74.3629 14.48 74.6327 13.9861H74.7032V14.7H75.5582V8.41626H74.6659V10.8982H74.5995C74.3546 10.4001 73.8316 10.1055 73.2132 10.1055C72.0719 10.1055 71.3373 11.0103 71.3373 12.438C71.3373 13.8699 72.0636 14.7747 73.2132 14.7747ZM73.4664 10.9065C74.2135 10.9065 74.6825 11.5 74.6825 12.4421C74.6825 13.3884 74.2176 13.9736 73.4664 13.9736C72.711 13.9736 72.2586 13.3967 72.2586 12.438C72.2586 11.4875 72.7152 10.9065 73.4664 10.9065Z" fill="white"/>
        <path d="M81.3447 14.7871C82.6645 14.7871 83.4738 13.9031 83.4738 12.438C83.4738 10.9812 82.6604 10.093 81.3447 10.093C80.0249 10.093 79.2114 10.9812 79.2114 12.438C79.2114 13.9031 80.0207 14.7871 81.3447 14.7871ZM81.3447 13.9944C80.5686 13.9944 80.1328 13.4258 80.1328 12.438C80.1328 11.4585 80.5686 10.8857 81.3447 10.8857C82.1166 10.8857 82.5566 11.4585 82.5566 12.438C82.5566 13.4216 82.1166 13.9944 81.3447 13.9944Z" fill="white"/>
        <path d="M84.655 14.7H85.5474V12.0562C85.5474 11.3506 85.9666 10.9106 86.6265 10.9106C87.2864 10.9106 87.6018 11.2717 87.6018 11.998V14.7H88.4941V11.7739C88.4941 10.699 87.938 10.093 86.9294 10.093C86.2488 10.093 85.8005 10.396 85.5806 10.8982H85.5142V10.1802H84.655V14.7Z" fill="white"/>
        <path d="M92.6039 9.05542V10.2009H91.8858V10.9521H92.6039V13.5046C92.6039 14.3762 92.9981 14.7249 93.9901 14.7249C94.1644 14.7249 94.3304 14.7041 94.4757 14.6792V13.9363C94.3512 13.9487 94.2723 13.957 94.1353 13.957C93.6913 13.957 93.4962 13.7495 93.4962 13.2764V10.9521H94.4757V10.2009H93.4962V9.05542H92.6039Z" fill="white"/>
        <path d="M95.6735 14.7H96.5658V12.0603C96.5658 11.3755 96.9726 10.9148 97.703 10.9148C98.3339 10.9148 98.6701 11.28 98.6701 12.0022V14.7H99.5624V11.7822C99.5624 10.7073 98.9689 10.0972 98.006 10.0972C97.3253 10.0972 96.848 10.4001 96.6281 10.9065H96.5575V8.41626H95.6735V14.7Z" fill="white"/>
        <path d="M102.781 10.8525C103.441 10.8525 103.873 11.3132 103.894 12.0229H101.611C101.661 11.3174 102.122 10.8525 102.781 10.8525ZM103.89 13.4797C103.724 13.8325 103.354 14.0276 102.815 14.0276C102.101 14.0276 101.64 13.5254 101.611 12.7327V12.6829H104.803V12.3716C104.803 10.9521 104.043 10.093 102.786 10.093C101.511 10.093 100.702 11.0103 100.702 12.4546C100.702 13.8989 101.495 14.7871 102.79 14.7871C103.823 14.7871 104.545 14.2891 104.749 13.4797H103.89Z" fill="white"/>
        <path d="M24.769 20.3008C24.7907 18.6198 25.6934 17.0292 27.1256 16.1488C26.2221 14.8584 24.7088 14.0403 23.1344 13.9911C21.4552 13.8148 19.8272 14.9959 18.9715 14.9959C18.0992 14.9959 16.7817 14.0086 15.363 14.0378C13.5137 14.0975 11.7898 15.1489 10.8901 16.7656C8.95607 20.1141 10.3987 25.0351 12.2513 27.7417C13.1782 29.0671 14.2615 30.5475 15.6789 30.495C17.066 30.4375 17.584 29.6105 19.2583 29.6105C20.9171 29.6105 21.4031 30.495 22.8493 30.4616C24.3377 30.4375 25.2754 29.1304 26.1698 27.7925C26.8358 26.8481 27.3483 25.8044 27.6882 24.7C25.9391 23.9602 24.771 22.2 24.769 20.3008Z" fill="white"/>
        <path d="M22.0373 12.2111C22.8489 11.2369 23.2487 9.98469 23.1518 8.72046C21.912 8.85068 20.7668 9.44324 19.9443 10.3801C19.14 11.2954 18.7214 12.5255 18.8006 13.7415C20.0408 13.7542 21.2601 13.1777 22.0373 12.2111Z" fill="white"/>
      </svg>
    </a>
  )
}

function GooglePlayButton({ size = 'md', ...props }) {
  const w = size === 'xl' ? 189 : size === 'lg' ? 149 : 135
  const h = size === 'xl' ? 56 : size === 'lg' ? 44 : 40
  return (
    <a
      aria-label="Get it on Google Play"
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="tp-appstore-badge-link"
      {...props}
    >
      <svg width={w} height={h} viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="135" height="40" rx="7" fill="black"/>
        <path d="M68.136 21.7511C65.784 21.7511 63.867 23.5401 63.867 26.0041C63.867 28.4531 65.784 30.2571 68.136 30.2571C70.489 30.2571 72.406 28.4531 72.406 26.0041C72.405 23.5401 70.488 21.7511 68.136 21.7511ZM68.136 28.5831C66.847 28.5831 65.736 27.5201 65.736 26.0051C65.736 24.4741 66.848 23.4271 68.136 23.4271C69.425 23.4271 70.536 24.4741 70.536 26.0051C70.536 27.5191 69.425 28.5831 68.136 28.5831ZM58.822 21.7511C56.47 21.7511 54.553 23.5401 54.553 26.0041C54.553 28.4531 56.47 30.2571 58.822 30.2571C61.175 30.2571 63.092 28.4531 63.092 26.0041C63.092 23.5401 61.175 21.7511 58.822 21.7511ZM58.822 28.5831C57.533 28.5831 56.422 27.5201 56.422 26.0051C56.422 24.4741 57.534 23.4271 58.822 23.4271C60.111 23.4271 61.222 24.4741 61.222 26.0051C61.223 27.5191 60.111 28.5831 58.822 28.5831ZM47.744 23.0571V24.8611H52.062C51.933 25.8761 51.595 26.6171 51.079 27.1321C50.451 27.7601 49.468 28.4531 47.744 28.4531C45.086 28.4531 43.008 26.3101 43.008 23.6521C43.008 20.9941 45.086 18.8511 47.744 18.8511C49.178 18.8511 50.225 19.4151 50.998 20.1401L52.271 18.8671C51.191 17.8361 49.758 17.0471 47.744 17.0471C44.103 17.0471 41.042 20.0111 41.042 23.6521C41.042 27.2931 44.103 30.2571 47.744 30.2571C49.709 30.2571 51.192 29.6121 52.351 28.4041C53.543 27.2121 53.914 25.5361 53.914 24.1831C53.914 23.7651 53.882 23.3781 53.817 23.0561H47.744V23.0571ZM93.052 24.4581C92.698 23.5081 91.618 21.7511 89.411 21.7511C87.22 21.7511 85.399 23.4751 85.399 26.0041C85.399 28.3881 87.204 30.2571 89.62 30.2571C91.569 30.2571 92.697 29.0651 93.165 28.3721L91.715 27.4051C91.232 28.1141 90.571 28.5811 89.62 28.5811C88.67 28.5811 87.993 28.1461 87.558 27.2921L93.245 24.9401L93.052 24.4581ZM87.252 25.8761C87.204 24.2321 88.525 23.3951 89.476 23.3951C90.217 23.3951 90.845 23.7661 91.055 24.2971L87.252 25.8761ZM82.629 30.0001H84.497V17.4991H82.629V30.0001ZM79.567 22.7021H79.503C79.084 22.2021 78.278 21.7511 77.264 21.7511C75.137 21.7511 73.188 23.6201 73.188 26.0211C73.188 28.4051 75.137 30.2581 77.264 30.2581C78.279 30.2581 79.084 29.8071 79.503 29.2921H79.567V29.9041C79.567 31.5311 78.697 32.4011 77.296 32.4011C76.152 32.4011 75.443 31.5801 75.153 30.8871L73.526 31.5641C73.993 32.6911 75.233 34.0771 77.296 34.0771C79.487 34.0771 81.34 32.7881 81.34 29.6461V22.0101H79.568V22.7021H79.567ZM77.425 28.5831C76.136 28.5831 75.057 27.5031 75.057 26.0211C75.057 24.5221 76.136 23.4271 77.425 23.4271C78.697 23.4271 79.696 24.5221 79.696 26.0211C79.696 27.5031 78.697 28.5831 77.425 28.5831ZM101.806 17.4991H97.335V30.0001H99.2V25.2641H101.805C103.873 25.2641 105.907 23.7671 105.907 21.3821C105.907 18.9971 103.874 17.4991 101.806 17.4991ZM101.854 23.5241H99.2V19.2391H101.854C103.249 19.2391 104.041 20.3941 104.041 21.3821C104.041 22.3501 103.249 23.5241 101.854 23.5241ZM113.386 21.7291C112.035 21.7291 110.636 22.3241 110.057 23.6431L111.713 24.3341C112.067 23.6431 112.727 23.4171 113.418 23.4171C114.383 23.4171 115.364 23.9961 115.38 25.0251V25.1541C115.042 24.9611 114.318 24.6721 113.434 24.6721C111.649 24.6721 109.831 25.6531 109.831 27.4861C109.831 29.1591 111.295 30.2361 112.935 30.2361C114.189 30.2361 114.881 29.6731 115.315 29.0131H115.379V29.9781H117.181V25.1851C117.182 22.9671 115.524 21.7291 113.386 21.7291ZM113.16 28.5801C112.55 28.5801 111.697 28.2741 111.697 27.5181C111.697 26.5531 112.759 26.1831 113.676 26.1831C114.495 26.1831 114.882 26.3601 115.38 26.6011C115.235 27.7601 114.238 28.5801 113.16 28.5801ZM123.743 22.0021L121.604 27.4221H121.54L119.32 22.0021H117.31L120.639 29.5771L118.741 33.7911H120.687L125.818 22.0021H123.743ZM106.937 30.0001H108.802V17.4991H106.937V30.0001Z" fill="white"/>
        <path d="M47.418 10.2429C47.418 11.0809 47.1701 11.7479 46.673 12.2459C46.109 12.8379 45.3731 13.1339 44.4691 13.1339C43.6031 13.1339 42.8661 12.8339 42.2611 12.2339C41.6551 11.6329 41.3521 10.8889 41.3521 10.0009C41.3521 9.11194 41.6551 8.36794 42.2611 7.76794C42.8661 7.16694 43.6031 6.86694 44.4691 6.86694C44.8991 6.86694 45.3101 6.95094 45.7001 7.11794C46.0911 7.28594 46.404 7.50894 46.6381 7.78794L46.111 8.31594C45.714 7.84094 45.167 7.60394 44.468 7.60394C43.836 7.60394 43.29 7.82594 42.829 8.26994C42.368 8.71394 42.1381 9.29094 42.1381 9.99994C42.1381 10.7089 42.368 11.2859 42.829 11.7299C43.29 12.1739 43.836 12.3959 44.468 12.3959C45.138 12.3959 45.6971 12.1729 46.1441 11.7259C46.4341 11.4349 46.602 11.0299 46.647 10.5109H44.468V9.78994H47.375C47.405 9.94694 47.418 10.0979 47.418 10.2429Z" fill="white"/>
        <path d="M52.0281 7.737H49.2961V9.639H51.7601V10.36H49.2961V12.262H52.0281V13H48.5251V7H52.0281V7.737Z" fill="white"/>
        <path d="M55.279 13H54.508V7.737H52.832V7H56.955V7.737H55.279V13Z" fill="white"/>
        <path d="M59.938 13V7H60.709V13H59.938Z" fill="white"/>
        <path d="M64.1281 13H63.3572V7.737H61.6812V7H65.8042V7.737H64.1281V13Z" fill="white"/>
        <path d="M73.6089 12.225C73.0189 12.831 72.2859 13.134 71.4089 13.134C70.5319 13.134 69.7989 12.831 69.2099 12.225C68.6199 11.619 68.3259 10.877 68.3259 9.99999C68.3259 9.12299 68.6199 8.38099 69.2099 7.77499C69.7989 7.16899 70.5319 6.86499 71.4089 6.86499C72.2809 6.86499 73.0129 7.16999 73.6049 7.77899C74.1969 8.38799 74.4929 9.12799 74.4929 9.99999C74.4929 10.877 74.1979 11.619 73.6089 12.225ZM69.7789 11.722C70.2229 12.172 70.7659 12.396 71.4089 12.396C72.0519 12.396 72.5959 12.171 73.0389 11.722C73.4829 11.272 73.7059 10.698 73.7059 9.99999C73.7059 9.30199 73.4829 8.72799 73.0389 8.27799C72.5959 7.82799 72.0519 7.60399 71.4089 7.60399C70.7659 7.60399 70.2229 7.82899 69.7789 8.27799C69.3359 8.72799 69.1129 9.30199 69.1129 9.99999C69.1129 10.698 69.3359 11.272 69.7789 11.722Z" fill="white"/>
        <path d="M75.5749 13V7H76.513L79.429 11.667H79.4619L79.429 10.511V7H80.1999V13H79.3949L76.344 8.106H76.3109L76.344 9.262V13H75.5749Z" fill="white"/>
        <g filter="url(#filter0_ii_gp)">
          <path d="M10.4361 7.53803C10.1451 7.84603 9.97314 8.32403 9.97314 8.94303V31.059C9.97314 31.679 10.1451 32.156 10.4361 32.464L10.5101 32.536L22.8991 20.147V20.001V19.855L10.5101 7.46503L10.4361 7.53803Z" fill="url(#paint0_linear_gp)"/>
          <path d="M27.0279 24.278L22.8989 20.147V20.001V19.855L27.0289 15.725L27.1219 15.778L32.0149 18.558C33.4119 19.352 33.4119 20.651 32.0149 21.446L27.1219 24.226L27.0279 24.278Z" fill="url(#paint1_linear_gp)"/>
          <g filter="url(#filter1_i_gp)">
            <path d="M27.122 24.225L22.898 20.001L10.436 32.464C10.896 32.952 11.657 33.012 12.514 32.526L27.122 24.225Z" fill="url(#paint2_linear_gp)"/>
          </g>
          <path d="M27.122 15.777L12.514 7.47701C11.657 6.99001 10.896 7.05101 10.436 7.53901L22.899 20.002L27.122 15.777Z" fill="url(#paint3_linear_gp)"/>
        </g>
        <defs>
          <filter id="filter0_ii_gp" x="9.97314" y="7.14093" width="23.0894" height="25.7207" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="-0.15"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_gp"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="0.15"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="effect1_innerShadow_gp" result="effect2_innerShadow_gp"/>
          </filter>
          <filter id="filter1_i_gp" x="10.436" y="20.001" width="16.686" height="12.8607" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="-0.15"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_gp"/>
          </filter>
          <linearGradient id="paint0_linear_gp" x1="21.8009" y1="8.70903" x2="5.01895" y2="25.491" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00A0FF"/><stop offset="0.0066" stopColor="#00A1FF"/><stop offset="0.2601" stopColor="#00BEFF"/><stop offset="0.5122" stopColor="#00D2FF"/><stop offset="0.7604" stopColor="#00DFFF"/><stop offset="1" stopColor="#00E3FF"/>
          </linearGradient>
          <linearGradient id="paint1_linear_gp" x1="33.8334" y1="20.001" x2="9.63753" y2="20.001" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE000"/><stop offset="0.4087" stopColor="#FFBD00"/><stop offset="0.7754" stopColor="#FFA500"/><stop offset="1" stopColor="#FF9C00"/>
          </linearGradient>
          <linearGradient id="paint2_linear_gp" x1="24.8281" y1="22.2949" x2="2.06964" y2="45.0534" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/>
          </linearGradient>
          <linearGradient id="paint3_linear_gp" x1="7.29743" y1="0.176806" x2="17.4597" y2="10.3391" gradientUnits="userSpaceOnUse">
            <stop stopColor="#32A071"/><stop offset="0.0685" stopColor="#2DA771"/><stop offset="0.4762" stopColor="#15CF74"/><stop offset="0.8009" stopColor="#06E775"/><stop offset="1" stopColor="#00F076"/>
          </linearGradient>
        </defs>
      </svg>
    </a>
  )
}

function HeroDots() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement

    const state = {
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      w: 0,
      h: 0,
      mx: -9999,
      my: -9999,
      raf: 0,
    }

    const SPACING = 14
    const R = 0.7
    const BASE_ALPHA = 0.14
    const RADIUS = 260

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      state.w = rect.width
      state.h = rect.height
      canvas.width = Math.floor(rect.width * state.dpr)
      canvas.height = Math.floor(rect.height * state.dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      state.mx = e.clientX - rect.left
      state.my = e.clientY - rect.top
    }
    const onLeave = () => { state.mx = -9999; state.my = -9999 }

    const draw = () => {
      ctx.clearRect(0, 0, state.w, state.h)
      const { mx, my } = state
      const cols = Math.ceil(state.w / SPACING) + 1
      const rows = Math.ceil(state.h / SPACING) + 1
      const offX = (state.w - (cols - 1) * SPACING) / 2
      const offY = (state.h - (rows - 1) * SPACING) / 2
      const isLight = document.body.classList.contains('light-theme')

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * SPACING
          const y = offY + j * SPACING
          const dx = x - mx
          const dy = y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          const t = Math.max(0, 1 - dist / RADIUS)
          const alpha = BASE_ALPHA + 0.4 * t
          // Dark theme: near-white dots that brighten on hover.
          // Light theme: near-black dots that darken on hover.
          const shade = isLight
            ? Math.round(90 - 90 * t)
            : Math.round(255 - 90 * t)
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, R, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      state.raf = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(state.raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="tp-hero-dots" aria-hidden="true" />
}

const HERO_H1_ROTATORS = {
  en: { prefix: 'Log a hand ', words: ['in three gestures', 'effortlessly', 'in seconds'], suffix: '.' },
  de: { prefix: 'Erfasse eine Hand ', words: ['in drei Gesten', 'mühelos', 'in Sekunden'], suffix: '.' },
  es: { prefix: 'Registra una mano ', words: ['en tres gestos', 'sin esfuerzo', 'en segundos'], suffix: '.' },
  fr: { prefix: 'Enregistre une main ', words: ['en trois gestes', 'sans effort', 'en quelques secondes'], suffix: '.' },
  pl: { prefix: 'Zapisz rozdanie ', words: ['w trzech gestach', 'bez wysiłku', 'w sekundę'], suffix: '.' },
  pt: { prefix: 'Registre uma mão ', words: ['em três gestos', 'sem esforço', 'em segundos'], suffix: '.' },
  ru: { prefix: 'Запиши раздачу ', words: ['за три жеста', 'без усилий', 'за секунды'], suffix: '.' },
  tr: { prefix: 'Bir eli ', words: ['üç hareketle', 'zahmetsizce', 'saniyeler içinde'], suffix: ' kaydet.' },
  uk: { prefix: 'Записуй роздачу ', words: ['в три жести', 'без зусиль', 'за секунди'], suffix: '.' },
}

function TPHero() {
  const { t, locale } = useT()
  const heroRef = useRef(null)
  const phonesRef = useRef(null)
  const rot = HERO_H1_ROTATORS[locale]
  const [rotIdx, setRotIdx] = useState(0)

  useEffect(() => {
    if (!rot) return
    const id = setInterval(() => setRotIdx(i => (i + 1) % rot.words.length), 2200)
    return () => clearInterval(id)
  }, [rot])

  useEffect(() => {
    const phones = phonesRef.current
    if (!phones) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { phones.classList.add('in-view'); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(phones)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const phones = phonesRef.current
    if (!hero || !phones) return
    const centerSlot = phones.querySelector('.tp-hero-phone-slot-center')
    const sideSlots = phones.querySelectorAll('.tp-hero-phone-slot-left, .tp-hero-phone-slot-right')

    let raf = 0
    const update = () => {
      raf = 0
      if (window.innerWidth < 768) {
        if (centerSlot) centerSlot.style.transform = ''
        sideSlots.forEach(el => { el.style.transform = '' })
        return
      }
      const rect = hero.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
      if (centerSlot) centerSlot.style.transform = `translateY(${progress * 40}px)`
      sideSlots.forEach(el => { el.style.transform = `translateY(${progress * 20}px)` })
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={heroRef} className="tp-hero" data-nav-theme="dark">
      <HeroDots />
      <div className="tp-hero-inner">
        <div className="tp-hero-content">
          <h1 className="tp-hero-h1">
            {rot ? (
              <>
                <span className="tp-hero-h1-line">
                  {rot.prefix}
                  <span className="tp-hero-h1-rot">
                    <span key={rotIdx} className="tp-hero-h1-rot-word">{rot.words[rotIdx]}</span>
                  </span>
                  {rot.suffix}
                </span>
                <span className="tp-hero-h1-line">{t('hero.h1')[1]}</span>
              </>
            ) : (
              t('hero.h1').map((line, i) => (
                <span key={i} className="tp-hero-h1-line">{line}</span>
              ))
            )}
          </h1>
          <p className="tp-hero-sub">{t('hero.sub')}</p>
          <div className="tp-hero-ctas">
            <a href={APP_STORE_URL} className="tp-hero-store-btn" aria-label="Download on the App Store" target="_blank" rel="noopener noreferrer">
              <img src="/store_appstore.svg" alt="" className="tp-hero-store-img" />
            </a>
            <a href={PLAY_STORE_URL} className="tp-hero-store-btn" aria-label="Get it on Google Play" target="_blank" rel="noopener noreferrer">
              <img src="/store_googleplay.svg" alt="" className="tp-hero-store-img" />
            </a>
          </div>
        </div>
        <div ref={phonesRef} className="tp-hero-phones" aria-hidden="true">
          <div className="tp-hero-phone-slot tp-hero-phone-slot-left">
            <img src="/hero_phone_left.png" alt="" className="tp-hero-phone tp-hero-phone-left" />
          </div>
          <div className="tp-hero-phone-slot tp-hero-phone-slot-right">
            <img src="/hero_phone_right.png" alt="" className="tp-hero-phone tp-hero-phone-right" />
          </div>
          <div className="tp-hero-phone-slot tp-hero-phone-slot-center">
            <img src="/hero_phone_center.png" alt="" className="tp-hero-phone tp-hero-phone-center" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  COMPARISON                                           */
/* ────────────────────────────────────────────────────── */
function TPComparison() {
  const { t } = useT()
  return (
    <section className="tp-compare-section" id="compare" data-nav-theme="light">
      <div className="tp-compare-inner">
        <div className="tp-compare-header-group">
          <p className="tp-compare-eyebrow">{t('compare.eyebrow')}</p>
          <div className="tp-compare-header">
            <h2 className="tp-compare-title">{t('compare.title')}</h2>
            <p className="tp-compare-subtitle">{t('compare.subtitle')}</p>
          </div>
        </div>

        <div className="tp-compare-grid">
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Zap size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card1.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card1.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Target size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card2.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card2.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Layers size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card3.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card3.desc')}</p>
            </div>
          </div>
          <div className="tp-compare-card">
            <div className="tp-compare-icon"><Mic size={20} /></div>
            <div className="tp-compare-card-text">
              <h3 className="tp-compare-card-title">{t('compare.card4.title')}</h3>
              <p className="tp-compare-card-desc">{t('compare.card4.desc')}</p>
            </div>
            <div className="tp-compare-coming-soon-wrap">
              <span className="tp-compare-coming-soon">Coming Soon</span>
              <span className="tp-compare-venue">Venue Partnership</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ────────────────────────────────────────────────────── */
/*  BG IMAGE SECTION  (scroll-driven tabs, Flighty-style) */
/* ────────────────────────────────────────────────────── */
const darkTabs = []

function TPBgSection() {
  const { t } = useT()
  const tabs = getTabs(t)
  const tabInfo = getTabInfo(t)
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
      <section className="tp-bg-section" id="how-it-works" ref={sectionRef} data-nav-theme="light">
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
/*  Letter-by-letter reveal on scroll                     */
/* ────────────────────────────────────────────────────── */
function LetterReveal({ text, className = '', tag: Tag = 'h2' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`${className} lr-wrap${visible ? ' lr-visible' : ''}`}>
      {text.split('').map((ch, i) => (
        <span key={i} className="lr-char" style={{ transitionDelay: `${i * 40}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HOW IT WORKS  (3-card Figma layout)                   */
/* ────────────────────────────────────────────────────── */
function TPHowItWorks() {
  const { t } = useT()
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  const wrapperRef = useRef(null)
  const stickyRef = useRef(null)
  const autoRef = useRef(null)
  const canvasRef = useRef(null)
  const statsDashedRef = useRef(null)
  const statsColorRef = useRef(null)
  const sessDashedRef = useRef(null)
  const sessColorRef = useRef(null)

  const stages = [{ key: 'hiw' }, { key: 'hiw.stats' }, { key: 'hiw.session' }]
  const navTabs = [
    { src: '/hiw_nav_users.svg', mod: 'users' },
    { src: '/hiw_nav_stats.svg', mod: 'stats' },
    { src: '/hiw_nav_clock.svg', mod: 'clock' },
  ]

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    if (isMobile) {
      // Mobile: no scroll choreography — stages auto-cycle and screens
      // crossfade in place (dashed screens are hidden in CSS). The canvas
      // is scaled so the nav bar (widest element, 690px) spans the viewport.
      const applyScale = () => {
        const canvas = canvasRef.current
        const sticky = stickyRef.current
        if (!canvas || !sticky) return
        const s = Math.min(1, window.innerWidth / 720)
        canvas.style.transform = `scale(${s.toFixed(4)})`
        sticky.style.height = `${Math.round(1050 * s)}px`
      }
      window.addEventListener('resize', applyScale)
      applyScale()
      autoRef.current = setInterval(() => setActive(a => (a + 1) % 3), 4000)
      return () => {
        window.removeEventListener('resize', applyScale)
        clearInterval(autoRef.current)
        autoRef.current = null
      }
    }

    const sticky = stickyRef.current
    if (sticky) sticky.style.height = ''

    // Geometry on the 1512x1050 canvas (frame window measured from hiw2_frame.png alpha,
    // enlarged ~27% with the bottom 25% cropped at the y=910 cut line).
    const WIN_X = 533.79           // settled screen position (window left edge)
    const WIN_R = 533.79 + 444.42  // window right edge — the color/dashed split line
    const PARK = 1032              // parked "next up" slot
    const ENTER = 1420             // where a queued screen fades in from
    const BOT = 217.3              // dashed bottom inset so the crop lands on y=910

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const LERP = reduce ? 1 : 0.16

    // Scroll-linked until halfway (0..0.5 -> 0..40% in), then the target jumps to
    // fully-in and the LERP eases it home. Reversing past 0.5 jumps the target back
    // to 40%-in: a fast eased ~60% slide-out, then scroll-linked the rest of the way.
    const inFrac = (p) => (p >= 0.5 ? 1 : Math.max(0, p) * 0.8)
    const clamp01 = (v) => Math.max(0, Math.min(1, v))

    const pos = { stats: PARK, sess: ENTER, sessOp: 0 }
    let rafId = null
    let running = false
    let activeIdx = 0

    const apply = () => {
      const sd = statsDashedRef.current, sc = statsColorRef.current
      const zd = sessDashedRef.current, zc = sessColorRef.current
      if (sd) {
        sd.style.transform = `translateX(${pos.stats.toFixed(2)}px)`
        sd.style.clipPath = `inset(0 0 ${BOT}px ${Math.max(0, WIN_R - pos.stats).toFixed(2)}px)`
      }
      if (sc) sc.style.transform = `translateX(${(pos.stats - WIN_X).toFixed(2)}px)`
      if (zd) {
        zd.style.transform = `translateX(${pos.sess.toFixed(2)}px)`
        zd.style.clipPath = `inset(0 0 ${BOT}px ${Math.max(0, WIN_R - pos.sess).toFixed(2)}px)`
        zd.style.opacity = pos.sessOp.toFixed(3)
      }
      if (zc) zc.style.transform = `translateX(${(pos.sess - WIN_X).toFixed(2)}px)`
    }

    const tick = () => {
      const rect = wrapper.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      // fi: 0..2 across the two transitions (stats in, then sessions in)
      const fi = total > 0 ? clamp01(-rect.top / total) * 2 : 0

      const tStats = PARK + (WIN_X - PARK) * inFrac(clamp01(fi))
      let tSess, tSessOp
      if (fi < 1) {
        // queued: fade + drift in from the right, driven by the same commit curve
        // as the slide-in — so when stats snaps into the frame, sessions snaps
        // forward into the parking slot (same rest gap) and waits there.
        const q = inFrac(clamp01(fi))
        tSess = ENTER + (PARK - ENTER) * q
        tSessOp = q
      } else {
        tSess = PARK + (WIN_X - PARK) * inFrac(fi - 1)
        tSessOp = 1
      }

      const a = fi < 0.5 ? 0 : fi < 1.5 ? 1 : 2
      if (a !== activeIdx) { activeIdx = a; setActive(a) }

      pos.stats += (tStats - pos.stats) * LERP
      pos.sess += (tSess - pos.sess) * LERP
      pos.sessOp += (tSessOp - pos.sessOp) * LERP
      const needsMore =
        Math.abs(pos.stats - tStats) > 0.05 ||
        Math.abs(pos.sess - tSess) > 0.05 ||
        Math.abs(pos.sessOp - tSessOp) > 0.002
      if (!needsMore) { pos.stats = tStats; pos.sess = tSess; pos.sessOp = tSessOp }
      apply()

      if (needsMore) rafId = requestAnimationFrame(tick)
      else running = false
    }

    const onScroll = () => {
      if (!running) { running = true; rafId = requestAnimationFrame(tick) }
    }

    // Scale the fixed 1512x1050 canvas to fit inside the pinned viewport
    const applyScale = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const s = Math.min(1, window.innerWidth / 1512, window.innerHeight / 1050)
      canvas.style.transform = `scale(${s.toFixed(4)})`
    }
    const onResize = () => { applyScale(); onScroll() }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    applyScale()
    tick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  const jumpTo = (i) => {
    if (autoRef.current) {
      // Mobile auto-cycle: jump straight to the stage and restart the timer
      clearInterval(autoRef.current)
      autoRef.current = setInterval(() => setActive(a => (a + 1) % 3), 4000)
      setActive(i)
      return
    }
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const target = window.scrollY + rect.top + (i / 2) * total
    if (window.__lenis) window.__lenis.scrollTo(target)
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  const textInner = (
    <>
      <p className="hiw-eyebrow">{t('hiw.section.title')}</p>
      <div className="hiw-text-stack">
        {stages.map((s, i) => (
          <div key={s.key} className={`hiw-stage-text${i === active ? ' is-active' : ''}`}>
            <h2 className="hiw-title">
              {t(`${s.key}.title`).map((line, j) => (
                <span key={j} className="hiw-title-line">{line}</span>
              ))}
            </h2>
            <p className="hiw-body">{t(`${s.key}.body`)}</p>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <section className="hiw-section" id="how-it-works" ref={wrapperRef} data-nav-theme="dark">
      {/* Mobile-only copy of the text, outside the scaled canvas so it stays crisp */}
      <div className="hiw-text hiw-text--mobile">{textInner}</div>
      <div className="hiw-sticky" ref={stickyRef}>
        <div className="hiw-text hiw-text--desktop">{textInner}</div>
        <div className="hiw-canvas" ref={canvasRef}>
          {/* Color screens, clipped to the frame's screen window. Stack order = stage order.
              On mobile they crossfade in place via .is-on instead of sliding. */}
          <div className="hiw-clip" aria-hidden="true">
            <img src="/hiw2_opponents_color.png" alt="" className={`hiw-screen${active === 0 ? ' is-on' : ''}`} />
            <img ref={statsColorRef} src="/hiw2_stats_color.png" alt="" className={`hiw-screen${active === 1 ? ' is-on' : ''}`} style={{ transform: 'translateX(498.21px)' }} />
            <img ref={sessColorRef} src="/hiw2_sessions_color.png" alt="" className={`hiw-screen${active === 2 ? ' is-on' : ''}`} style={{ transform: 'translateX(886.21px)' }} />
          </div>

          {/* Fixed iPhone frame (transparent screen window) */}
          <img src="/hiw2_frame.png" alt="" className="hiw-frame" aria-hidden="true" />

          {/* Dashed screens: visible only right of the window edge (clip-path), slide under the bezel */}
          <img ref={statsDashedRef} src="/hiw2_stats_dashed.png" alt="" className="hiw-dashed" style={{ transform: 'translateX(1032px)', clipPath: 'inset(0 0 217.3px 0)' }} aria-hidden="true" />
          <img ref={sessDashedRef} src="/hiw2_sessions_dashed.png" alt="" className="hiw-dashed" style={{ transform: 'translateX(1420px)', clipPath: 'inset(0 0 217.3px 0)', opacity: 0 }} aria-hidden="true" />

          {/* App tab bar (Figma 2081:18100) floating over the phone's cut-off bottom */}
          <div className="hiw-nav">
            <div className="hiw-nav-pill" role="tablist" aria-label="How it works stages">
              <span className="hiw-nav-highlight" data-pos={active} />
              <span className="hiw-nav-item" aria-hidden="true">
                <span className="hiw-nav-ico"><span className="hiw-nav-vec hiw-nav-vec--home"><img src="/hiw_nav_home.svg" alt="" /></span></span>
              </span>
              {navTabs.map((tab, i) => (
                <button
                  key={tab.mod}
                  type="button"
                  className={`hiw-nav-item hiw-nav-btn${i === active ? ' is-active' : ''}`}
                  onClick={() => jumpTo(i)}
                  aria-selected={i === active}
                  role="tab"
                >
                  <span className="hiw-nav-ico"><span className={`hiw-nav-vec hiw-nav-vec--${tab.mod}`}><img src={tab.src} alt="" /></span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  WHAT FINAL TABLE ISN'T                                */
/* ────────────────────────────────────────────────────── */
function TPNotHud() {
  const { t } = useT()
  const gridRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.nh-card')
    const title = titleRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.classList.contains('nh-title') ? 'nh-title--visible' : 'nh-card--visible'
            )
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    cards?.forEach(card => observer.observe(card))
    if (title) observer.observe(title)
    return () => observer.disconnect()
  }, [])

  const cards = [
    { titleKey: 'notHud.item1Title', descKey: 'notHud.item1Desc' },
    { titleKey: 'notHud.item2Title', descKey: 'notHud.item2Desc' },
    { titleKey: 'notHud.item3Title', descKey: 'notHud.item3Desc' },
  ]
  return (
    <section className="nh-section" data-nav-theme="dark">
      <div className="nh-inner">
        <h2 className="nh-title" ref={titleRef}>{t('notHud.title')}</h2>
        <div className="nh-grid" ref={gridRef}>
          {cards.map(({ titleKey, descKey }, i) => (
            <div key={titleKey} className="nh-card" style={{ transitionDelay: `${i * 100}ms` }}>
              <h3 className="nh-card-title">{t(titleKey)}</h3>
              <p className="nh-card-desc">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DISCORD COMMUNITY                                     */
/* ────────────────────────────────────────────────────── */
const DISCORD_URL = 'https://discord.gg/E5HQAWt2g'

function TPCommunity() {
  const { t } = useT()
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('tp-community--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="tp-community-section" data-nav-theme="dark">
      <div className="tp-community-inner">
        <div className="tp-community-left">
          <p className="tp-community-eyebrow">{t('community.eyebrow')}</p>
          <h2 className="tp-community-title">{t('community.title')}</h2>
          <p className="tp-community-sub">{t('community.sub')}</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="tp-community-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            {t('community.cta')}
          </a>
        </div>
        <div className="tp-community-right">
          <div className="tp-community-stats">
            <div className="tp-community-stat">
              <span className="tp-community-stat-value">{t('community.stat1.value')}</span>
              <span className="tp-community-stat-label">{t('community.stat1.label')}</span>
            </div>
            <div className="tp-community-stat-divider" />
            <div className="tp-community-stat">
              <span className="tp-community-stat-value">{t('community.stat2.value')}</span>
              <span className="tp-community-stat-label">{t('community.stat2.label')}</span>
            </div>
            <div className="tp-community-stat-divider" />
            <div className="tp-community-stat">
              <span className="tp-community-stat-value">{t('community.stat3.value')}</span>
              <span className="tp-community-stat-label">{t('community.stat3.label')}</span>
            </div>
          </div>
          <div className="tp-community-card">
            <div className="tp-community-card-header">
              <div className="tp-community-discord-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </div>
              <div className="tp-community-card-meta">
                <p className="tp-community-card-name">Final Table</p>
                <p className="tp-community-card-server">Discord Server</p>
              </div>
              <span className="tp-community-online">Online</span>
            </div>
            <div className="tp-community-messages">
              <div className="tp-community-msg">
                <div className="tp-community-msg-avatar tp-community-msg-avatar-1">M</div>
                <div className="tp-community-msg-bubble">
                  <span className="tp-community-msg-head">
                    <span className="tp-community-msg-user">{t('community.msg1.user')}</span>
                    <span className="tp-community-msg-time">9:12 PM</span>
                  </span>
                  <span className="tp-community-msg-text">{t('community.msg1.text')}</span>
                </div>
              </div>
              <div className="tp-community-msg">
                <div className="tp-community-msg-avatar tp-community-msg-avatar-2">FT</div>
                <div className="tp-community-msg-bubble">
                  <span className="tp-community-msg-head">
                    <span className="tp-community-msg-user">{t('community.msg2.user')}</span>
                    <span className="tp-community-msg-time">9:14 PM</span>
                  </span>
                  <span className="tp-community-msg-text">{t('community.msg2.text')}</span>
                </div>
              </div>
              <div className="tp-community-msg">
                <div className="tp-community-msg-avatar tp-community-msg-avatar-3">M</div>
                <div className="tp-community-msg-bubble">
                  <span className="tp-community-msg-head">
                    <span className="tp-community-msg-user">{t('community.msg3.user')}</span>
                    <span className="tp-community-msg-time">9:17 PM</span>
                  </span>
                  <span className="tp-community-msg-text">{t('community.msg3.text')}</span>
                </div>
              </div>
              <div className="tp-community-msg tp-community-typing" aria-hidden="true">
                <div className="tp-community-msg-avatar tp-community-msg-avatar-4">YOU</div>
                <div className="tp-community-msg-bubble tp-community-typing-bubble">
                  <span className="tp-community-typing-dot" />
                  <span className="tp-community-typing-dot" />
                  <span className="tp-community-typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BUCKLE UP — features preview with scroll-linked phone */
/* ────────────────────────────────────────────────────── */
function TPBuckleUp() {
  const { t } = useT()
  const { theme } = useTheme()
  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const fillRefs = useRef([])

  const features = [
    { key: 'buckle.stats', image: theme === 'light' ? '/buckle_stats_light.png' : '/buckle_stats.png' },
    { key: 'buckle.bankroll', image: theme === 'light' ? '/buckle_bankroll_light.png' : '/buckle_bankroll.png' },
    { key: 'buckle.ai', image: theme === 'light' ? '/buckle_ai_light.png' : '/buckle_ai.png' },
  ]

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('bu-title--visible'); obs.disconnect() }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Scroll-driven line fills. We keep `active` in React (so the correct
  // phone image + active title styles apply), but drive the vertical
  // fill of each feature line directly via refs with LERP smoothing so
  // it glides instead of snapping frame-to-frame with the scroll.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const LERP = reduce ? 1 : 0.12
    const N = features.length
    let raf = 0
    let running = false
    let current = 0
    let target = 0
    let lastIdx = 0

    const applyFills = () => {
      for (let i = 0; i < N; i++) {
        const el = fillRefs.current[i]
        if (!el) continue
        const p = Math.max(0, Math.min(1, current * N - i))
        el.style.height = (p * 100).toFixed(2) + '%'
      }
    }

    const computeTarget = () => {
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollable = rect.height - vh
      target = scrollable <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / scrollable))
    }

    const tick = () => {
      current += (target - current) * LERP
      if (Math.abs(target - current) < 0.0004) current = target
      applyFills()
      const idx = Math.min(N - 1, Math.floor(current * N))
      if (idx !== lastIdx) { lastIdx = idx; setActive(idx) }
      if (Math.abs(target - current) > 0.0004) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const start = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const onScroll = () => { computeTarget(); start() }
    computeTarget()
    current = target
    applyFills()
    setActive(Math.min(N - 1, Math.floor(current * N)))

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [features.length])

  return (
    <section ref={sectionRef} id="features" className="bu-section" data-nav-theme="dark">
      <div className="bu-inner">
        <div className="bu-left">
          <div className="bu-header">
            <h2 className="bu-title" ref={titleRef}>
              {t('buckle.title').map((line, j) => (
                <span key={j} className="bu-title-line">{line}</span>
              ))}
            </h2>
            <p className="bu-subtitle">{t('buckle.subtitle')}</p>
          </div>
          <div className="bu-features">
            {features.map((f, i) => {
              return (
                <div
                  key={i}
                  className={`bu-feature ${i === active ? 'is-active' : ''}`}
                >
                  <div className="bu-feature-line" aria-hidden="true">
                    <div
                      className="bu-feature-line-fill"
                      ref={el => { fillRefs.current[i] = el }}
                    />
                  </div>
                  <div className="bu-feature-body">
                    <h3 className="bu-feature-title">{t(`${f.key}.title`)}</h3>
                    <div className="bu-feature-desc-wrap">
                      <p className="bu-feature-desc">{t(`${f.key}.desc`)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <aside className="bu-visual">
          {features.map((f, i) => (
            <img
              key={i}
              src={f.image}
              alt=""
              className="bu-handphone"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
        </aside>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BUILT FOR THE LIVE GAME — 2x2 feature grid            */
/* ────────────────────────────────────────────────────── */
const TG_HAND_PATH = 'M224,104v50.93c0,46.2-36.85,84.55-83,85.06A83.71,83.71,0,0,1,80.6,215.4C58.79,192.33,34.15,136,34.15,136a16,16,0,0,1,6.53-22.23c7.66-4,17.1-.84,21.4,6.62l21,36.44a6.09,6.09,0,0,0,6,3.09l.12,0A8.19,8.19,0,0,0,96,151.74V32a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V104a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25V88a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V112a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25v-7.28c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,224,104Z'

function SessionHandAnim() {
  const hands = [
    { label: 'Hand #482', win: true,  amount: '$18' },
    { label: 'Hand #481', win: false, amount: '$10' },
    { label: 'Hand #480', win: true,  amount: '$34' },
    { label: 'Hand #479', win: false, amount: '$6'  },
    { label: 'Hand #478', win: true,  amount: '$44' },
  ]
  const OPEN_STAGGER = 140
  const CLOSE_STAGGER = 120

  const [detailed, setDetailed] = useState(false)
  const [openCount, setOpenCount] = useState(0)

  useEffect(() => {
    let alive = true
    const timeouts = []
    const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timeouts.push(t) }

    const run = () => {
      // Quick mode hold
      later(() => {
        setDetailed(true)
        // stagger-open each hand
        hands.forEach((_, i) => later(() => setOpenCount(i + 1), 350 + i * OPEN_STAGGER))
        const expandDone = 350 + (hands.length - 1) * OPEN_STAGGER + 500

        later(() => {
          // stagger-close from last to first
          hands.forEach((_, i) => later(() => setOpenCount(hands.length - 1 - i), i * CLOSE_STAGGER))
          const collapseDone = (hands.length - 1) * CLOSE_STAGGER + 500
          later(() => {
            setDetailed(false)
            setOpenCount(0)
            later(run, 400)
          }, collapseDone)
        }, expandDone + 2600)
      }, 2200)
    }
    run()

    return () => { alive = false; timeouts.forEach(clearTimeout) }
  }, [])

  return (
    <div className={`sh-wrap${detailed ? ' sh-detailed' : ''}`} aria-hidden="true">
      <div className="sh-toggle">
        <div className="sh-toggle-slider" />
        <div className="sh-toggle-opt sh-toggle-quick">Quick</div>
        <div className="sh-toggle-opt sh-toggle-det">Hand-by-hand</div>
      </div>
      <div className="sh-anchor sh-top">
        <span className="sh-label">Buy-in</span>
        <span className="sh-amount">$200</span>
      </div>
      <div className="sh-quicknet">Net +$80</div>
      <div className="sh-list">
        {hands.map((h, i) => (
          <div key={i} className={`sh-hand${i < openCount ? ' sh-open' : ''}`}>
            <div className="sh-hand-inner">
              <div className="sh-hand-row">
                <span className="sh-chip">{h.label}</span>
                <span className="sh-value">
                  <span className="sh-arrow">{h.win ? '▲' : '▼'}</span>
                  {h.amount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="sh-anchor sh-bottom">
        <span className="sh-label">Cash-out</span>
        <span className="sh-amount">$280</span>
      </div>
    </div>
  )
}

function ThreeGestureAnim() {
  const phases = ['tap', 'drag', 'swipe']
  const durations = [2200, 2600, 2400]
  const labels = [
    ['Tap', 'Check / Call'],
    ['Press & Drag Up', 'Bet / Raise'],
    ['Swipe Out', 'Fold'],
  ]
  const [idx, setIdx] = useState(0)
  const [chip, setChip] = useState(20)

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % phases.length), durations[idx])
    return () => clearTimeout(t)
  }, [idx])

  useEffect(() => {
    if (phases[idx] !== 'drag') { setChip(20); return }
    let raf = 0
    const t0 = performance.now()
    const startT = 520, endT = 1430
    const tick = (now) => {
      const t = now - t0
      if (t < startT) { setChip(20); raf = requestAnimationFrame(tick); return }
      const p = Math.min((t - startT) / (endT - startT), 1)
      const eased = 1 - Math.pow(1 - p, 2)
      setChip(Math.round(20 + 40 * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [idx])

  const Hand = () => (
    <div className="tg-hand">
      <svg viewBox="0 0 256 256"><path d={TG_HAND_PATH} /></svg>
    </div>
  )

  return (
    <div className="tg-wrap" data-phase={phases[idx]} aria-hidden="true">
      <div className="tg-stage">
        <div className="tg-group tg-tap">
          <div className="tg-ripple" />
          <Hand />
        </div>
        <div className="tg-group tg-drag">
          <div className="tg-chip">${chip}</div>
          <Hand />
        </div>
        <div className="tg-group tg-swipe">
          <div className="tg-pcard" />
          <Hand />
        </div>
      </div>
      <div className="tg-copy" key={idx}>
        <div className="tg-title">{labels[idx][0]}</div>
        <div className="tg-sub">{labels[idx][1]}</div>
      </div>
      <div className="tg-dots">
        {phases.map((p, i) => (
          <span key={p} className={`tg-dot${i === idx ? ' tg-dot-on' : ''}`} />
        ))}
      </div>
    </div>
  )
}

function GestureLoggingAnim() {
  return (
    <div className="gla-fit" aria-hidden="true">
      <div className="gla-wrap">
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <symbol id="gla-hand" viewBox="0 0 64 64">
              <circle cx="32" cy="58" r="7" fill="currentColor" />
            </symbol>
          </defs>
        </svg>
        <div className="gla-index">FIG. 01 — TOUCH INPUT</div>
        <div className="gla-dim">
          <div className="gla-tick gla-tick-top" />
          <div className="gla-shaft" />
          <div className="gla-tick gla-tick-bottom" />
          <div className="gla-dim-label">240 × 480</div>
        </div>
        <div className="gla-reg gla-reg-tl" />
        <div className="gla-reg gla-reg-tr" />
        <div className="gla-reg gla-reg-bl" />
        <div className="gla-reg gla-reg-br" />
        <div className="gla-phone">
        <div className="gla-rmark gla-rmark-tl" />
        <div className="gla-rmark gla-rmark-tr" />
        <div className="gla-rmark gla-rmark-bl" />
        <div className="gla-rmark gla-rmark-br" />
        <div className="gla-guide-h" />
        <div className="gla-guide-v" />
        <div className="gla-cam" />
        <div className="gla-speaker" />
        <div className="gla-content">
          <div className="gla-stage">
            <svg className="gla-gfx" viewBox="0 0 168 168">
              <circle className="gla-tap-ring" cx="84" cy="126" r="20" fill="none" stroke="#A6A6F2" strokeWidth="1.5" />
              <line className="gla-slide-track" x1="84" y1="96" x2="84" y2="156" />
              <path className="gla-swipe-trail" d="M 32 126 L 152 126" />
              <g className="gla-hand">
                <use className="gla-cursor" href="#gla-hand" width="64" height="64" />
              </g>
            </svg>
          </div>
          <div className="gla-label-wrap">
            <div className="gla-label gla-label-tap">Tap</div>
            <div className="gla-label gla-label-slide">Slide</div>
            <div className="gla-label gla-label-swipe">Swipe</div>
          </div>
            <div className="gla-dots">
              <div className="gla-dot gla-dot-1" />
              <div className="gla-dot gla-dot-2" />
              <div className="gla-dot gla-dot-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OpponentRadarAnim() {
  const nodes = [
    { angle: 0, label: 'Agg% 24%' },
    { angle: 60, label: 'PFR 18%' },
    { angle: 120, label: 'Aggressive' },
    { angle: 180, label: '3-Bet 9%' },
    { angle: 240, label: 'C-Bet 71%' },
    { angle: 300, label: 'Tight-Passive' },
  ]
  return (
    <div className="rr-wrap" aria-hidden="true">
      <div className="rr-radar">
        <div className="rr-ring rr-r1" />
        <div className="rr-ring rr-r2" />
        <div className="rr-ring rr-r3" />
        <div className="rr-sweep-wrap"><div className="rr-sweep" /></div>
        <div className="rr-center-dot" />
        {nodes.map((n, i) => (
          <div key={i} className={`rr-node rr-node-${i}`} style={{ '--rr-angle': `${n.angle}deg` }}>
            <div className="rr-node-content">
              <div className="rr-node-dot" />
              <div className="rr-node-tag">{n.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DealerBroadcastAnim() {
  const CENTER = { x: 140, y: 95 }
  const seats = [
    { x: 92,  y: 167 },
    { x: 19,  y: 127 },
    { x: 5,   y: 66  },
    { x: 50,  y: 11  },
    { x: 140, y: 5   },
    { x: 230, y: 11  },
    { x: 275, y: 66  },
    { x: 261, y: 133 },
    { x: 188, y: 173 },
  ]
  const script = [
    { seat: 0, action: 'Bet $20',   amount: 20 },
    { seat: 1, action: 'Call $20',  amount: 20 },
    { seat: 2, action: 'Fold',      fold: true },
    { seat: 3, action: 'Fold',      fold: true },
    { seat: 4, action: 'Raise $60', amount: 60 },
    { seat: 5, action: 'Fold',      fold: true },
    { seat: 6, action: 'Call $60',  amount: 60 },
    { seat: 7, action: 'Fold',      fold: true },
    { seat: 8, action: 'Fold',      fold: true },
    { seat: 0, action: 'Call $60',  amount: 60 },
    { seat: 1, action: 'Fold',      fold: true },
  ]
  const STEP = 1500

  const chipPos = (i) => {
    const s = seats[i]
    const t = 0.28
    return { x: s.x + (CENTER.x - s.x) * t, y: s.y + (CENTER.y - s.y) * t }
  }

  const [caption, setCaption] = useState('')
  const [showCaption, setShowCaption] = useState(false)
  const [flash, setFlash] = useState(false)
  const [active, setActive] = useState(-1)
  const [seatStates, setSeatStates] = useState({}) // { [i]: 'inhand' | 'folded' }
  const [chips, setChips] = useState({}) // { [seat]: { amount, phase: 'in' | 'bump' | 'collect', bumpKey } }

  useEffect(() => {
    let alive = true
    const timeouts = []
    const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timeouts.push(t); return t }

    const announce = (text) => {
      setCaption(text)
      setShowCaption(true)
      setFlash(true)
      later(() => setFlash(false), 500)
      later(() => setShowCaption(false), STEP - 250)
    }

    const playStep = (i) => {
      if (!alive) return
      if (i >= script.length) return endHand()
      const step = script[i]
      setActive(step.seat)
      announce(step.action)

      later(() => {
        if (step.fold) {
          setSeatStates((s) => ({ ...s, [step.seat]: 'folded' }))
        } else if (step.amount) {
          setSeatStates((s) => ({ ...s, [step.seat]: 'inhand' }))
          setChips((c) => {
            const existing = c[step.seat]
            if (existing) {
              return { ...c, [step.seat]: { amount: step.amount, phase: 'in', bumpKey: (existing.bumpKey || 0) + 1 } }
            }
            return { ...c, [step.seat]: { amount: step.amount, phase: 'in', bumpKey: 0 } }
          })
        }
      }, 420)

      later(() => {
        setActive(-1)
        playStep(i + 1)
      }, STEP)
    }

    const endHand = () => {
      announce('Next Hand')
      setChips((c) => {
        const next = { ...c }
        Object.keys(next).forEach((k) => { next[k] = { ...next[k], phase: 'collect' } })
        return next
      })
      later(() => {
        setChips({})
        setSeatStates({})
      }, 900)
      later(() => playStep(0), 2400)
    }

    const start = later(() => playStep(0), 700)

    return () => {
      alive = false
      timeouts.forEach(clearTimeout)
      clearTimeout(start)
    }
  }, [])

  return (
    <div className="db-wrap" aria-hidden="true">
      <div className="db-vis">
        <svg className="db-table" viewBox="0 0 280 190">
          <path d="M 83,5 L 197,5 Q 275,5 275,95 Q 275,185 197,185 L 160,185 A 20,20 0 0 0 120,185 L 83,185 Q 5,185 5,95 Q 5,5 83,5 Z" />
        </svg>
        {seats.map((s, i) => {
          const state = seatStates[i]
          const cls = [
            'db-seat',
            active === i ? 'db-active' : '',
            state === 'inhand' ? 'db-inhand' : '',
            state === 'folded' ? 'db-folded' : '',
          ].filter(Boolean).join(' ')
          return <div key={i} className={cls} style={{ left: `${s.x}px`, top: `${s.y}px` }} />
        })}
        {Object.entries(chips).map(([seat, chip]) => {
          const pos = chip.phase === 'collect' ? CENTER : chipPos(Number(seat))
          const cls = [
            'db-chip',
            chip.phase === 'in' ? 'db-in' : '',
            chip.phase === 'collect' ? 'db-collect' : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              key={`${seat}-${chip.bumpKey}`}
              className={cls}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            >{chip.amount}</div>
          )
        })}
        <div className={`db-mic${flash ? ' db-flash' : ''}`}>
          <div className="db-wave db-wave-1" />
          <div className="db-wave db-wave-2" />
          <div className="db-wave db-wave-3" />
          <svg className="db-mic-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
      </div>
      <div className={`db-caption${showCaption ? ' db-show' : ''}`}>{caption}</div>
    </div>
  )
}

function TPBuiltForLive() {
  const { t } = useT()
  const sectionRef = useRef(null)
  const topCards = [
    { titleKey: 'live.gesture.title', descKey: 'live.gesture.desc', media: <ThreeGestureAnim /> },
    { titleKey: 'live.reads.title', descKey: 'live.reads.desc', media: <OpponentRadarAnim /> },
    { titleKey: 'live.session.title', descKey: 'live.session.desc', media: <SessionHandAnim /> },
  ]

  // Start the hover beam at the pointer position: on pointerenter, compute
  // the angle from card center to the pointer and set a negative
  // animation-delay so the rotating conic gradient begins there. The beam
  // core sits ~86% around the gradient (≈310°) from the conic `from` angle,
  // so we back that off to make the bright center land at the pointer.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cards = section.querySelectorAll('.bfl-card')
    const DURATION_S = 2.8
    const BEAM_CORE_DEG = 310
    const onEnter = (e) => {
      const card = e.currentTarget
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      // Conic-gradient angles: 0° = up, increasing clockwise
      const mouseDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360
      const fromDeg = ((mouseDeg - BEAM_CORE_DEG) % 360 + 360) % 360
      const delay = -(fromDeg / 360) * DURATION_S
      card.style.setProperty('--bfl-delay', `${delay.toFixed(3)}s`)
    }
    cards.forEach(c => c.addEventListener('pointerenter', onEnter))
    return () => cards.forEach(c => c.removeEventListener('pointerenter', onEnter))
  }, [])

  return (
    <section ref={sectionRef} className="bfl-section" data-nav-theme="dark">
      <div className="bfl-inner">
        <div className="bfl-row bfl-row-top">
          <div className="bfl-card bfl-card-intro">
            <div className="bfl-intro-header">
              <p className="bfl-intro-eyebrow">{t('live.eyebrow')}</p>
              <p className="bfl-intro-title">
                {t('live.title').map((line, j) => (
                  <span key={j} className="bfl-intro-title-line">{line}</span>
                ))}
              </p>
            </div>
          </div>
          {topCards.map(({ titleKey, descKey, media }, i) => (
            <div key={i} className="bfl-card bfl-card-feature">
              <p className="bfl-feature-title">{t(titleKey)}</p>
              <div className="bfl-feature-media" aria-hidden="true">{media}</div>
              <p className="bfl-feature-desc">{t(descKey)}</p>
            </div>
          ))}
        </div>

        <div className="bfl-row bfl-row-bottom">
          <div className="bfl-card bfl-card-image">
            <DealerBroadcastAnim />
          </div>
          <div className="bfl-bottom-right">
            <div className="bfl-card bfl-card-dealer">
              <div className="bfl-dealer-copy">
                <p className="bfl-feature-title">{t('live.dealer.title')}</p>
                <p className="bfl-feature-desc">{t('live.dealer.desc')}</p>
              </div>
              <div className="bfl-dealer-badge">
                <span className="bfl-dealer-pill">{t('live.dealer.badge')}</span>
                <span className="bfl-dealer-tag">{t('live.dealer.tag')}</span>
              </div>
            </div>
            <div className="bfl-card bfl-card-download">
              <p className="bfl-download-label">{t('live.download')}</p>
              <div className="bfl-download-badges">
                <a href={APP_STORE_URL} className="bfl-store-btn" aria-label="Download on the App Store" target="_blank" rel="noopener noreferrer">
                  <img src="/store_appstore.svg" alt="" className="bfl-store-img" />
                </a>
                <a href={PLAY_STORE_URL} className="bfl-store-btn" aria-label="Get it on Google Play" target="_blank" rel="noopener noreferrer">
                  <img src="/store_googleplay.svg" alt="" className="bfl-store-img" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  DISCORD — JOIN THE COMMUNITY                          */
/* ────────────────────────────────────────────────────── */
function TPBottomHero() {
  const { t } = useT()
  const titleRef = useRef(null)

  const titleLines = t('bh.title')

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const N = titleLines.length
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - rect.top) / (vh * 0.9)
      const total = Math.min(1, Math.max(0, progress))
      for (let i = 0; i < N; i++) {
        const p = Math.min(1, Math.max(0, total * N - i))
        el.style.setProperty(`--scrub-${i}`, (p * 100).toFixed(1) + '%')
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [titleLines.length])

  return (
    <section className="bh-section" data-nav-theme="dark">
      <div className="bh-inner">
        <h2 className="bh-title bh-title--scrub" ref={titleRef}>
          {titleLines.map((line, i) => (
            <span key={i} className="bh-title-line">
              {line}
              <span className="bh-title-line-fill" aria-hidden="true">{line}</span>
            </span>
          ))}
        </h2>
        <img src="/bottom_hero_phone.png" alt="" className="bh-phone" aria-hidden="true" />
        <div className="bh-right">
          <p className="bh-body">
            {t('bh.body').map((line, i) => (
              <span key={i} className="bh-body-line">{line}</span>
            ))}
          </p>
          <div className="bh-badges">
            <a href={APP_STORE_URL} className="bh-store-btn" aria-label="Download on the App Store" target="_blank" rel="noopener noreferrer">
              <img src="/store_appstore.svg" alt="" className="bh-store-img" />
            </a>
            <a href={PLAY_STORE_URL} className="bh-store-btn" aria-label="Get it on Google Play" target="_blank" rel="noopener noreferrer">
              <img src="/store_googleplay.svg" alt="" className="bh-store-img" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function TPDiscord() {
  const { t } = useT()

  return (
    <section className="dc-section" data-nav-theme="dark">
      <div className="dc-card">
        <div className="dc-overlay" aria-hidden="true" />
        <div className="dc-copy">
          <div className="dc-copy-text">
            <p className="dc-eyebrow">{t('discord.eyebrow')}</p>
            <div className="dc-copy-group">
              <h2 className="dc-title">{t('discord.title')}</h2>
              <p className="dc-body">{t('discord.body')}</p>
            </div>
          </div>
          <a
            className="dc-cta"
            href="https://discord.gg/finaltable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{t('discord.cta')}</span>
            <img src="/discord.svg" alt="" className="dc-cta-icon" aria-hidden="true" />
          </a>
        </div>
        <div className="dc-preview" aria-hidden="true" />
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  BOTTOM CTA                                            */
/* ────────────────────────────────────────────────────── */
function TPBottomCTA() {
  const { t } = useT()

  return (
    <section className="bc-section" data-nav-theme="light">
      <div className="bc-inner">
        <div className="bc-left">
          <a href="#" className="bc-logo">
            <img src="/logo.png" alt="Final Table" className="bc-logo-img" />
          </a>
          <div className="bc-content">
            <div className="bc-headline-group">
              <h2 className="bc-h2">{t('bottomCta.title')}</h2>
              <p className="bc-sub">{t('bottomCta.sub')}</p>
            </div>
            <div className="bc-form-group">
              <div className="tp-appstore-cta">
                <AppStoreButton />
                <GooglePlayButton />
              </div>
              <div className="tp-hero-proof-row">
                <div className="tp-hero-avatars">
                  <img src="/avatar_1.png" alt="" className="tp-hero-avatar" />
                  <img src="/avatar_2.png" alt="" className="tp-hero-avatar" />
                  <img src="/avatar_3.png" alt="" className="tp-hero-avatar" />
                  <img src="/avatar_4.png" alt="" className="tp-hero-avatar" />
                  <img src="/avatar_5.png" alt="" className="tp-hero-avatar" />
                </div>
                <p className="tp-hero-proof-text">
                  <strong>{getPlayerCount()}+ players</strong>{' '}
                  <span>already signed up</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bc-right" aria-hidden="true">
          <img src="/cta_cluster.png" alt="" className="bc-phone-img" />
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FOOTER                                                */
/* ────────────────────────────────────────────────────── */
function FooterHalftone() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const CELL = 8
    const MAX_R = 3.2
    const CURSOR_RADIUS = 140
    const CURSOR_BOOST = 1.6
    // Bayer 4x4 ordered-dither matrix, normalized to 0..1
    const BAYER = [
      [ 0, 8, 2,10],
      [12, 4,14, 6],
      [ 3,11, 1, 9],
      [15, 7,13, 5],
    ].map(row => row.map(v => v / 16))

    let w = 0, h = 0
    let raf = 0
    let last = performance.now()
    const mouse = { x: -9999, y: -9999 }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const heart = new Image()
    heart.crossOrigin = 'anonymous'
    heart.src = '/footer_heart.svg'

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d', { willReadFrequently: true })
    let px = null // ImageData buffer of the offscreen heart art

    const rebuildSample = () => {
      if (!heart.complete || heart.naturalWidth === 0 || w === 0 || h === 0) return
      off.width = Math.max(1, Math.floor(w))
      off.height = Math.max(1, Math.floor(h))
      offCtx.clearRect(0, 0, off.width, off.height)
      offCtx.drawImage(heart, 0, 0, off.width, off.height)
      try {
        px = offCtx.getImageData(0, 0, off.width, off.height).data
      } catch (e) {
        px = null
      }
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rebuildSample()
    }

    const draw = () => {
      // Card colour bg — full clear each frame (no trail for halftone)
      ctx.fillStyle = 'rgba(31, 31, 31, 1)'
      ctx.fillRect(0, 0, w, h)

      if (!px) {
        if (!reduce) raf = requestAnimationFrame(draw)
        return
      }

      const cols = Math.ceil(w / CELL)
      const rows = Math.ceil(h / CELL)
      const wi = off.width

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * CELL + CELL / 2
          const y = cy * CELL + CELL / 2
          if (x >= w || y >= h) continue

          const sx = Math.min(wi - 1, Math.floor(x))
          const sy = Math.min(off.height - 1, Math.floor(y))
          const idx = (sy * wi + sx) * 4
          const r = px[idx], g = px[idx + 1], b = px[idx + 2]

          // Heart if red-dominant; else treat pixel as background (dim white cells)
          const isHeart = r > 120 && g < 100 && b < 100
          // Luminance normalized 0..1
          const lum = isHeart
            ? Math.min(1, r / 255) // heart pixels: intensity of red
            : 0.4 // baseline for bg cells (below Bayer threshold so most cells go dim/small)

          // Cursor influence
          const dx = x - mouse.x
          const dy = y - mouse.y
          const cursorT = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / CURSOR_RADIUS)

          // Bayer threshold check — creates the ordered-dither posterization
          const threshold = BAYER[cy & 3][cx & 3]
          const effectiveLum = Math.min(1, lum + cursorT * 0.4)
          if (effectiveLum < threshold * 0.95) continue

          const radius = MAX_R * (effectiveLum) * (1 + cursorT * (CURSOR_BOOST - 1))
          if (radius < 0.4) continue

          if (cursorT > 0.02) {
            // Blend toward hot white near cursor
            const baseR = isHeart ? 255 : 220
            const baseG = isHeart ? 72 : 220
            const baseB = isHeart ? 63 : 220
            const rr = Math.round(baseR + (255 - baseR) * cursorT)
            const gg = Math.round(baseG + (255 - baseG) * cursorT)
            const bb = Math.round(baseB + (255 - baseB) * cursorT)
            const a = Math.min(1, (isHeart ? 0.95 : 0.5) + cursorT * 0.4)
            ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${a})`
          } else if (isHeart) {
            ctx.fillStyle = 'rgba(255, 72, 63, 0.95)'
          } else {
            ctx.fillStyle = 'rgba(220, 220, 220, 0.35)'
          }

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const kick = () => {
      last = performance.now()
      if (!raf) raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    if (heart.complete && heart.naturalWidth > 0) {
      rebuildSample()
      kick()
    } else {
      heart.onload = () => {
        rebuildSample()
        kick()
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="mf-hero-halftone" aria-hidden="true" />
}

function FooterMatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const FONT_SIZE = 14
    const COL_WIDTH = 14
    const TRAIL_FADE = 'rgba(31, 31, 31, 0.14)'
    const CARD_FILL = 'rgba(31, 31, 31, 1)'
    const REPEL_RADIUS = 100
    const REPEL_STRENGTH = 14

    let w = 0, h = 0
    let raf = 0
    let last = performance.now()
    let columns = []
    let mask = null // Uint8Array of size w*h, 1 inside heart
    const mouse = { x: -9999, y: -9999 }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const heart = new Image()
    heart.crossOrigin = 'anonymous'
    heart.src = '/footer_heart.svg'

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d', { willReadFrequently: true })

    const buildMask = () => {
      if (!heart.complete || heart.naturalWidth === 0 || w === 0 || h === 0) return
      const wi = Math.max(1, Math.floor(w))
      const hi = Math.max(1, Math.floor(h))
      off.width = wi
      off.height = hi
      offCtx.clearRect(0, 0, wi, hi)
      offCtx.drawImage(heart, 0, 0, wi, hi)
      let px
      try {
        px = offCtx.getImageData(0, 0, wi, hi).data
      } catch (e) {
        return
      }
      mask = new Uint8Array(wi * hi)
      for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
        // Red-dominant → inside heart silhouette
        mask[i] = (px[p] > 120 && px[p + 1] < 100 && px[p + 2] < 100) ? 1 : 0
      }
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Paint solid card colour once so the trail fade has something to darken toward.
      ctx.fillStyle = CARD_FILL
      ctx.fillRect(0, 0, w, h)

      const nCols = Math.ceil(w / COL_WIDTH)
      columns = new Array(nCols).fill(0).map(() => ({
        y: -Math.random() * h,
        speed: 40 + Math.random() * 60,
      }))
      buildMask()
    }

    const inHeart = (x, y) => {
      if (!mask) return false
      const wi = off.width
      const hi = off.height
      const ix = Math.max(0, Math.min(wi - 1, Math.round(x)))
      const iy = Math.max(0, Math.min(hi - 1, Math.round(y)))
      return mask[iy * wi + ix] === 1
    }

    const draw = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now

      // Trail fade toward card colour
      ctx.fillStyle = TRAIL_FADE
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${FONT_SIZE}px "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]
        col.y += col.speed * dt

        if (col.y > h + FONT_SIZE) {
          if (Math.random() < 0.4) {
            col.y = -FONT_SIZE
            col.speed = 40 + Math.random() * 60
          }
          continue
        }
        if (col.y < 0) continue

        const baseX = i * COL_WIDTH + COL_WIDTH / 2
        let x = baseX
        let y = col.y

        // Cursor repulsion
        let hotT = 0
        const dx = x - mouse.x
        const dy = y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_RADIUS) {
          hotT = 1 - dist / REPEL_RADIUS
          const inv = dist > 0.001 ? 1 / dist : 0
          x += dx * inv * REPEL_STRENGTH * hotT
          y += dy * inv * REPEL_STRENGTH * hotT
        }

        const char = Math.random() < 0.5 ? '0' : '1'

        // Colour selection
        if (hotT > 0) {
          const isHeart = inHeart(x, y)
          const baseR = isHeart ? 255 : 220
          const baseG = isHeart ? 72 : 220
          const baseB = isHeart ? 63 : 220
          const baseA = isHeart ? 0.9 : 0.55
          const r = Math.round(baseR + (255 - baseR) * hotT)
          const g = Math.round(baseG + (255 - baseG) * hotT)
          const b = Math.round(baseB + (255 - baseB) * hotT)
          const a = baseA + (1 - baseA) * hotT
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
        } else if (inHeart(x, y)) {
          ctx.fillStyle = 'rgba(255, 72, 63, 0.9)'
        } else {
          ctx.fillStyle = 'rgba(220, 220, 220, 0.55)'
        }

        ctx.fillText(char, x, y)
      }

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const kick = () => {
      last = performance.now()
      if (!raf) raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    if (heart.complete && heart.naturalWidth > 0) {
      buildMask()
      kick()
    } else {
      heart.onload = () => {
        buildMask()
        kick()
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="mf-hero-matrix" aria-hidden="true" />
}


export const TPFooter = forwardRef(function TPFooter(_, ref) {
  const { t, locale } = useT()
  const year = new Date().getFullYear()

  const companyLinks = [
    { title: t('nav.howItWorks'), href: '#how-it-works' },
    { title: t('nav.features'),   href: '#features' },
    { title: t('about.nav'),      href: '/about' },
  ]
  const termsLinks = [
    { title: t('footer.termsOfUse'),   href: '/terms' },
    { title: t('footer.privacyPolicy'), href: '/privacy' },
  ]

  const flagIso = FLAG_ISO[locale] || 'gb'
  const langLabel = { de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français', pl: 'Polski', pt: 'Português', ru: 'Русский', tr: 'Türkçe' }[locale] || 'English'

  return (
    <footer ref={ref} className="mf-footer">
      <div className="mf-top-line" aria-hidden="true" />
      <div className="mf-outer">
        <div className="mf-card">
          <div className="mf-card-inner">
            <div className="mf-row">
              <div className="mf-brand">
                <a href="#" className="mf-logo">
                  <FinalTableLogo className="mf-logo-svg" width={224} height={80} />
                </a>
                <div className="mf-follow">
                  <div className="mf-follow-row">
                    <span className="mf-follow-label">{t('footer.followUs')}</span>
                    <a href="https://discord.gg/bEFGeAR6X" target="_blank" rel="noopener noreferrer" className="mf-social" aria-label="Discord">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                      </svg>
                    </a>
                    <a href="#" className="mf-social" aria-label="Instagram">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a href="#" className="mf-social" aria-label="LinkedIn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="mf-nav">
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.company')}</span>
                  {companyLinks.map(({ href, title }, i) => (
                    <a key={i} href={href} className="mf-link">{title}</a>
                  ))}
                </div>
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.termsHead')}</span>
                  {termsLinks.map(({ href, title }, i) => (
                    <a key={i} href={href} className="mf-link">{title}</a>
                  ))}
                </div>
                <div className="mf-col">
                  <span className="mf-col-head">{t('footer.contactHead')}</span>
                  <a href="mailto:contact@finaltable.io" className="mf-link">contact@finaltable.io</a>
                </div>
              </div>
            </div>

            <div className="mf-bottom-row">
              <p className="mf-copy">{t('footer.copyright', { year })}</p>
              <div className="mf-lang-pill" aria-hidden="true">
                <span className={`fi fi-${flagIso} mf-lang-flag`} />
                <span className="mf-lang-label">{langLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <div className="mf-store-btns">
              <AppStoreButton />
              <GooglePlayButton />
            </div>
            <p className="mf-support">{t('footer.support')}</p>
          </div>

          <div className="mf-hero-card" aria-hidden="true">
            <img src="/footer_card.png" alt="" className="mf-hero-img" />
          </div>
        </div>
      </div>
    </footer>
  )
})

/* ────────────────────────────────────────────────────── */
/*  FIXED TAB BAR                                         */
/* ────────────────────────────────────────────────────── */
const getTabs = (t) => [
  { icon: IMG_TAB_ICON_1, label: t('tabs.0.label'), mockup: '/phonemain_1.png' },
  { icon: IMG_TAB_ICON_2, label: t('tabs.1.label'), mockup: '/at_the_table_1.png' },
  { icon: IMG_TAB_ICON_3, label: t('tabs.2.label'), mockup: '/phonemain_3.png' },
  { icon: IMG_TAB_ICON_4, label: t('tabs.3.label'), mockup: '/phonemain_3.png' },
]

const getTabInfo = (t) => [
  { eyebrow: t('tabs.0.eyebrow'), title: t('tabs.0.title'), body: t('tabs.0.body') },
  { eyebrow: t('tabs.1.eyebrow'), title: t('tabs.1.title'), body: t('tabs.1.body') },
  { eyebrow: t('tabs.2.eyebrow'), title: t('tabs.2.title'), body: t('tabs.2.body') },
  { eyebrow: t('tabs.3.eyebrow'), title: t('tabs.3.title'), body: t('tabs.3.body') },
]

/* ────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────── */
/*  FEATURES SHOWCASE  (bento grid, 10 cards)            */
/* ────────────────────────────────────────────────────── */
const STACK_ICONS = [Eye, TrendingUp, Crosshair, Users]
const getStackCards = (t) => [0, 1, 2, 3].map(i => ({
  icon: STACK_ICONS[i],
  left: {
    stat: t(`problems.${i}.stat`),
    question: t(`problems.${i}.question`),
  },
  body: t(`problems.${i}.body`),
}))

function TPProblems() {
  const { t } = useT()
  const STACK_CARDS = getStackCards(t)
  const wrapperRef = useRef(null)
  const cardRefs = useRef([])
  const [activeCard, setActiveCard] = useState(0)
  const activeRef = useRef(0)      // tracks left-text active card
  const rightRef  = useRef(0)      // tracks right-side card for icon animation

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const n = STACK_CARDS.length
    const isMobile = () => window.innerWidth <= 860
    const getContainerH = () => isMobile() ? 260 : 340
    const getActiveY = () => isMobile() ? 32 : 48
    const PEEK        = 10
    const LERP        = 0.1  // smoothing factor (lower = silkier)

    let CONTAINER_H = getContainerH()
    let ACTIVE_Y = getActiveY()
    const curY = Array(n).fill(CONTAINER_H + 40)

    const onResize = () => {
      CONTAINER_H = getContainerH()
      ACTIVE_Y = getActiveY()
    }
    window.addEventListener('resize', onResize)
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
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="sc-section"
      data-nav-theme="dark"
      ref={wrapperRef}
      style={{ height: `${STACK_CARDS.length * (window.innerWidth <= 860 ? 100 : 130)}vh` }}
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
  const { t } = useT()

  const cards = [
    { video: '/statistics.mp4',   title: t('features.opponentProfiles.title'), desc: t('features.opponentProfiles.desc') },
    { video: '/bankroll_chart.mp4', title: t('features.bankroll.title'),         desc: t('features.bankroll.desc') },
    { video: '/ai_analysis.mp4',  title: t('features.sessionLogger.title'),    desc: t('features.sessionLogger.desc') },
  ]

  return (
    <section className="fv-section" data-nav-theme="dark">
      <div className="fv-inner">
        <div className="fv-header">
          <h2 className="fv-title">
            {t('features.title')}
          </h2>
          <p className="fv-subtitle">{t('features.subtitle')}</p>
        </div>
        <div className="fv-row">
          {cards.map((card, ci) => (
            <div key={ci} className={`fv-card${ci === 0 ? ' fv-card-featured' : ''}`}>
              <div className="fv-card-img-wrap">
                {card.video
                  ? <video src={card.video} className="fv-card-img" autoPlay loop muted playsInline />
                  : <img src={card.img} alt="" className="fv-card-img" />}
              </div>
              <div className="fv-card-body">
                <h3 className="fv-card-title">{card.title}</h3>
                <p className="fv-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────── */
/*  FINAL CTA  (Figma 110:9602)                          */
/* ────────────────────────────────────────────────────── */
const getFinalFaqs = (t) => [0, 1, 2, 3].map(i => ({
  q: t(`faq.${i}.q`),
  a: t(`faq.${i}.a`),
}))


function TPFinalCTA() {
  const { t } = useT()
  const FINAL_FAQS = getFinalFaqs(t)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '' })
  const [platform, setPlatform] = useState('ios')
  const [status, setStatus] = useState('idle')
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
      const result = await submitNicknameClaim(form.username, form.email, form.firstName, form.lastName, platform)
      if (result.taken) { setStatus('taken'); return }
      const wlResult = await submitToWaitlist(form.email, form.firstName, form.lastName, platform).catch(() => ({}))
      if (wlResult?.status === 'new') sendWelcomeEmail(form.email, platform)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="fc-section" data-nav-theme="light" id="faq">
      <div className="fc-inner">

        {/* ── Header ── */}
        <div className="fc-header-group">
          <div className="fc-header-top">
            <p className="fc-eyebrow">{t('cta.eyebrow')}</p>
            <div className="fc-title-row">
              <h2 className="fc-title">
                <em>{t('cta.titleLine1')}</em>
                <br />
                {t('cta.titleLine2')}
              </h2>
              <p className="fc-subtitle">{t('cta.body')}</p>
            </div>
          </div>
          <div className="fc-proof-row">
            <div className="fc-avatars">
              <img src="/avatar_1.png" alt="" className="fc-avatar" />
              <img src="/avatar_2.png" alt="" className="fc-avatar" />
              <img src="/avatar_3.png" alt="" className="fc-avatar" />
              <img src="/avatar_4.png" alt="" className="fc-avatar" />
              <img src="/avatar_5.png" alt="" className="fc-avatar" />
            </div>
            <p className="fc-proof-text">
              <strong>{getPlayerCount()}+ players</strong>{' '}
              <span>already signed up</span>
            </p>
          </div>
        </div>

        {/* ── Bottom: FAQ + Form ── */}
        <div className="fc-bottom">

          {/* FAQ column */}
          <div className="fc-faq-col">
            <div className="fc-faq-list">
              {FINAL_FAQS.map((f, i) => (
                <div key={i} className={`fc-faq-item${openFaq === i ? ' fc-faq-open' : ''}`}>
                  <button className="fc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <img
                      src="/plus-bold.svg"
                      alt=""
                      className={`fc-faq-icon${openFaq === i ? ' fc-faq-icon-open' : ''}`}
                    />
                  </button>
                  <div className="fc-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
            <p className="fc-support">{t('cta.support')}</p>
          </div>

          {/* Form card */}
          <div className="fc-card">
            <div className="fc-card-header">
              <p className="fc-card-title">
                7-day free trial to<br /><em>Reserve Username in advance</em>
              </p>
            </div>
            <form className="fc-form" onSubmit={handleSubmit}>
              <div className="fc-fields">
                <div className="fc-top-fields">
                  <div className="fc-name-row">
                    <input className="fc-input" type="text" name="firstName" placeholder="Enter first name" value={form.firstName} onChange={handleChange} />
                    <input className="fc-input" type="text" name="lastName" placeholder="Enter last name" value={form.lastName} onChange={handleChange} />
                  </div>
                  <div className="fc-field-group">
                    <input className="fc-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                    <p className="fc-hint">Your future sign-in email — this can't be changed later.</p>
                  </div>
                </div>
                <div className="fc-username-section">
                  <p className="fc-username-label">What username would you like to reserve?</p>
                  <div className="fc-field-group">
                    <div className="fc-input-prefix-wrap">
                      <span className="fc-prefix">@</span>
                      <input className="fc-input fc-input-prefix" type="text" name="username" placeholder="Enter username" value={form.username} onChange={handleChange} required />
                    </div>
                    <p className="fc-hint">Maximum 20 characters</p>
                  </div>
                </div>
              </div>
              <div className="fc-platform-toggle">
                <button
                  type="button"
                  className={`fc-platform-btn${platform === 'ios' ? ' fc-platform-active' : ''}`}
                  onClick={() => setPlatform('ios')}
                >
                  <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  iOS
                </button>
                <button
                  type="button"
                  className={`fc-platform-btn${platform === 'android' ? ' fc-platform-active' : ''}`}
                  onClick={() => setPlatform('android')}
                >
                  <svg width="16" height="16" viewBox="0 0 576 512" fill="currentColor"><path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48l47.94-83a10 10 0 1 0-17.27-10l-48.54 84.07a306.2 306.2 0 0 0-134.63 0l-48.54-84.07a10 10 0 1 0-17.27 10l47.94 83C208.09 194.27 160 270.33 160 360h416c0-89.67-48.09-165.73-136.85-202.55"/></svg>
                  Android
                </button>
              </div>
              {status === 'taken' && <p className="ru-error">{t('cta.errorTaken')}</p>}
              {status === 'error' && <p className="ru-error">{t('cta.errorGeneric')}</p>}
              <button className="fc-submit" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? t('cta.btnLoading') : 'Reserve my spot'}
                {status !== 'sending' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Success modal overlay */}
          {status === 'done' && (
            <div className="spotlight-success-overlay" onClick={() => { setStatus('idle'); setForm({ firstName: '', lastName: '', email: '', username: '' }) }}>
              <div className="spotlight-success-card" onClick={e => e.stopPropagation()}>
                <p className="spotlight-success-pretitle">
                  3 months free trial to{' '}
                  <em>Reserve Username in advance</em>
                </p>
                <div className="spotlight-success-body">
                  <svg className="spotlight-success-icon" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="ssi-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6dd5c0" />
                        <stop offset="100%" stopColor="#1ea87c" />
                      </linearGradient>
                    </defs>
                    <circle cx="17" cy="17" r="17" fill="url(#ssi-grad)" />
                    <path d="M10.5 17.5L14.5 21.5L23.5 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="spotlight-success-heading">You're on the list!</h3>
                  <p className="spotlight-success-text">We'll drop you a note once Final Table is live. Until then dream up your next game. We'll take care of the rest.</p>
                </div>
                <button
                  className="spotlight-success-btn"
                  onClick={() => { setStatus('idle'); setForm({ firstName: '', lastName: '', email: '', username: '' }) }}
                >
                  Reserve another
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const footerRef = useRef(null)

  // Strip any hash from the URL on landing. If it targets a valid section,
  // scroll there first; then replace the URL so it stays clean (finaltable.io).
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const el = document.querySelector(hash)
    const clean = () => history.replaceState(null, '', window.location.pathname + window.location.search)
    if (el) {
      // Wait a tick for layout + Lenis to be ready
      requestAnimationFrame(() => {
        if (window.__lenis) window.__lenis.scrollTo(hash, { immediate: false })
        else el.scrollIntoView({ behavior: 'smooth' })
        clean()
      })
    } else {
      clean()
    }
  }, [])

  useEffect(() => {
    if (typeof Lenis === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({
      duration: 1.1,
      easing: t => 1 - Math.pow(1 - t, 3),
    })
    window.__lenis = lenis
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => { lenis.destroy(); delete window.__lenis }
  }, [])

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    const update = () => {
      document.documentElement.style.setProperty('--footer-height', footer.offsetHeight + 'px')
    }
    const ro = new ResizeObserver(update)
    ro.observe(footer)
    update()
    return () => ro.disconnect()
  }, [])

  return (
    <div className="tp-root">
      <TPNavbar />
      <div className="tp-page-body">
        <main>
          <TPHero />
          <TPHowItWorks />
          <TPNotHud />
          <TPBuckleUp />
          <TPBuiltForLive />
          <TPDiscord />
          <TPBottomHero />
        </main>
      </div>
      <TPFooter ref={footerRef} />
    </div>
  )
}
