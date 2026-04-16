import { useState, useEffect, forwardRef } from 'react'

const colorVariants = {
  default: {
    outer: 'linear-gradient(to bottom, #000, #A0A0A0)',
    inner: 'linear-gradient(to bottom, #FAFAFA, #3E3E3E, #E5E5E5)',
    button: 'linear-gradient(to bottom, #B9B9B9, #969696)',
    color: '#fff',
    textShadow: '0 -1px 0 rgb(80 80 80)',
  },
  primary: {
    outer: 'linear-gradient(to bottom, #000, #A0A0A0)',
    inner: 'linear-gradient(to bottom, #A2F69A, #6bbf65, #c8f0c4)',
    button: 'linear-gradient(to bottom, #A2F69A, rgba(162,246,154,0.4))',
    color: '#fff',
    textShadow: '0 -1px 0 rgb(30 58 138)',
  },
  gold: {
    outer: 'linear-gradient(to bottom, #917100, #EAD98F)',
    inner: 'linear-gradient(to bottom, #FFFDDD, #856807, #FFF1B3)',
    button: 'linear-gradient(to bottom, #FFEBA1, #9B873F)',
    color: '#FFFDE5',
    textShadow: '0 -1px 0 rgb(178 140 2)',
  },
}

function ShineEffect({ isPressed }) {
  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        overflow: 'hidden',
        borderRadius: 6,
        opacity: isPressed ? 0.2 : 0,
        transition: 'opacity 300ms',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 6,
        background: 'linear-gradient(to right, transparent, #f5f5f5, transparent)',
      }} />
    </div>
  )
}

const TRANSITION = 'all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)'

const MetalButton = forwardRef(function MetalButton(
  { children, variant = 'default', href, onClick, style, ...props },
  ref
) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const colors = colorVariants[variant] || colorVariants.default

  const wrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 8,
    padding: '1.25px',
    background: colors.outer,
    boxShadow: isPressed
      ? '0 1px 2px rgba(0,0,0,0.15)'
      : isHovered && !isTouchDevice
        ? '0 4px 12px rgba(0,0,0,0.12)'
        : '0 3px 8px rgba(0,0,0,0.08)',
    transform: isPressed ? 'translateY(2.5px) scale(0.99)' : 'translateY(0) scale(1)',
    transition: TRANSITION,
    transformOrigin: 'center center',
    willChange: 'transform',
    cursor: 'pointer',
    textDecoration: 'none',
    ...style,
  }

  const innerStyle = {
    position: 'absolute',
    inset: 1,
    borderRadius: 7,
    background: colors.inner,
    transition: TRANSITION,
    filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.05)' : 'none',
    pointerEvents: 'none',
  }

  const btnStyle = {
    position: 'relative',
    zIndex: 10,
    margin: 1,
    borderRadius: 6,
    display: 'inline-flex',
    height: 44,
    padding: '0 24px',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: colors.button,
    color: colors.color,
    textShadow: colors.textShadow,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1,
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
    border: 'none',
    cursor: 'pointer',
    willChange: 'transform',
    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
    transition: TRANSITION,
    filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.02)' : 'none',
  }

  const handlers = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseEnter: () => { if (!isTouchDevice) setIsHovered(true) },
    onMouseLeave: () => { setIsPressed(false); setIsHovered(false) },
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    onTouchCancel: () => setIsPressed(false),
  }

  // Render as <a> when href is provided, otherwise <div> wrapper + <button>
  if (href) {
    return (
      <a href={href} style={wrapperStyle} {...handlers}>
        <div style={innerStyle} />
        <span style={btnStyle}>
          <ShineEffect isPressed={isPressed} />
          {children}
        </span>
      </a>
    )
  }

  return (
    <div style={wrapperStyle} {...handlers}>
      <div style={innerStyle} />
      <button ref={ref} style={btnStyle} onClick={onClick} {...props}>
        <ShineEffect isPressed={isPressed} />
        {children}
        {isHovered && !isPressed && !isTouchDevice && (
          <div style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
            background: 'linear-gradient(to top, transparent, rgba(255,255,255,0.05))',
          }} />
        )}
      </button>
    </div>
  )
})

export default MetalButton
