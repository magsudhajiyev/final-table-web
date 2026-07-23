import React from 'react'
import ReactDOM from 'react-dom/client'
import LandingPage from './LandingPage'
import HandViewer from './HandViewer'
import AboutPage from './AboutPage'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'
import DeleteAccountPage from './DeleteAccountPage'
import AdminPage from './AdminPage'
import Loader from './Loader'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './theme'
import './index.css'

// Simple path-based routing
const path = window.location.pathname
const handMatch = path.match(/^\/hand\/([a-zA-Z0-9]+)$/)

// Per-route <title> / meta description. The default in index.html covers "/".
const ROUTE_META = {
  '/about':          { title: 'About — Final Table',            description: 'Meet the team building Final Table, the live poker tracker for the table.' },
  '/privacy':        { title: 'Privacy Policy — Final Table',   description: 'How Final Table collects, uses, and protects your data.' },
  '/terms':          { title: 'Terms of Service — Final Table', description: 'The terms that govern your use of Final Table.' },
  '/delete-account': { title: 'Delete Account — Final Table',   description: 'Request deletion of your Final Table account and associated data.' },
  '/admin':          { title: 'Admin — Final Table',            description: 'Final Table admin dashboard.' },
}
const routeMeta = handMatch
  ? { title: 'Shared Hand — Final Table', description: 'View a poker hand shared from Final Table.' }
  : ROUTE_META[path]
if (routeMeta) {
  document.title = routeMeta.title
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', routeMeta.description)
}
// Canonical for non-landing routes
if (routeMeta && !handMatch) {
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) canonical.setAttribute('href', `https://www.finaltable.io${path}`)
}

function App() {
  if (handMatch) return <HandViewer shareId={handMatch[1]} />
  if (path === '/about') return <ThemeProvider><I18nProvider><AboutPage /></I18nProvider></ThemeProvider>
  if (path === '/privacy') return <I18nProvider><PrivacyPage /></I18nProvider>
  if (path === '/terms') return <I18nProvider><TermsPage /></I18nProvider>
  if (path === '/delete-account') return <I18nProvider><DeleteAccountPage /></I18nProvider>
  if (path === '/admin') return <AdminPage />
  return <ThemeProvider><I18nProvider><LandingPage /></I18nProvider></ThemeProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Loader />
    <App />
  </React.StrictMode>
)
