import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ft_theme'
const MODES = ['light', 'dark', 'auto']

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

function detectMode() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && MODES.includes(stored)) return stored
  // Default to dark so the site matches the dark home page out of the box;
  // users can opt into light or auto via the footer toggle.
  return 'dark'
}

/** Resolve a mode ('light' | 'dark' | 'auto') to the concrete theme applied. */
function resolveTheme(mode) {
  if (mode === 'auto') return prefersDark() ? 'dark' : 'light'
  return mode
}

function applyTheme(theme) {
  const body = document.body
  body.classList.toggle('dark-theme', theme === 'dark')
  body.classList.toggle('light-theme', theme === 'light')
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(detectMode)
  const [theme, setTheme] = useState(() => resolveTheme(detectMode()))

  // Apply on mount and whenever the resolved theme changes.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Re-resolve when mode changes.
  useEffect(() => {
    setTheme(resolveTheme(mode))
  }, [mode])

  // In auto mode, follow OS changes live.
  useEffect(() => {
    if (mode !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(resolveTheme('auto'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((next) => {
    if (!MODES.includes(next)) return
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { mode: 'dark', theme: 'dark', setMode: () => {} }
  return ctx
}

/* ── Shared footer theme toggle (light / dark / auto) ── */
export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  return (
    <div className="mf-theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={`mf-theme-btn${mode === 'light' ? ' mf-theme-btn-active' : ''}`}
        aria-label="Light theme"
        aria-pressed={mode === 'light'}
        onClick={() => setMode('light')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      </button>
      <button
        type="button"
        className={`mf-theme-btn${mode === 'dark' ? ' mf-theme-btn-active' : ''}`}
        aria-label="Dark theme"
        aria-pressed={mode === 'dark'}
        onClick={() => setMode('dark')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <button
        type="button"
        className={`mf-theme-btn${mode === 'auto' ? ' mf-theme-btn-active' : ''}`}
        aria-label="Auto theme"
        aria-pressed={mode === 'auto'}
        onClick={() => setMode('auto')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
