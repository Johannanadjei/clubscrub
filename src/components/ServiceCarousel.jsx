import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Self-contained full-width coverflow carousel of ClubScrub service categories.
// Each card is a photo (with service name + description baked into the image) under
// /carousel/*.jpg; the gradient is a fallback behind the image plus a bottom overlay
// to keep the baked-in text legible.
// Visible cards scale with the viewport: 5 on desktop, 3 on tablet, ~1.5 on mobile.

const SERVICES = [
  { name: 'General Cleaning',     bg: 'linear-gradient(135deg, #14271b 0%, #060807 100%)', img: '/carousel/general-cleaning.jpg' },
  { name: 'Kitchen Support',      bg: 'linear-gradient(135deg, #1f2933 0%, #0c0f12 100%)', img: '/carousel/kitchen-support.jpg' },
  { name: 'Dishwashing',          bg: 'linear-gradient(135deg, #14271b 0%, #060807 100%)', img: '/carousel/dishwashing.jpg' },
  { name: 'Laundry & Ironing',    bg: 'linear-gradient(135deg, #262814 0%, #0b0c05 100%)', img: '/carousel/laundry-ironing.jpg' },
  { name: 'Bedding & Linen Care', bg: 'linear-gradient(135deg, #0d2b2b 0%, #050a0a 100%)', img: '/carousel/bedding-linen.jpg' },
  { name: 'Home Organisation',    bg: 'linear-gradient(135deg, #111b33 0%, #05070d 100%)', img: '/carousel/home-organisation.jpg' },
]

const N = SERVICES.length

// Per-breakpoint geometry. `side` = how many cards show on EACH side of centre.
function readConfig() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  if (w >= 1024) return { cardW: 280, cardH: 420, spacing: 264, side: 2 }   // 5 visible
  if (w >= 768)  return { cardW: 256, cardH: 384, spacing: 232, side: 1 }   // 3 visible
  return { cardW: 220, cardH: 330, spacing: 150, side: 1 }                  // ~1.5 visible
}

const arrowStyle = (side) => ({
  position: 'absolute', top: '50%', [side]: 12, transform: 'translateY(-50%)',
  width: 44, height: 44, borderRadius: '50%',
  background: 'rgba(20,20,20,0.85)', border: '0.5px solid rgba(255,255,255,0.15)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 20, backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
})

export default function ServiceCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cfg, setCfg] = useState(readConfig)
  const touchX = useRef(null)

  const step = useCallback((dir) => setActive(a => (a + dir + N) % N), [])
  const goto = (i) => setActive(((i % N) + N) % N)

  // Track viewport for responsive geometry.
  useEffect(() => {
    const onResize = () => setCfg(readConfig())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Auto-advance every 4s; pause on hover; respect reduced-motion.
  useEffect(() => {
    if (paused) return
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setActive(a => (a + 1) % N), 4000)
    return () => clearInterval(id)
  }, [paused])

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="ClubScrub service categories"
    >
      <div
        style={{ position: 'relative', height: cfg.cardH }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SERVICES.map((s, i) => {
          // Circular distance from the active card, normalised to [-N/2, N/2].
          let d = i - active
          if (d > N / 2) d -= N
          if (d < -N / 2) d += N
          const abs = Math.abs(d)
          const visible = abs <= cfg.side
          const scale = d === 0 ? 1 : abs === 1 ? 0.86 : 0.72
          const opacity = !visible ? 0 : d === 0 ? 1 : abs === 1 ? 0.6 : 0.3
          const offset = d * cfg.spacing

          return (
            <div
              key={s.name}
              aria-hidden={d !== 0}
              onClick={() => visible && d !== 0 && goto(i)}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: cfg.cardW, height: cfg.cardH,
                transform: `translate(calc(-50% + ${offset}px), -50%) scale(${scale})`,
                opacity,
                zIndex: 10 - abs,
                transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease',
                borderRadius: 22, overflow: 'hidden',
                background: s.bg,
                border: '0.5px solid rgba(255,255,255,0.1)',
                boxShadow: d === 0 ? '0 28px 70px rgba(0,0,0,0.6)' : 'none',
                cursor: visible && d !== 0 ? 'pointer' : 'default',
                pointerEvents: visible ? 'auto' : 'none',
              }}
            >
              {/* Photo */}
              <img
                src={s.img}
                alt={s.name}
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              />
              {/* Bottom overlay gradient — helps the baked-in label/description in each photo read clearly */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.25) 48%, transparent 72%)' }} />
            </div>
          )
        })}

        {/* Manual navigation */}
        <button type="button" onClick={() => step(-1)} aria-label="Previous service" style={arrowStyle('left')}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next service" style={arrowStyle('right')}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {SERVICES.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => goto(i)}
            aria-label={`Show ${s.name}`}
            aria-current={i === active}
            style={{
              width: i === active ? 24 : 8, height: 8, borderRadius: 4,
              border: 'none', padding: 0, cursor: 'pointer',
              background: i === active ? '#EC2461' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease', WebkitTapHighlightColor: 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}
