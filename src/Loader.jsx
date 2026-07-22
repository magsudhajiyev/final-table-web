import { useEffect, useState } from 'react'
import './Loader.css'

const WORDS = ['Hello', 'Hallo', 'Hola', 'Bonjour', 'Olá', 'Привет', 'Merhaba', 'Привіт']
const WORD_MS = 300
const FADE_MS = 400
const STORAGE_KEY = 'ft_loader_seen'

export default function Loader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(STORAGE_KEY) !== '1'
  })
  const [i, setI] = useState(0)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    if (!visible) return
    document.documentElement.style.overflow = 'hidden'
    let idx = 0
    const tick = setInterval(() => {
      idx += 1
      if (idx >= WORDS.length) {
        clearInterval(tick)
        setHiding(true)
        setTimeout(() => {
          setVisible(false)
          sessionStorage.setItem(STORAGE_KEY, '1')
          document.documentElement.style.overflow = ''
        }, FADE_MS)
      } else {
        setI(idx)
      }
    }, WORD_MS)
    return () => {
      clearInterval(tick)
      document.documentElement.style.overflow = ''
    }
  }, [visible])

  if (!visible) return null

  const pct = ((i + 1) / WORDS.length) * 100

  return (
    <div className={`ft-loader${hiding ? ' is-hiding' : ''}`} aria-hidden="true">
      <div className="ft-loader-stack">
        <span key={i} className="ft-loader-word">{WORDS[i]}</span>
        <div className="ft-loader-bar">
          <div className="ft-loader-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
