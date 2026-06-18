import React from 'react'
import { Link } from 'react-router-dom'
import { Logo, FadeUp } from '../components/UI.jsx'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <Logo size="md" />
      </div>
      <FadeUp>
        <p className="font-display italic" style={{ fontSize: 'clamp(80px, 22vw, 140px)', fontWeight: 600, color: '#EC2461', lineHeight: 1 }}>404</p>
      </FadeUp>
      <FadeUp delay={0.05}>
        <h1 className="font-display italic" style={{ fontSize: 28, fontWeight: 500, marginBottom: 10 }}>Page not found</h1>
      </FadeUp>
      <FadeUp delay={0.1}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', fontWeight: 300, lineHeight: 1.7, maxWidth: 360, marginBottom: 28 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </FadeUp>
      <FadeUp delay={0.15}>
        <Link to="/">
          <button className="cs-btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>Go Home</button>
        </Link>
        <div style={{ marginTop: 16 }}>
          <Link to="/book" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Book Now</Link>
        </div>
      </FadeUp>
    </div>
  )
}
