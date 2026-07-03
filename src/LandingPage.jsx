import { useState, useEffect, useRef, forwardRef } from 'react'
import { Eye, TrendingUp, Crosshair, Users, Zap, Target, Layers, Mic } from 'lucide-react'
import { useT, SUPPORTED } from './i18n'
import './LandingPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru', tr: 'tr' }

const APP_STORE_URL = 'https://apps.apple.com/us/app/final-table/id6760188970'

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
/*  NAVBAR                                                */
/* ────────────────────────────────────────────────────── */
function TPNavbar() {
  const { t, locale, setLocale } = useT()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light') // 'dark' | 'light'
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const langRef = useRef(null)
  const mobileLangRef = useRef(null)

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

  const isLight = theme === 'light'
  const logo    = '/logo.png'
  const iconSrc = '/assets/logo_cion.svg'

  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
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
    <header className={`tp-nav-wrap tp-nav-${theme}${scrolled ? ' tp-nav-scrolled' : ''}${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <a href="#" className="tp-nav-logo" onClick={(e) => { e.preventDefault(); if (window.__lenis) window.__lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <img src={logo} alt="Final Table" className="tp-nav-logo-img" />
        </a>
        <div className="tp-nav-sep" />
        <div className="tp-nav-links">
          <a href="#how-it-works" className={activeSection === 'how-it-works' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.howItWorks')}</a>
          <a href="#features" className={activeSection === 'features' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.features')}</a>
          <a href="#compare" className={activeSection === 'compare' ? 'tp-nav-active' : ''} onClick={smoothScroll}>{t('nav.compare')}</a>
          <a href="/about">{t('about.nav')}</a>
        </div>
        <div className="tp-lang-picker" ref={langRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
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
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="tp-nav-waitlist-btn">
          {t('nav.cta')}
        </a>
        <div className="tp-mobile-lang-picker" ref={mobileLangRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
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
        <a href="#how-it-works" onClick={smoothScroll}>{t('nav.howItWorks')}</a>
        <a href="#features" onClick={smoothScroll}>{t('nav.features')}</a>
        <a href="#compare" onClick={smoothScroll}>{t('nav.compare')}</a>
        <a href="/about">{t('about.nav')}</a>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────── */
/*  HERO                                                  */
/* ────────────────────────────────────────────────────── */

function AppStoreButton({ size = 'md', ...props }) {
  const w = size === 'md' ? 120 : 132
  const h = size === 'md' ? 40 : 44
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

function TPHero() {
  const { t } = useT()

  return (
    <section className="tp-hero" data-nav-theme="light">
      <div className="tp-hero-inner">
        <div className="tp-hero-row">
          <div className="tp-hero-content">

            {/* Badge */}
            <div className="tp-hero-badge">
              <img src="/Apple_logo_black.svg" alt="" className="tp-hero-badge-icon" />
              Now live on iOS
            </div>

            <h1 className="tp-hero-h1">{t('hero.h1')}</h1>
            <p className="tp-hero-sub">{t('hero.sub')}</p>

            <div id="reserve-form" className="tp-appstore-cta">
              <AppStoreButton />
              <p className="tp-appstore-android-note">
                <svg width="13" height="13" viewBox="0 0 576 512" fill="currentColor" style={{opacity:0.5}}><path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48l47.94-83a10 10 0 1 0-17.27-10l-48.54 84.07a306.2 306.2 0 0 0-134.63 0l-48.54-84.07a10 10 0 1 0-17.27 10l47.94 83C208.09 194.27 160 270.33 160 360h416c0-89.67-48.09-165.73-136.85-202.55"/></svg>
                Android — Coming Soon
              </p>
            </div>

            {/* Social proof */}
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
          <div className="tp-hero-phone" aria-hidden="true">
            <video
              src="/hero_hand_logging_website_v1.webm"
              className="tp-hero-phone-img"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
        <div className="tp-hero-divider" />
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
  return (
    <section className="hiw-section" id="how-it-works" data-nav-theme="light">
      <div className="hiw-inner">

        <h2 className="hiw-title">
          <span className="hiw-title-sans">{t('howSection.sans')}</span>
          <span className="hiw-title-italic">{t('howSection.italic')}</span>
        </h2>

        <div className="hiw-row">

          <div className="hiw-card">
            <div className="hiw-img-area">
              <div className="hiw-img-wrap">
                <img src="/hiw_before.jpg" alt="" className="hiw-img" />
              </div>
            </div>
            <div className="hiw-body">
              <p className="hiw-eyebrow">{t('tabs.0.label')}</p>
              <HiwTitle text={t('tabs.0.title')} />
              <p className="hiw-desc">{t('tabs.0.body')}</p>
            </div>
          </div>

          <div className="hiw-card">
            <div className="hiw-img-area">
              <div className="hiw-img-wrap">
                <img src="/hiw_table.png" alt="" className="hiw-img" />
              </div>
            </div>
            <div className="hiw-body">
              <p className="hiw-eyebrow">{t('tabs.1.label')}</p>
              <HiwTitle text={t('tabs.1.title')} />
              <p className="hiw-desc">{t('tabs.1.body')}</p>
            </div>
          </div>

          <div className="hiw-card">
            <div className="hiw-img-area">
              <div className="hiw-img-wrap">
                <img src="/hiw_after.png" alt="" className="hiw-img" />
              </div>
            </div>
            <div className="hiw-body">
              <p className="hiw-eyebrow">{t('tabs.2.label')}</p>
              <HiwTitle text={t('tabs.2.title')} />
              <p className="hiw-desc">{t('tabs.2.body')}</p>
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

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.nh-card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('nh-card--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const cards = [
    { titleKey: 'notHud.item1Title', descKey: 'notHud.item1Desc' },
    { titleKey: 'notHud.item2Title', descKey: 'notHud.item2Desc' },
    { titleKey: 'notHud.item3Title', descKey: 'notHud.item3Desc' },
  ]
  return (
    <section className="nh-section" data-nav-theme="light">
      <div className="nh-inner">
        <h2 className="nh-title">{t('notHud.title')}</h2>
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
                <p className="tp-appstore-android-note">
                  <svg width="13" height="13" viewBox="0 0 576 512" fill="currentColor" style={{opacity:0.5}}><path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48l47.94-83a10 10 0 1 0-17.27-10l-48.54 84.07a306.2 306.2 0 0 0-134.63 0l-48.54-84.07a10 10 0 1 0-17.27 10l47.94 83C208.09 194.27 160 270.33 160 360h416c0-89.67-48.09-165.73-136.85-202.55"/></svg>
                  Android — Coming Soon
                </p>
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
const TPFooter = forwardRef(function TPFooter(_, ref) {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy' },
    { title: t('footer.terms'),    href: '/terms' },
  ]

  const resources = [
    { title: t('nav.howItWorks'),   href: '#how-it-works' },
    { title: t('nav.features'),     href: '#features' },
    { title: t('nav.compare'),      href: '#compare' },
    { title: t('about.nav'),        href: '/about' },
  ]

  return (
    <footer ref={ref} className="mf-footer">
      <div className="mf-inner">
        <a href="#" className="mf-logo">
          <img src="/logo.png" alt="Final Table" className="mf-logo-img" />
        </a>

        <div className="mf-grid">
          <div className="mf-brand">
            <div className="mf-brand-content">
              <div className="mf-headline">
                {t('footer.tagline')}
              </div>
              <p className="mf-tagline">{t('hero.sub')}</p>
            </div>
            <p className="mf-support">{t('footer.support')}</p>
          </div>

          <div className="mf-nav">
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.resources')}</span>
              {resources.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.company')}</span>
              {company.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mf-divider" />
        <div className="mf-bottom-row">
          <p className="mf-copy">{t('footer.copy', { year })}</p>
          <a href="https://discord.gg/bEFGeAR6X" target="_blank" rel="noopener noreferrer" className="mf-discord-link" aria-label="Join our Discord">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mf-discord-icon" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </a>
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
    <section className="fv-section" id="features" data-nav-theme="dark">
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


export default function LandingPage() {
  const footerRef = useRef(null)

  useEffect(() => {
    if (typeof Lenis === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({
      duration: 1.8,
      easing: t => 1 - Math.pow(1 - t, 4),
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
          <TPFeaturesShowcase />
          <TPComparison />
          <TPBottomCTA />
        </main>
      </div>
      <TPFooter ref={footerRef} />
    </div>
  )
}
