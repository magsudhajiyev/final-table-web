import React from 'react'
import ReactDOM from 'react-dom/client'
import TestPage from './TestPage'
import HandViewer from './HandViewer'
import './index.css'

// Simple path-based routing
const path = window.location.pathname
const handMatch = path.match(/^\/hand\/([a-zA-Z0-9]+)$/)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {handMatch ? <HandViewer shareId={handMatch[1]} /> : <TestPage />}
  </React.StrictMode>
)
