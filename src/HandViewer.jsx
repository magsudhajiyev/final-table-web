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

// Position calculation (mirrors Flutter PokerPositions logic)
function getPositionName(seatNumber, buttonPosition, playerCount) {
  if (playerCount <= 1) return '?'
  const positions = []
  for (let i = 0; i < playerCount; i++) {
    positions.push(((buttonPosition - 1 + i) % playerCount) + 1)
  }
  const posNames2 = ['BTN', 'BB']
  const posNames3 = ['BTN', 'SB', 'BB']
  const posNames4 = ['BTN', 'SB', 'BB', 'UTG']
  const posNames5 = ['BTN', 'SB', 'BB', 'UTG', 'CO']
  const posNames6 = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO']
  const posNames7 = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO']
  const posNames8 = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO']
  const posNames9 = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO']
  const allNames = { 2: posNames2, 3: posNames3, 4: posNames4, 5: posNames5, 6: posNames6, 7: posNames7, 8: posNames8, 9: posNames9 }
  const names = allNames[playerCount] || posNames9
  const idx = positions.indexOf(seatNumber)
  if (idx < 0 || idx >= names.length) return '?'
  return names[idx]
}

// Format amounts
function formatAmount(value, isCash) {
  if (value == null || value <= 0) return '-'
  if (isCash) return formatCompactCurrency(value)
  return formatCompactNumber(value)
}

function formatCompactCurrency(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `$${Number(v).toFixed(v % 1 === 0 ? 0 : 2)}`
}

function formatCompactNumber(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${Math.round(v)}`
}

function formatPot(value, isCash) {
  if (value == null || value <= 0) return '-'
  if (isCash) return `$${Number(value).toFixed(2)}`
  return `${Math.round(value)}`
}

// Action color
function getActionColor(action, amount, playerStack) {
  const a = (action || '').toLowerCase().replace(/[\s-]/g, '')
  if (a === 'fold') return '#F44336'
  if (a === 'call' || a === 'check') return '#89F1EC'
  if (a === 'raise' || a === 'bet') {
    // Check if it's effectively all-in
    if (amount && playerStack && amount >= playerStack - 0.01) return '#F44336'
    return '#FF9500'
  }
  if (a === 'allin' || a === 'all-in' || a === 'all in') return '#F44336'
  return 'rgba(255,255,255,0.5)'
}

function getActionLabel(action, amount, playerStack) {
  const a = (action || '').toLowerCase().replace(/[\s-]/g, '')
  if (a === 'allin' || a === 'all-in' || a === 'all in') return 'ALL IN'
  if ((a === 'raise' || a === 'bet') && amount && playerStack && amount >= playerStack - 0.01) return 'ALL IN'
  return (action || '').toUpperCase()
}

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
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>&spades;</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Hand not found</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 8 }}>This hand may have been removed or the link is invalid.</p>
      </div>
    </div>
  )

  const d = hand
  const isCash = d.gameType === 'cash'
  const sb = d.smallBlind || 0
  const bb = d.bigBlind || 0
  const blindsStr = isCash ? `$${sb}/$${bb}` : `${sb}/${bb}`
  const heroSeat = d.heroSeatNumber || 1
  const buttonPos = d.buttonPosition || 1
  const playerCount = d.playerCount || 6
  const playerNames = d.playerNames || {}
  const winnerId = d.winnerId
  const isChoppedPot = d.isChoppedPot || false
  const choppedWinners = d.choppedWinners || []

  // Winner name
  let winnerName = '-'
  if (isChoppedPot && choppedWinners.length > 0) {
    if (choppedWinners.length <= 2) {
      winnerName = choppedWinners.map(s => playerNames[String(s)] || `P${s}`).join(', ')
    } else {
      winnerName = `${choppedWinners.length} players`
    }
  } else if (winnerId) {
    winnerName = playerNames[String(winnerId)] || `P${winnerId}`
  }

  // Session name
  const sessionName = d.sessionName || null

  // Hero cards
  const hideHoleCards = d.hideHoleCards === true
  const holeCards = hideHoleCards ? {} : (d.ourHoleCards || {})

  // Board
  const board = d.boardCards || {}
  const flop = board.flop || []
  const turn = board.turn
  const river = board.river

  // Showdown
  const showdownData = d.showdownData || {}
  const playerCardsMap = showdownData.playerCards || showdownData || {}

  // Actions grouped by street
  const actions = d.actions || []
  const streets = {}
  for (const a of actions) {
    const street = a.street || 'preflop'
    if (!streets[street]) streets[street] = []
    streets[street].push(a)
  }

  // Check if all-in preflop with no postflop actions
  const hasAllInPreflop = (streets.preflop || []).some(a => {
    const act = (a.action || '').toLowerCase().replace(/[\s-]/g, '')
    return act === 'allin' || act === 'all-in' || act === 'all in' ||
      ((act === 'raise' || act === 'bet') && a.amount && a.playerStack && a.amount >= a.playerStack - 0.01)
  })
  const noPostflopActions = !streets.flop && !streets.turn && !streets.river
  const showBoardSection = hasAllInPreflop && noPostflopActions && flop.length > 0

  // Pot
  const pot = d.potAmount || 0
  const potStr = formatPot(pot, isCash)
  const result = d.result || 'Lost'

  // Street pot amounts
  const streetPots = {
    preflop: d.preflopPot,
    flop: d.flopPot,
    turn: d.turnPot,
    river: d.riverPot,
  }

  // Opponent showdown cards (exclude hero)
  const opponentShowdown = []
  for (const [seat, cards] of Object.entries(playerCardsMap)) {
    const seatNum = parseInt(seat)
    if (seatNum === heroSeat) continue
    if (cards && (cards.card1 || cards.card2)) {
      opponentShowdown.push({ seat: seatNum, name: playerNames[String(seatNum)] || `P${seatNum}`, ...cards })
    }
  }

  return (
    <div style={styles.page}>
      {/* Background gradient glow */}
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Hand #{d.handNumber || '?'}</h1>
            <p style={styles.subtitle}>Position: {d.heroPositionName || '?'}</p>
            {sessionName && <p style={styles.sessionName}>{sessionName}</p>}
          </div>
          <span style={styles.logo}>Final Table</span>
        </div>

        {/* Summary Card: POT | BLINDS | WINNER */}
        <div style={styles.summaryCard}>
          <div style={styles.statCol}>
            <span style={styles.statValue}>{potStr}</span>
            <span style={styles.statLabel}>POT</span>
          </div>
          <div style={styles.dividerV} />
          <div style={styles.statCol}>
            <span style={styles.statValue}>{blindsStr}</span>
            <span style={styles.statLabel}>BLINDS</span>
          </div>
          {winnerId != null && <>
            <div style={styles.dividerV} />
            <div style={styles.statCol}>
              <span style={{ ...styles.statValue, color: '#FFD700' }}>{winnerName}</span>
              <span style={styles.statLabel}>WINNER</span>
            </div>
          </>}
        </div>

        {/* Hero Cards + Opponent Cards */}
        <div style={styles.cardsGrid}>
          {/* Hero cards */}
          <div style={{ ...styles.cardsBox, borderColor: 'rgba(137,241,236,0.4)' }}>
            <div style={styles.cardsBoxHeader}>
              <span style={{ color: '#89F1EC', fontSize: 16 }}>&#9827;</span>
              <span style={{ color: '#89F1EC', fontSize: 12, fontWeight: 600 }}>Your Cards</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              {hideHoleCards ? (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Hidden</span>
              ) : (
                <>
                  {holeCards.card1 ? <PlayingCard card={holeCards.card1} /> : null}
                  {holeCards.card2 ? <PlayingCard card={holeCards.card2} /> : null}
                  {!holeCards.card1 && !holeCards.card2 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Not shown</span>}
                </>
              )}
            </div>
          </div>

          {/* Opponent showdown cards */}
          {opponentShowdown.length > 0 && (
            <div style={{ ...styles.cardsBox, borderColor: 'rgba(139,92,246,0.4)' }}>
              <div style={styles.cardsBoxHeader}>
                <span style={{ color: '#8B5CF6', fontSize: 16 }}>&#9830;</span>
                <span style={{ color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>Opponent Cards</span>
              </div>
              {opponentShowdown.map((opp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 6 : 0 }}>
                  <span style={{ fontSize: 12, color: '#fff', flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {opp.card1 && <PlayingCard card={opp.card1} size="small" />}
                    {opp.card2 && <PlayingCard card={opp.card2} size="small" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Street Actions */}
        {['preflop', 'flop', 'turn', 'river'].map(street => {
          const streetActions = streets[street]
          if (!streetActions || streetActions.length === 0) return null

          const streetLabel = street.toUpperCase()
          const streetPot = streetPots[street]

          // Board cards for this street
          let streetBoardCards = []
          if (street === 'flop') streetBoardCards = flop
          else if (street === 'turn' && turn) streetBoardCards = [turn]
          else if (street === 'river' && river) streetBoardCards = [river]

          return (
            <div key={street} style={styles.streetSection}>
              {/* Street header */}
              <div style={styles.streetHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={styles.streetName}>{streetLabel}</span>
                  {streetBoardCards.length > 0 && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {streetBoardCards.map((c, i) => <PlayingCard key={i} card={c} size="tiny" />)}
                    </div>
                  )}
                </div>
                {streetPot > 0 && (
                  <span style={styles.potBadge}>Pot: {formatPot(streetPot, isCash)}</span>
                )}
              </div>

              {/* Action table */}
              <div style={styles.actionTable}>
                {/* Header row */}
                <div style={styles.actionTableRow}>
                  <span style={{ ...styles.colHeader, flex: 2.5 }}>PLAYER</span>
                  <span style={{ ...styles.colHeader, flex: 1.5 }}>STACK</span>
                  <span style={{ ...styles.colHeader, flex: 1.5 }}>ACTION</span>
                  <span style={{ ...styles.colHeader, flex: 1, textAlign: 'right' }}>AMT</span>
                </div>

                {/* Action rows */}
                {streetActions.map((a, i) => {
                  const seat = a.player || a.playerSeat || 1
                  const isHero = seat === heroSeat
                  const pos = a.playerPosition || getPositionName(seat, buttonPos, playerCount)
                  const name = isHero ? 'You' : (playerNames[String(seat)] || a.playerName || `P${seat}`)
                  const displayName = `${name} (${pos})`
                  const isWinner = isChoppedPot ? choppedWinners.includes(seat) : seat === winnerId
                  const actionColor = getActionColor(a.action, a.amount, a.playerStack || a.stack)
                  const actionLabel = getActionLabel(a.action, a.amount, a.playerStack || a.stack)
                  const stack = a.playerStack || a.stack

                  return (
                    <div key={i} style={styles.actionTableRow}>
                      <span style={{ flex: 2.5, fontSize: 11, color: isHero ? '#89F1EC' : '#fff', fontWeight: isHero ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isWinner && <span style={{ color: '#FFD700', fontSize: 12 }}>&#127942;</span>}
                        {displayName}
                      </span>
                      <span style={{ flex: 1.5, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: "'Roboto Mono', monospace" }}>
                        {formatAmount(stack, isCash)}
                      </span>
                      <span style={{ flex: 1.5, fontSize: 11, color: actionColor, fontWeight: 600 }}>
                        {actionLabel}
                      </span>
                      <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'Roboto Mono', monospace", textAlign: 'right' }}>
                        {formatAmount(a.amount, isCash)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* All-in board section (no postflop actions) */}
        {showBoardSection && (
          <div style={styles.streetSection}>
            <div style={styles.streetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={styles.streetName}>BOARD</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {flop.map((c, i) => <PlayingCard key={`f${i}`} card={c} size="tiny" />)}
                  {turn && <PlayingCard card={turn} size="tiny" />}
                  {river && <PlayingCard card={river} size="tiny" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result badge */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <ResultBadge result={result} />
        </div>

        {/* CTA */}
        <div style={styles.cta}>
          <a style={styles.ctaButton} href="https://apps.apple.com/app/final-table" target="_blank" rel="noopener noreferrer">
            Download Final Table
          </a>
          <p style={styles.ctaTagline}>Track your poker hands and analyze your play</p>
        </div>
      </div>
    </div>
  )
}

function ResultBadge({ result }) {
  const r = result || 'Lost'
  const badgeStyle = r === 'Won' ? { bg: 'rgba(98,227,188,0.15)', color: '#62E3BC', border: 'rgba(98,227,188,0.3)' }
    : r === 'Chopped' ? { bg: 'rgba(255,215,0,0.15)', color: '#FFD700', border: 'rgba(255,215,0,0.3)' }
    : { bg: 'rgba(255,107,107,0.15)', color: '#FF6B6B', border: 'rgba(255,107,107,0.3)' }
  const icon = r === 'Won' ? '\u2713' : r === 'Chopped' ? '\u21C4' : '\u2717'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 40, fontSize: 14, fontWeight: 600,
      background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`,
    }}>
      {icon} {r}
    </span>
  )
}

function PlayingCard({ card, size = 'normal' }) {
  if (!card) return null
  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  const isRed = suit === '\u2665' || suit === '\u2666'
  const color = isRed ? '#D32F2F' : '#1a1a1a'

  const dims = {
    normal: { width: 30, height: 40, rankSize: 12, suitSize: 10, radius: 6 },
    small: { width: 24, height: 32, rankSize: 10, suitSize: 8, radius: 4 },
    tiny: { width: 24, height: 32, rankSize: 10, suitSize: 8, radius: 4 },
  }
  const d = dims[size] || dims.normal

  return (
    <div style={{
      width: d.width, height: d.height, background: '#fff', borderRadius: d.radius,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color, lineHeight: 1,
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: size === 'normal' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: d.rankSize }}>{rank}</span>
      <span style={{ fontSize: d.suitSize, marginTop: 1 }}>{suit}</span>
    </div>
  )
}

const styles = {
  page: {
    background: '#000',
    color: '#fff',
    fontFamily: "'IBM Plex Sans', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: '120vw',
    height: '120vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,74,74,0.6) 0%, rgba(19,53,56,0.3) 40%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: 420,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, textAlign: 'center', marginTop: '40vh' },

  // Header
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16, padding: '0 4px',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  sessionName: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  logo: { fontSize: 16, fontWeight: 700, color: '#89F1EC', letterSpacing: -0.5 },

  // Summary card
  summaryCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    background: '#131616', borderRadius: 18, padding: 14, marginBottom: 16,
  },
  statCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: 600, color: '#89F1EC', textAlign: 'center' },
  statLabel: { fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  dividerV: { width: 1, height: 32, background: 'rgba(255,255,255,0.1)' },

  // Cards grid
  cardsGrid: { display: 'flex', gap: 12, marginBottom: 16 },
  cardsBox: {
    flex: 1, background: '#131616', borderRadius: 18, padding: 12,
    border: '1px solid',
  },
  cardsBoxHeader: {
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
  },

  // Street sections
  streetSection: { background: '#131616', borderRadius: 18, marginBottom: 14, overflow: 'hidden' },
  streetHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, background: 'rgba(255,255,255,0.05)',
  },
  streetName: {
    fontSize: 13, fontWeight: 700, color: '#89F1EC', letterSpacing: 1,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  potBadge: {
    fontSize: 11, fontWeight: 600, color: '#89F1EC',
    padding: '4px 10px', borderRadius: 10,
    background: 'rgba(137,241,236,0.1)', border: '1px solid rgba(137,241,236,0.3)',
  },

  // Action table
  actionTable: { padding: 10 },
  actionTableRow: { display: 'flex', alignItems: 'center', padding: '4px 0' },
  colHeader: {
    fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5, paddingBottom: 8,
  },

  // CTA
  cta: { marginTop: 28, textAlign: 'center', paddingBottom: 24 },
  ctaButton: {
    display: 'inline-block', background: '#89F1EC', color: '#000',
    padding: '14px 32px', borderRadius: 60, fontWeight: 600, fontSize: 16,
    textDecoration: 'none', fontFamily: "'IBM Plex Sans', sans-serif",
  },
  ctaTagline: { marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.3)' },
}
