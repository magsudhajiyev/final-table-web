import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TestPage from './TestPage'
import './index.css'

const isTest = window.location.pathname === '/test'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isTest ? <TestPage /> : <App />}
  </React.StrictMode>
)
