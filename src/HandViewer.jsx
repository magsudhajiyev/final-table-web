import { useEffect, useState } from 'react'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyDTw_1lOHmIl_gDY3ex-N_l8NLxRzy6AtA",
  authDomain: "poker-tracker-52df8.firebaseapp.com",
  projectId: "poker-tracker-52df8",
  storageBucket: "poker-tracker-52df8.firebasestorage.app",
  messagingSenderId: "311745459306",
  appId: "1:311745459306:web:4d53385d198139f8d00613",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function HandViewer({ shareId }) {
  const [hand, setHand] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'shared_hands', shareId))
        if (!snap.exists()) { setError(true); return }
        setHand(snap.data())
        document.title = `Hand #${snap.data().handNumber} - ${snap.data().result} - Final Table`
      } catch (e) {
        console.error('Error loading hand:', e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [shareId])

  if (loading) return <div style={styles.page}><p style={styles.loadingText}>Loading hand...</p></div>
  if (error) return (
    <div style={styles.page}>
      <div style={styles.errorBox}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>&spades;</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Hand not found</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 8 }}>This hand may have been removed or the link is invalid.</p>
      </div>
    </div>
  )

  const d = hand
  const sb = d.smallBlind || 0
  const bb = d.bigBlind || 0
  const isCash = d.gameType === 'cash'
  const blindsStr = isCash ? `$${sb}/$${bb}` : `${sb}/${bb}`
  const typeStr = isCash ? 'Cash Game' : 'MTT'

  const holeCards = d.ourHoleCards || {}
  const board = d.boardCards || {}
  const flop = board.flop || []
  const turn = board.turn
  const river = board.river

  const pot = d.potAmount || 0
  const potStr = isCash ? `$${Number(pot).toFixed(2)}` : Number(pot).toLocaleString()

  const result = d.result || 'Lost'
  const resultStyle = result === 'Won' ? styles.badgeWon : result === 'Chopped' ? styles.badgeChopped : styles.badgeLost
  const icon = result === 'Won' ? '\u2713' : result === 'Chopped' ? '\u21C4' : '\u2717'

  const boardCards = []
  for (const c of flop) boardCards.push(c)
  if (turn) boardCards.push(turn)
  else if (flop.length > 0) boardCards.push(null) // empty slot
  if (river) boardCards.push(river)
  else if (turn) boardCards.push(null)

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>Final Table</span>
          <span style={styles.gameInfo}>{blindsStr}  {typeStr}</span>
        </div>

        {/* Meta */}
        <div style={styles.meta}>
          <span style={styles.metaItem}>Hand <span style={styles.metaValue}>#{d.handNumber || '?'}</span></span>
          <span style={styles.metaItem}>Position <span style={styles.metaValue}>{d.heroPositionName || '?'}</span></span>
          <span style={styles.metaItem}>Players <span style={styles.metaValue}>{d.playerCount || '?'}</span></span>
        </div>

        {/* Hero Cards */}
        <p style={styles.sectionLabel}>Hero Cards</p>
        <div style={styles.cardsRow}>
          {holeCards.card1 && <PlayingCard card={holeCards.card1} />}
          {holeCards.card2 && <PlayingCard card={holeCards.card2} />}
        </div>

        {/* Board */}
        <p style={styles.sectionLabel}>Board</p>
        <div style={styles.cardsRow}>
          {boardCards.length === 0 ? (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No board dealt</span>
          ) : (
            boardCards.map((c, i) =>
              c ? <PlayingCard key={i} card={c} small /> : <EmptyCard key={i} />
            )
          )}
        </div>

        {/* Pot */}
        <div style={styles.potRow}>
          <span style={styles.potLabel}>Pot</span>
          <span style={styles.potValue}>{potStr}</span>
        </div>

        {/* Result */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ ...styles.badge, ...resultStyle }}>{icon} {result}</span>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <a style={styles.ctaButton} href="https://apps.apple.com/app/final-table" target="_blank" rel="noopener noreferrer">
          Download Final Table
        </a>
        <p style={styles.ctaTagline}>Track your poker hands and analyze your play</p>
      </div>
    </div>
  )
}

function PlayingCard({ card, small }) {
  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  const isRed = suit === '\u2665' || suit === '\u2666'
  const size = small ? { width: 44, height: 60 } : { width: 52, height: 72 }
  const rankSize = small ? 16 : 20
  const suitSize = small ? 13 : 16

  return (
    <div style={{
      ...size,
      background: '#fff',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Roboto Mono', monospace",
      fontWeight: 700,
      color: isRed ? '#D32F2F' : '#1a1a1a',
      lineHeight: 1,
    }}>
      <span style={{ fontSize: rankSize }}>{rank}</span>
      <span style={{ fontSize: suitSize, marginTop: 2 }}>{suit}</span>
    </div>
  )
}

function EmptyCard() {
  return (
    <div style={{
      width: 44, height: 60,
      background: 'rgba(255,255,255,0.06)',
      border: '1px dashed rgba(255,255,255,0.15)',
      borderRadius: 8,
    }} />
  )
}

const styles = {
  page: {
    background: '#02050B',
    color: '#fff',
    fontFamily: "'IBM Plex Sans', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
  errorBox: { textAlign: 'center' },
  card: {
    background: '#131616',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '28px 24px',
    maxWidth: 400,
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: { fontSize: 18, fontWeight: 700, color: '#89F1EC', letterSpacing: -0.5 },
  gameInfo: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Roboto Mono', monospace" },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  metaValue: { fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardsRow: { display: 'flex', gap: 8, marginBottom: 20 },
  potRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  potLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  potValue: { fontSize: 18, fontWeight: 700, fontFamily: "'Roboto Mono', monospace", color: '#fff' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 600,
    marginTop: 16,
  },
  badgeWon: {
    background: 'rgba(98,227,188,0.15)',
    color: '#62E3BC',
    border: '1px solid rgba(98,227,188,0.3)',
  },
  badgeLost: {
    background: 'rgba(255,107,107,0.15)',
    color: '#FF6B6B',
    border: '1px solid rgba(255,107,107,0.3)',
  },
  badgeChopped: {
    background: 'rgba(255,215,0,0.15)',
    color: '#FFD700',
    border: '1px solid rgba(255,215,0,0.3)',
  },
  cta: { marginTop: 28, textAlign: 'center' },
  ctaButton: {
    display: 'inline-block',
    background: '#89F1EC',
    color: '#000',
    padding: '14px 32px',
    borderRadius: 60,
    fontWeight: 600,
    fontSize: 16,
    textDecoration: 'none',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  ctaTagline: { marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.3)' },
}
