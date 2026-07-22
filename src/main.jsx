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
