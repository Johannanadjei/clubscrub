import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Self-contained coverflow carousel of ClubScrub service categories.
// Used in the Landing hero's right column (cs-hero-right), which is hidden
// below 1024px — so this only ever renders on desktop.
//
// Placeholder backgrounds are CSS gradients in dark brand tones (no real photos).

const SERVICES = [
  { name: 'General Cleaning',     desc: 'Sweeping, mopping, dusting, and maintaining a clean, fresh home', bg: 'linear-gradient(135deg, #14271b 0%, #060807 100%)' },
  { name: 'Kitchen Support',      desc: 'Dishwashing, surface cleaning, and spotless kitchen maintenance', bg: 'linear-gradient(135deg, #1f2933 0%, #0c0f12 100%)' },
  { name: 'Bedding & Linen Care', desc: 'Changing bed sheets and maintaining fresh, crisp linens',          bg: 'linear-gradient(135deg, #0d2b2b 0%, #050a0a 100%)' },
  { name: 'Home Organisation',    desc: 'Tidying spaces, organising wardrobes and shelves',                 bg: 'linear-gradient(135deg, #111b33 0%, #05070d 100%)' },
  { name: 'Laundry & Ironing',    desc: 'Washing, drying, folding, and pressing clothes',                   bg: 'linear-gradient(135deg, #262814 0%, #0b0c05 100%)' },
  { name: 'Errands & Support',    desc: 'Additional household tasks and personal errands',                  bg: 'linear-gradient(135deg, #2a1418 0%, #0c0608 100%)' },
]

const N = SERVICES.length

const arrowStyle = (side) => ({
  position: 'absolute', top: '50%', [side]: -8, transform: 'translateY(-50%)',
  width: 44, height: 44, borderRadius: '50%',
  background: 'rgba(20,20,20,0.85)', border: '0.5px solid rgba(255,255,255,0.15)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 20, backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
})

export default function ServiceCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const step = useCallback((dir) => setActive(a => (a + dir + N) % N), [])
  const goto = (i) => setActive(((i % N) + N) % N)

  // Auto-advance every 4s; pause on hover; respect reduced-motion.
  useEffect(() => {
    if (paused) return
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setActive(a => (a + 1) % N), 4000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="ClubScrub service categories"
    >
      <div style={{ position: 'relative', height: 400 }}>
        {SERVICES.map((s, i) => {
          // Circular distance from the active card, normalised to [-3, 3].
          let d = i - active
          if (d > N / 2) d -= N
          if (d < -N / 2) d += N
          const abs = Math.abs(d)
          const visible = abs <= 2          // centre + 2 each side = 5 visible
          const scale = d === 0 ? 1 : abs === 1 ? 0.84 : 0.7
          const opacity = !visible ? 0 : d === 0 ? 1 : abs === 1 ? 0.55 : 0.28
          const offset = d * 96

          return (
            <div
              key={s.name}
              aria-hidden={d !== 0}
              onClick={() => visible && d !== 0 && goto(i)}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 240, height: 380,
                transform: `translate(calc(-50% + ${offset}px), -50%) scale(${scale})`,
                opacity,
                zIndex: 10 - abs,
                transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease',
                borderRadius: 20, overflow: 'hidden',
                background: s.bg,
                border: '0.5px solid rgba(255,255,255,0.1)',
                boxShadow: d === 0 ? '0 24px 60px rgba(0,0,0,0.55)' : 'none',
                cursor: visible && d !== 0 ? 'pointer' : 'default',
                pointerEvents: visible ? 'auto' : 'none',
              }}
            >
              {/* Bottom overlay gradient */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.25) 46%, transparent 70%)' }} />

              {/* Pink ClubScrub watermark, bottom-right */}
              <span className="font-display italic" style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 13, fontWeight: 600, color: 'rgba(236,36,97,0.85)', letterSpacing: '0.01em', zIndex: 2 }}>
                ClubScrub
              </span>

              {/* Name + description, bottom-left */}
              <div style={{ position: 'absolute', left: 18, right: 80, bottom: 16, zIndex: 2 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 5, lineHeight: 1.2 }}>{s.name}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)', fontWeight: 300, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
        {SERVICES.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => goto(i)}
            aria-label={`Show ${s.name}`}
            aria-current={i === active}
            style={{
              width: i === active ? 22 : 8, height: 8, borderRadius: 4,
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
