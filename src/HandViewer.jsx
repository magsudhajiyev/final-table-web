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
          <p style={styles.ctaTagline}>Track your poker hands — available on iOS &amp; Android</p>
          <div style={styles.ctaButtons}>
            <a href="https://apps.apple.com/us/app/final-table/id6760188970" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" style={styles.ctaBadgeLink}>
              <svg width="130" height="44" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" rx="7" fill="black"/>
                <path d="M22.6791 20.3007C22.6888 19.4611 22.9174 18.6388 23.3427 17.9157C23.7681 17.1926 24.3757 16.5935 25.1062 16.177C24.6408 15.509 24.0244 14.9561 23.3065 14.5625C22.5886 14.1688 21.7893 13.9453 20.9713 13.9097C19.2277 13.7265 17.5378 14.9542 16.6498 14.9542C15.7447 14.9542 14.3731 13.9273 12.8978 13.9581C11.9464 13.9893 11.0189 14.2689 10.2064 14.7696C9.39395 15.2703 8.72396 15.9745 8.2627 16.8124C6.26099 20.2316 7.76035 25.2852 9.67865 28.0627C10.6385 29.4227 11.7607 30.9418 13.2347 30.8862C14.6775 30.8251 15.2106 29.9665 16.9475 29.9665C18.6684 29.9665 19.1683 30.8862 20.6736 30.8511C22.2227 30.8251 23.1913 29.4878 24.1183 28.1148C24.8141 27.1289 25.3471 26.0393 25.697 24.8841C24.8026 24.5063 24.0381 23.8733 23.5 23.0633C22.962 22.2533 22.6747 21.3027 22.6791 20.3007Z" fill="white"/>
                <path d="M19.7717 12.0466C20.6099 11.0387 21.0228 9.74125 20.9234 8.43164C19.6376 8.56926 18.4505 9.17895 17.601 10.1425C17.1856 10.6142 16.8685 11.1638 16.668 11.7593C16.4674 12.3549 16.3876 12.9842 16.433 13.611C17.0729 13.6175 17.706 13.4756 18.2818 13.1965C18.8576 12.9175 19.3604 12.5087 19.7517 12.0018L19.7717 12.0466Z" fill="white"/>
                <path d="M42.3 31H40.09L38.875 27.328H34.543L33.387 31H31.234L35.523 18.344H37.999L42.3 31ZM38.465 25.707L37.363 22.434C37.249 22.108 37.033 21.298 36.715 20.003H36.674C36.547 20.554 36.342 21.364 36.058 22.434L34.969 25.707H38.465Z" fill="white"/>
                <path d="M52.7002 26.256C52.7002 27.838 52.2672 29.085 51.4012 29.997C50.6232 30.808 49.6562 31.213 48.5002 31.213C47.2552 31.213 46.3572 30.775 45.8062 29.899H45.7652V34.8H43.7002V24.839C43.7002 23.872 43.6742 22.879 43.6222 21.861H45.4432L45.5552 23.29H45.5962C46.3062 22.192 47.3662 21.643 48.7772 21.643C49.8932 21.643 50.8262 22.069 51.5752 22.921C52.3262 23.774 52.7002 24.888 52.7002 26.256ZM50.5942 26.327C50.5942 25.465 50.3952 24.756 49.9962 24.2C49.5592 23.622 48.9782 23.333 48.2532 23.333C47.7612 23.333 47.3142 23.498 46.9132 23.824C46.5112 24.152 46.2482 24.581 46.1232 25.112C46.0582 25.369 46.0252 25.582 46.0252 25.751V27.25C46.0252 27.893 46.2262 28.437 46.6282 28.882C47.0302 29.327 47.5542 29.549 48.2002 29.549C48.9512 29.549 49.5382 29.265 49.9622 28.699C50.3872 28.132 50.5992 27.321 50.5992 26.263L50.5942 26.327Z" fill="white"/>
                <path d="M63.2002 26.256C63.2002 27.838 62.7672 29.085 61.9012 29.997C61.1232 30.808 60.1562 31.213 59.0002 31.213C57.7552 31.213 56.8572 30.775 56.3062 29.899H56.2652V34.8H54.2002V24.839C54.2002 23.872 54.1742 22.879 54.1222 21.861H55.9432L56.0552 23.29H56.0962C56.8052 22.192 57.8652 21.643 59.2772 21.643C60.3922 21.643 61.3252 22.069 62.0762 22.921C62.8242 23.774 63.2002 24.888 63.2002 26.256ZM61.0942 26.327C61.0942 25.465 60.8952 24.756 60.4962 24.2C60.0592 23.622 59.4802 23.333 58.7542 23.333C58.2612 23.333 57.8142 23.498 57.4132 23.824C57.0112 24.152 56.7482 24.581 56.6232 25.112C56.5592 25.369 56.5252 25.582 56.5252 25.751V27.25C56.5252 27.893 56.7262 28.437 57.1282 28.882C57.5302 29.327 58.0542 29.549 58.7002 29.549C59.4522 29.549 60.0382 29.265 60.4622 28.699C60.8872 28.132 61.0992 27.321 61.0992 26.263L61.0942 26.327Z" fill="white"/>
                <path d="M74.9902 27.398C74.9902 28.495 74.6002 29.391 73.8222 30.085C72.9672 30.842 71.7782 31.22 70.2562 31.22C68.8502 31.22 67.7232 30.949 66.8742 30.407L67.3522 28.664C68.2702 29.219 69.2762 29.498 70.3712 29.498C71.1222 29.498 71.7082 29.326 72.1302 28.984C72.5492 28.641 72.7592 28.182 72.7592 27.609C72.7592 27.099 72.5822 26.666 72.2292 26.312C71.8772 25.957 71.2962 25.629 70.4872 25.326C68.2312 24.484 67.1042 23.262 67.1042 21.663C67.1042 20.601 67.5072 19.728 68.3152 19.044C69.1202 18.359 70.1872 18.017 71.5162 18.017C72.7122 18.017 73.7072 18.228 74.5022 18.649L73.9822 20.352C73.2412 19.944 72.4002 19.74 71.4552 19.74C70.7552 19.74 70.2082 19.914 69.8202 20.26C69.4872 20.572 69.3202 20.953 69.3202 21.405C69.3202 21.9 69.5172 22.311 69.9122 22.639C70.2542 22.938 70.8732 23.265 71.7682 23.621C72.8612 24.055 73.6722 24.566 74.2042 25.152C74.7272 25.737 74.9902 26.489 74.9902 27.404V27.398Z" fill="white"/>
                <path d="M81.8301 23.425H79.5591V27.868C79.5591 29.015 79.9641 29.588 80.7761 29.588C81.1471 29.588 81.4561 29.555 81.7031 29.491L81.7601 31.149C81.3341 31.305 80.7751 31.383 80.0821 31.383C79.2271 31.383 78.5571 31.127 78.0701 30.615C77.5831 30.102 77.3401 29.238 77.3401 28.023V23.425H75.9771V21.787H77.3401V19.991L79.5591 19.326V21.787H81.8291L81.8301 23.425Z" fill="white"/>
                <path d="M92.4199 26.298C92.4199 27.681 92.0189 28.815 91.2169 29.699C90.3749 30.608 89.2579 31.062 87.8659 31.062C86.5219 31.062 85.4519 30.627 84.6559 29.755C83.8589 28.884 83.4609 27.779 83.4609 26.44C83.4609 25.046 83.8699 23.907 84.6909 23.022C85.5109 22.137 86.6189 21.694 88.0129 21.694C89.3569 21.694 90.4369 22.129 91.2489 23.001C92.0299 23.847 92.4199 24.946 92.4199 26.298ZM90.2799 26.363C90.2799 25.536 90.1009 24.831 89.7419 24.247C89.3199 23.543 88.7149 23.191 87.9299 23.191C87.1189 23.191 86.4999 23.543 86.0779 24.247C85.7179 24.832 85.5399 25.549 85.5399 26.405C85.5399 27.232 85.7189 27.937 86.0779 28.521C86.5129 29.225 87.1229 29.577 87.9109 29.577C88.6819 29.577 89.2879 29.218 89.7209 28.501C90.0939 27.905 90.2799 27.192 90.2799 26.363Z" fill="white"/>
                <path d="M99.1802 23.679C98.9762 23.644 98.7592 23.625 98.5332 23.625C97.8332 23.625 97.2892 23.887 96.9022 24.413C96.5682 24.876 96.4012 25.461 96.4012 26.165V31H94.3362V24.709C94.3362 23.668 94.3102 22.72 94.2582 21.862H96.0572L96.1322 23.531H96.1882C96.4062 22.927 96.7602 22.44 97.2512 22.074C97.7272 21.745 98.2432 21.58 98.7972 21.58C98.9882 21.58 99.1612 21.593 99.3142 21.617L99.1802 23.679Z" fill="white"/>
                <path d="M108.66 25.937C108.66 26.304 108.636 26.611 108.588 26.86H102.459C102.483 27.735 102.768 28.407 103.317 28.876C103.816 29.297 104.463 29.507 105.258 29.507C106.136 29.507 106.939 29.368 107.662 29.089L107.973 30.607C107.126 30.98 106.126 31.167 104.971 31.167C103.576 31.167 102.48 30.759 101.682 29.942C100.885 29.126 100.487 28.028 100.487 26.649C100.487 25.295 100.856 24.172 101.596 23.279C102.369 22.326 103.413 21.849 104.727 21.849C106.018 21.849 107.003 22.326 107.68 23.279C108.334 24.165 108.661 25.254 108.661 25.938L108.66 25.937ZM106.692 25.394C106.706 24.802 106.573 24.291 106.295 23.861C105.939 23.308 105.403 23.032 104.685 23.032C104.031 23.032 103.496 23.302 103.083 23.841C102.742 24.272 102.537 24.789 102.468 25.394H106.692Z" fill="white"/>
                <path d="M36.8896 9.15575C36.8896 10.0337 36.6286 10.6977 36.1076 11.1477C35.6236 11.5637 34.9436 11.7717 34.0686 11.7717C33.6356 11.7717 33.2646 11.7527 32.9546 11.7147V6.87375C33.3586 6.80875 33.7926 6.77575 34.2576 6.77575C35.0926 6.77575 35.7226 6.96475 36.1486 7.34275C36.6426 7.76975 36.8896 8.37675 36.8896 9.15575ZM35.8736 9.18075C35.8736 8.64075 35.7286 8.22575 35.4386 7.93475C35.1486 7.64375 34.7246 7.49875 34.1666 7.49875C33.9336 7.49875 33.7366 7.51475 33.5746 7.54775V11.0077C33.6636 11.0217 33.8236 11.0287 34.0556 11.0287C34.6316 11.0287 35.0736 10.8697 35.3816 10.5527C35.6896 10.2357 35.8436 9.77775 35.8436 9.17975L35.8736 9.18075Z" fill="white"/>
                <path d="M42.1401 9.77875C42.1401 10.4158 41.9561 10.9368 41.5881 11.3418C41.2031 11.7588 40.6921 11.9668 40.0541 11.9668C39.4381 11.9668 38.9481 11.7668 38.5771 11.3658C38.2061 10.9648 38.0201 10.4568 38.0201 9.84275C38.0201 9.20175 38.2071 8.67675 38.5831 8.27175C38.9591 7.86675 39.4661 7.66375 40.1041 7.66375C40.7201 7.66375 41.2161 7.86375 41.5951 8.26475C41.9601 8.65375 42.1421 9.15875 42.1421 9.77775L42.1401 9.77875ZM41.1421 9.80875C41.1421 9.42875 41.0581 9.10375 40.8921 8.83275C40.6981 8.50475 40.4211 8.34075 40.0631 8.34075C39.6921 8.34075 39.4091 8.50475 39.2151 8.83275C39.0471 9.10375 38.9631 9.43375 38.9631 9.82675C38.9631 10.2068 39.0481 10.5318 39.2141 10.8028C39.4141 11.1308 39.6931 11.2948 40.0521 11.2948C40.4041 11.2948 40.6821 11.1278 40.8831 10.7938C41.0521 10.5178 41.1401 10.1908 41.1401 9.80775L41.1421 9.80875Z" fill="white"/>
                <path d="M50.3389 7.76575L49.0089 11.8977H48.1289L47.5779 10.0527C47.4329 9.57075 47.3149 9.09175 47.2229 8.61775H47.2049C47.1189 9.10375 47.0009 9.58275 46.8499 10.0527L46.2629 11.8977H45.3729L44.1289 7.76575H45.1189L45.6009 9.78275C45.7219 10.2808 45.8229 10.7558 45.9059 11.2058H45.9239C46.0029 10.8318 46.1239 10.3588 46.2869 9.78575L46.8929 7.76675H47.6749L48.2569 9.74175C48.3979 10.2338 48.5129 10.7188 48.6029 11.2068H48.6299C48.6999 10.7308 48.8019 10.2458 48.9369 9.74175L49.4549 7.76675L50.3389 7.76575Z" fill="white"/>
                <path d="M55.2344 11.8977H54.2664V9.50975C54.2664 8.74975 53.9734 8.36975 53.3874 8.36975C53.1004 8.36975 52.8694 8.47475 52.6914 8.68575C52.5154 8.89675 52.4264 9.14475 52.4264 9.42975V11.8977H51.4584V8.94375C51.4584 8.56375 51.4464 8.15175 51.4224 7.70875H52.2744L52.3184 8.36575H52.3454C52.4574 8.15775 52.6264 7.98575 52.8484 7.84875C53.1134 7.69075 53.4084 7.61075 53.7314 7.61075C54.1374 7.61075 54.4754 7.74075 54.7454 8.00075C55.0704 8.31775 55.2344 8.78675 55.2344 9.40875V11.8977Z" fill="white"/>
                <path d="M57.9463 11.8978H56.9783V6.53979H57.9463V11.8978Z" fill="white"/>
                <path d="M63.7173 9.77875C63.7173 10.4158 63.5333 10.9368 63.1653 11.3418C62.7813 11.7588 62.2693 11.9668 61.6323 11.9668C61.0153 11.9668 60.5253 11.7668 60.1543 11.3658C59.7833 10.9648 59.5973 10.4568 59.5973 9.84275C59.5973 9.20175 59.7843 8.67675 60.1603 8.27175C60.5363 7.86675 61.0433 7.66375 61.6813 7.66375C62.2973 7.66375 62.7933 7.86375 63.1723 8.26475C63.5373 8.65375 63.7193 9.15875 63.7193 9.77775L63.7173 9.77875ZM62.7193 9.80875C62.7193 9.42875 62.6353 9.10375 62.4693 8.83275C62.2753 8.50475 61.9983 8.34075 61.6393 8.34075C61.2693 8.34075 60.9863 8.50475 60.7923 8.83275C60.6233 9.10375 60.5393 9.43375 60.5393 9.82675C60.5393 10.2068 60.6243 10.5318 60.7913 10.8028C60.9913 11.1308 61.2693 11.2948 61.6293 11.2948C61.9813 11.2948 62.2593 11.1278 62.4603 10.7938C62.6293 10.5178 62.7173 10.1908 62.7173 9.80775L62.7193 9.80875Z" fill="white"/>
                <path d="M68.8164 11.8977H67.9394L67.8674 11.4107H67.8404C67.5454 11.8197 67.1184 12.0247 66.5614 12.0247C66.1524 12.0247 65.8224 11.8917 65.5744 11.6267C65.3494 11.3847 65.2364 11.0847 65.2364 10.7297C65.2364 10.1927 65.4624 9.78375 65.9174 9.50375C66.3724 9.22375 67.0124 9.08575 67.8384 9.09375V9.01375C67.8384 8.41375 67.5234 8.11375 66.8934 8.11375C66.4474 8.11375 66.0544 8.22875 65.7134 8.45675L65.5054 7.84375C65.9254 7.57975 66.4364 7.44775 67.0394 7.44775C68.2054 7.44775 68.7904 8.07075 68.7904 9.31575V11.0087C68.7904 11.4397 68.8104 11.7847 68.8504 12.0437L68.8164 11.8977ZM67.8594 10.3877V9.72375C66.7574 9.70575 66.2054 10.0178 66.2054 10.6608C66.2054 10.9008 66.2694 11.0797 66.3994 11.1967C66.5284 11.3147 66.6944 11.3737 66.8924 11.3737C67.1134 11.3737 67.3204 11.3037 67.5084 11.1647C67.6974 11.0257 67.8134 10.8487 67.8554 10.6337C67.8674 10.5837 67.8724 10.5377 67.8724 10.4827L67.8594 10.3877Z" fill="white"/>
                <path d="M74.3857 11.8977H73.5267L73.4787 11.2237H73.4517C73.1807 11.7207 72.7317 11.9687 72.1057 11.9687C71.6197 11.9687 71.2147 11.7737 70.8937 11.3847C70.5717 10.9957 70.4117 10.4877 70.4117 9.86175C70.4117 9.19275 70.5867 8.65375 70.9387 8.24675C71.2787 7.86775 71.6987 7.67875 72.2007 7.67875C72.7587 7.67875 73.1507 7.86575 73.3777 8.24075H73.3957V6.53979H74.3657V10.7587C74.3657 11.1797 74.3737 11.5657 74.3907 11.9177L74.3857 11.8977ZM73.3957 10.1487V9.42375C73.3957 9.30175 73.3867 9.20275 73.3687 9.12475C73.3057 8.85975 73.1647 8.63875 72.9467 8.46075C72.7267 8.28275 72.4677 8.19375 72.1697 8.19375C71.7477 8.19375 71.4177 8.36275 71.1777 8.70175C70.9377 9.04075 70.8187 9.47875 70.8187 10.0167C70.8187 10.5347 70.9307 10.9527 71.1577 11.2717C71.3977 11.6127 71.7267 11.7827 72.1497 11.7827C72.5257 11.7827 72.8237 11.6437 73.0457 11.3647C73.2607 11.1027 73.3697 10.7727 73.3697 10.3847L73.3957 10.1487Z" fill="white"/>
                <path d="M80.7891 9.77875C80.7891 10.4158 80.6051 10.9368 80.2381 11.3418C79.8531 11.7588 79.3401 11.9668 78.7031 11.9668C78.0871 11.9668 77.5971 11.7668 77.2261 11.3658C76.8561 10.9648 76.6691 10.4568 76.6691 9.84275C76.6691 9.20175 76.8561 8.67675 77.2321 8.27175C77.6091 7.86675 78.1151 7.66375 78.7531 7.66375C79.3691 7.66375 79.8651 7.86375 80.2441 8.26475C80.6091 8.65375 80.7911 9.15875 80.7911 9.77775L80.7891 9.77875ZM79.7911 9.80875C79.7911 9.42875 79.7061 9.10375 79.5401 8.83275C79.3461 8.50475 79.0691 8.34075 78.7111 8.34075C78.3401 8.34075 78.0571 8.50475 77.8641 8.83275C77.6941 9.10375 77.6111 9.43375 77.6111 9.82675C77.6111 10.2068 77.6961 10.5318 77.8621 10.8028C78.0621 11.1308 78.3401 11.2948 78.7001 11.2948C79.0521 11.2948 79.3301 11.1278 79.5301 10.7938C79.7001 10.5178 79.7881 10.1908 79.7881 9.80775L79.7911 9.80875Z" fill="white"/>
              </svg>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.finaltable.app" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" style={styles.ctaBadgeLink}>
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
  ctaTagline: { marginBottom: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Sans', sans-serif" },
  ctaButtons: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  ctaBadgeLink: {
    display: 'inline-flex', lineHeight: 0, borderRadius: 7,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
    transition: 'opacity 0.15s ease',
  },
}
