import React from 'react'
import ReactDOM from 'react-dom/client'
import TestPage from './TestPage'
import HandViewer from './HandViewer'
import AboutPage from './AboutPage'
import { I18nProvider } from './i18n'
import './index.css'

// Simple path-based routing
const path = window.location.pathname
const handMatch = path.match(/^\/hand\/([a-zA-Z0-9]+)$/)

function App() {
  if (handMatch) return <HandViewer shareId={handMatch[1]} />
  if (path === '/about') return <I18nProvider><AboutPage /></I18nProvider>
  return <I18nProvider><TestPage /></I18nProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
