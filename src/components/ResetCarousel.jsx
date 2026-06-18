import React from 'react'
import { RESETS } from '../data/index.js'

// Premium grid of Signature Reset cards. Each card is a full-bleed landscape
// photo (1200x900 / 4:3 ratio held with the padding-bottom trick) with a dark
// bottom gradient, the reset name + description bottom-left, and a subtle pink
// "Signature Reset" pill top-right. Clicking a card fires onSelect(reset).
// 2-column grid on desktop, single column on mobile. Images live at /resets/*.jpg
// and fall back to a muted grey background until uploaded.

export default function ResetCarousel({ onSelect }) {
  return (
    <div className="cs-reset-grid">
      {RESETS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect && onSelect(r)}
          aria-label={`${r.name} — ${r.description}`}
          style={{
            position: 'relative', width: '100%', display: 'block', padding: 0,
            border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20,
            overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
            background: '#1a1a1a', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Aspect-ratio box: 1200x900 → padding-bottom 75% */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '75%' }}>
            {/* Full-bleed image */}
            <img
              src={r.img}
              alt={r.name}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />

            {/* Dark gradient overlay from bottom */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)' }} />

            {/* Pink pill — top right */}
            <span style={{
              position: 'absolute', top: 14, right: 14, zIndex: 2,
              background: 'rgba(236,36,97,0.9)', color: '#fff',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              padding: '5px 12px', borderRadius: 100,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Signature Reset
            </span>

            {/* Name + description — bottom left */}
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16, zIndex: 2 }}>
              <p className="font-display italic" style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>
                {r.name}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>
                {r.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
