import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './lib/firebase'

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

  // Streets that were DEALT but have no recorded actions are an all-in
  // run-out — players were already all-in on an earlier street. Collapse
  // their cards into one BOARD strip (mirrors the app's hand details).
  // Covers preflop, flop AND turn all-ins; previously only the preflop
  // case rendered, so run-out cards were missing from shared hands.
  const flopIsRunout = flop.length > 0 && !(streets.flop || []).length
  const turnIsRunout = !!turn && !(streets.turn || []).length
  const riverIsRunout = !!river && !(streets.river || []).length
  const runoutCards = []
  if (flopIsRunout) runoutCards.push(...flop)
  if (turnIsRunout) runoutCards.push(turn)
  if (riverIsRunout) runoutCards.push(river)
  const showBoardSection = runoutCards.length > 0
  // Single-street run-out keeps its street name (all-in on the turn shows
  // just the river card → "RIVER"); multi-street run-outs are "RUNOUT".
  const runoutLabel = riverIsRunout && !turnIsRunout && !flopIsRunout ? 'RIVER'
    : turnIsRunout && !riverIsRunout && !flopIsRunout ? 'TURN'
    : 'RUNOUT'

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

        {/* All-in run-out board strip (streets dealt with no actions) */}
        {showBoardSection && (
          <div style={styles.streetSection}>
            <div style={styles.streetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={styles.streetName}>{runoutLabel}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {runoutCards.map((c, i) => <PlayingCard key={i} card={c} size="tiny" />)}
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
          <p style={styles.ctaTagline}>Track your poker hands — available on iOS &amp; Android</p>
          <div style={styles.ctaButtons}>
            <a href="https://apps.apple.com/us/app/final-table/id6760188970" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" style={styles.ctaBadgeLink} data-fast-goal="click_app_store" data-fast-goal-placement="hand_viewer">
              <svg width="130" height="44" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <a href="https://play.google.com/store/apps/details?id=com.finaltable.app" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" style={styles.ctaBadgeLink} data-fast-goal="click_play_store" data-fast-goal-placement="hand_viewer">
              <svg width="130" height="44" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="135" height="40" rx="7" fill="black"/>
                <path d="M68.136 21.7511C65.784 21.7511 63.867 23.5401 63.867 26.0041C63.867 28.4531 65.784 30.2571 68.136 30.2571C70.489 30.2571 72.406 28.4531 72.406 26.0041C72.405 23.5401 70.488 21.7511 68.136 21.7511ZM68.136 28.5831C66.847 28.5831 65.736 27.5201 65.736 26.0051C65.736 24.4741 66.848 23.4271 68.136 23.4271C69.425 23.4271 70.536 24.4741 70.536 26.0051C70.536 27.5191 69.425 28.5831 68.136 28.5831ZM58.822 21.7511C56.47 21.7511 54.553 23.5401 54.553 26.0041C54.553 28.4531 56.47 30.2571 58.822 30.2571C61.175 30.2571 63.092 28.4531 63.092 26.0041C63.092 23.5401 61.175 21.7511 58.822 21.7511ZM58.822 28.5831C57.533 28.5831 56.422 27.5201 56.422 26.0051C56.422 24.4741 57.534 23.4271 58.822 23.4271C60.111 23.4271 61.222 24.4741 61.222 26.0051C61.223 27.5191 60.111 28.5831 58.822 28.5831ZM47.744 23.0571V24.8611H52.062C51.933 25.8761 51.595 26.6171 51.079 27.1321C50.451 27.7601 49.468 28.4531 47.744 28.4531C45.086 28.4531 43.008 26.3101 43.008 23.6521C43.008 20.9941 45.086 18.8511 47.744 18.8511C49.178 18.8511 50.225 19.4151 50.998 20.1401L52.271 18.8671C51.191 17.8361 49.758 17.0471 47.744 17.0471C44.103 17.0471 41.042 20.0111 41.042 23.6521C41.042 27.2931 44.103 30.2571 47.744 30.2571C49.709 30.2571 51.192 29.6121 52.351 28.4041C53.543 27.2121 53.914 25.5361 53.914 24.1831C53.914 23.7651 53.882 23.3781 53.817 23.0561H47.744V23.0571ZM93.052 24.4581C92.698 23.5081 91.618 21.7511 89.411 21.7511C87.22 21.7511 85.399 23.4751 85.399 26.0041C85.399 28.3881 87.204 30.2571 89.62 30.2571C91.569 30.2571 92.697 29.0651 93.165 28.3721L91.715 27.4051C91.232 28.1141 90.571 28.5811 89.62 28.5811C88.67 28.5811 87.993 28.1461 87.558 27.2921L93.245 24.9401L93.052 24.4581ZM87.252 25.8761C87.204 24.2321 88.525 23.3951 89.476 23.3951C90.217 23.3951 90.845 23.7661 91.055 24.2971L87.252 25.8761ZM82.629 30.0001H84.497V17.4991H82.629V30.0001ZM79.567 22.7021H79.503C79.084 22.2021 78.278 21.7511 77.264 21.7511C75.137 21.7511 73.188 23.6201 73.188 26.0211C73.188 28.4051 75.137 30.2581 77.264 30.2581C78.279 30.2581 79.084 29.8071 79.503 29.2921H79.567V29.9041C79.567 31.5311 78.697 32.4011 77.296 32.4011C76.152 32.4011 75.443 31.5801 75.153 30.8871L73.526 31.5641C73.993 32.6911 75.233 34.0771 77.296 34.0771C79.487 34.0771 81.34 32.7881 81.34 29.6461V22.0101H79.568V22.7021H79.567ZM77.425 28.5831C76.136 28.5831 75.057 27.5031 75.057 26.0211C75.057 24.5221 76.136 23.4271 77.425 23.4271C78.697 23.4271 79.696 24.5221 79.696 26.0211C79.696 27.5031 78.697 28.5831 77.425 28.5831ZM101.806 17.4991H97.335V30.0001H99.2V25.2641H101.805C103.873 25.2641 105.907 23.7671 105.907 21.3821C105.907 18.9971 103.874 17.4991 101.806 17.4991ZM101.854 23.5241H99.2V19.2391H101.854C103.249 19.2391 104.041 20.3941 104.041 21.3821C104.041 22.3501 103.249 23.5241 101.854 23.5241ZM113.386 21.7291C112.035 21.7291 110.636 22.3241 110.057 23.6431L111.713 24.3341C112.067 23.6431 112.727 23.4171 113.418 23.4171C114.383 23.4171 115.364 23.9961 115.38 25.0251V25.1541C115.042 24.9611 114.318 24.6721 113.434 24.6721C111.649 24.6721 109.831 25.6531 109.831 27.4861C109.831 29.1591 111.295 30.2361 112.935 30.2361C114.189 30.2361 114.881 29.6731 115.315 29.0131H115.379V29.9781H117.181V25.1851C117.182 22.9671 115.524 21.7291 113.386 21.7291ZM113.16 28.5801C112.55 28.5801 111.697 28.2741 111.697 27.5181C111.697 26.5531 112.759 26.1831 113.676 26.1831C114.495 26.1831 114.882 26.3601 115.38 26.6011C115.235 27.7601 114.238 28.5801 113.16 28.5801ZM123.743 22.0021L121.604 27.4221H121.54L119.32 22.0021H117.31L120.639 29.5771L118.741 33.7911H120.687L125.818 22.0021H123.743ZM106.937 30.0001H108.802V17.4991H106.937V30.0001Z" fill="white"/>
                <path d="M47.418 10.2429C47.418 11.0809 47.1701 11.7479 46.673 12.2459C46.109 12.8379 45.3731 13.1339 44.4691 13.1339C43.6031 13.1339 42.8661 12.8339 42.2611 12.2339C41.6551 11.6329 41.3521 10.8889 41.3521 10.0009C41.3521 9.11194 41.6551 8.36794 42.2611 7.76794C42.8661 7.16694 43.6031 6.86694 44.4691 6.86694C44.8991 6.86694 45.3101 6.95094 45.7001 7.11794C46.0911 7.28594 46.404 7.50894 46.6381 7.78794L46.111 8.31594C45.714 7.84094 45.167 7.60394 44.468 7.60394C43.836 7.60394 43.29 7.82594 42.829 8.26994C42.368 8.71394 42.1381 9.29094 42.1381 9.99994C42.1381 10.7089 42.368 11.2859 42.829 11.7299C43.29 12.1739 43.836 12.3959 44.468 12.3959C45.138 12.3959 45.6971 12.1729 46.1441 11.7259C46.4341 11.4349 46.602 11.0299 46.647 10.5109H44.468V9.78994H47.375C47.405 9.94694 47.418 10.0979 47.418 10.2429Z" fill="white"/>
                <path d="M52.0281 7.737H49.2961V9.639H51.7601V10.36H49.2961V12.262H52.0281V13H48.5251V7H52.0281V7.737Z" fill="white"/>
                <path d="M55.279 13H54.508V7.737H52.832V7H56.955V7.737H55.279V13Z" fill="white"/>
                <path d="M59.938 13V7H60.709V13H59.938Z" fill="white"/>
                <path d="M64.1281 13H63.3572V7.737H61.6812V7H65.8042V7.737H64.1281V13Z" fill="white"/>
                <path d="M73.6089 12.225C73.0189 12.831 72.2859 13.134 71.4089 13.134C70.5319 13.134 69.7989 12.831 69.2099 12.225C68.6199 11.619 68.3259 10.877 68.3259 9.99999C68.3259 9.12299 68.6199 8.38099 69.2099 7.77499C69.7989 7.16899 70.5319 6.86499 71.4089 6.86499C72.2809 6.86499 73.0129 7.16999 73.6049 7.77899C74.1969 8.38799 74.4929 9.12799 74.4929 9.99999C74.4929 10.877 74.1979 11.619 73.6089 12.225ZM69.7789 11.722C70.2229 12.172 70.7659 12.396 71.4089 12.396C72.0519 12.396 72.5959 12.171 73.0389 11.722C73.4829 11.272 73.7059 10.698 73.7059 9.99999C73.7059 9.30199 73.4829 8.72799 73.0389 8.27799C72.5959 7.82799 72.0519 7.60399 71.4089 7.60399C70.7659 7.60399 70.2229 7.82899 69.7789 8.27799C69.3359 8.72799 69.1129 9.30199 69.1129 9.99999C69.1129 10.698 69.3359 11.272 69.7789 11.722Z" fill="white"/>
                <path d="M75.5749 13V7H76.513L79.429 11.667H79.4619L79.429 10.511V7H80.1999V13H79.3949L76.344 8.106H76.3109L76.344 9.262V13H75.5749Z" fill="white"/>
                <g filter="url(#filter0_ii_hv)">
                  <path d="M10.4361 7.53803C10.1451 7.84603 9.97314 8.32403 9.97314 8.94303V31.059C9.97314 31.679 10.1451 32.156 10.4361 32.464L10.5101 32.536L22.8991 20.147V20.001V19.855L10.5101 7.46503L10.4361 7.53803Z" fill="url(#paint0_linear_hv)"/>
                  <path d="M27.0279 24.278L22.8989 20.147V20.001V19.855L27.0289 15.725L27.1219 15.778L32.0149 18.558C33.4119 19.352 33.4119 20.651 32.0149 21.446L27.1219 24.226L27.0279 24.278Z" fill="url(#paint1_linear_hv)"/>
                  <g filter="url(#filter1_i_hv)">
                    <path d="M27.122 24.225L22.898 20.001L10.436 32.464C10.896 32.952 11.657 33.012 12.514 32.526L27.122 24.225Z" fill="url(#paint2_linear_hv)"/>
                  </g>
                  <path d="M27.122 15.777L12.514 7.47701C11.657 6.99001 10.896 7.05101 10.436 7.53901L22.899 20.002L27.122 15.777Z" fill="url(#paint3_linear_hv)"/>
                </g>
                <defs>
                  <filter id="filter0_ii_hv" x="9.97314" y="7.14093" width="23.0894" height="25.7207" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="-0.15"/>
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_hv"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="0.15"/>
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/>
                    <feBlend mode="normal" in2="effect1_innerShadow_hv" result="effect2_innerShadow_hv"/>
                  </filter>
                  <filter id="filter1_i_hv" x="10.436" y="20.001" width="16.686" height="12.8607" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="-0.15"/>
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_hv"/>
                  </filter>
                  <linearGradient id="paint0_linear_hv" x1="21.8009" y1="8.70903" x2="5.01895" y2="25.491" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00A0FF"/><stop offset="0.0066" stopColor="#00A1FF"/><stop offset="0.2601" stopColor="#00BEFF"/><stop offset="0.5122" stopColor="#00D2FF"/><stop offset="0.7604" stopColor="#00DFFF"/><stop offset="1" stopColor="#00E3FF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_hv" x1="33.8334" y1="20.001" x2="9.63753" y2="20.001" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFE000"/><stop offset="0.4087" stopColor="#FFBD00"/><stop offset="0.7754" stopColor="#FFA500"/><stop offset="1" stopColor="#FF9C00"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_hv" x1="24.8281" y1="22.2949" x2="2.06964" y2="45.0534" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/>
                  </linearGradient>
                  <linearGradient id="paint3_linear_hv" x1="7.29743" y1="0.176806" x2="17.4597" y2="10.3391" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#32A071"/><stop offset="0.0685" stopColor="#2DA771"/><stop offset="0.4762" stopColor="#15CF74"/><stop offset="0.8009" stopColor="#06E775"/><stop offset="1" stopColor="#00F076"/>
                  </linearGradient>
                </defs>
              </svg>
            </a>
          </div>
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

function SuitIcon({ suit, size, color }) {
  // ♠ spade
  if (suit === '\u2660') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 C50 5 10 35 10 58 C10 72 20 80 33 80 C39 80 44 77 47 73 C45 80 42 86 35 90 L65 90 C58 86 55 80 53 73 C56 77 61 80 67 80 C80 80 90 72 90 58 C90 35 50 5 50 5Z"/>
      </svg>
    )
  }
  // ♥ heart
  if (suit === '\u2665') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 85 C50 85 10 58 10 33 C10 18 21 8 35 8 C42 8 48 12 50 17 C52 12 58 8 65 8 C79 8 90 18 90 33 C90 58 50 85 50 85Z"/>
      </svg>
    )
  }
  // ♦ diamond
  if (suit === '\u2666') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 L92 50 L50 95 L8 50 Z"/>
      </svg>
    )
  }
  // ♣ club
  if (suit === '\u2663') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="28" r="20"/>
        <circle cx="28" cy="62" r="20"/>
        <circle cx="72" cy="62" r="20"/>
        <rect x="43" y="60" width="14" height="32"/>
        <rect x="30" y="88" width="40" height="8" rx="4"/>
      </svg>
    )
  }
  return <span style={{ fontSize: size }}>{suit}</span>
}

function PlayingCard({ card, size = 'normal' }) {
  if (!card) return null
  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  const isRed = suit === '\u2665' || suit === '\u2666'
  const color = isRed ? '#D32F2F' : '#1a1a1a'

  const dims = {
    normal: { width: 34, height: 44, rankSize: 13, suitPx: 14, radius: 6 },
    small:  { width: 28, height: 36, rankSize: 11, suitPx: 11, radius: 5 },
    tiny:   { width: 28, height: 36, rankSize: 11, suitPx: 11, radius: 5 },
  }
  const d = dims[size] || dims.normal

  return (
    <div style={{
      width: d.width, height: d.height, background: '#fff', borderRadius: d.radius,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color, lineHeight: 1,
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: size === 'normal' ? '0 2px 6px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.15)',
      flexShrink: 0,
      gap: 2,
    }}>
      <span style={{ fontSize: d.rankSize }}>{rank}</span>
      <SuitIcon suit={suit} size={d.suitPx} color={color} />
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
  ctaTagline: { marginBottom: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Sans', sans-serif" },
  ctaButtons: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  ctaBadgeLink: {
    display: 'inline-flex', lineHeight: 0, borderRadius: 7,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
    transition: 'opacity 0.15s ease',
  },
}
