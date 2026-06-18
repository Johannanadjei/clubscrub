import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cs_cookie_ok'

export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  // Only show if the user hasn't already accepted. Read inside an effect so we
  // never touch localStorage during SSR / first render.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true)
    } catch {
      // localStorage unavailable (private mode, etc.) — show the notice anyway.
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Ignore write failures — still hide the bar for this session.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#000', borderTop: '0.5px solid rgba(255,255,255,0.1)',
        padding: '16px 20px max(16px, env(safe-area-inset-bottom))',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
        gap: 14,
      }}
    >
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
        We use essential cookies to make ClubScrub work. By continuing, you agree to our use of cookies. Read our{' '}
        <Link to="/privacy" style={{ color: '#EC2461', textDecoration: 'none' }}>Privacy Policy</Link>.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button className="cs-btn-primary" onClick={accept} style={{ padding: '8px 18px', fontSize: 13 }}>Got it</button>
        <Link to="/privacy" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Learn more</Link>
      </div>
    </div>
  )
}
