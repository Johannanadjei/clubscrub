import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Logo, FadeUp } from './UI.jsx'

// Simple password gate for /admin.
//
// SECURITY NOTE: this is a *client-side* gate — the expected password ships in
// the bundle via VITE_ADMIN_PASSWORD, so it deters casual access but is not real
// authentication. It satisfies the current "simple password-protected admin"
// scope. When a backend returns, replace this with real server-side auth
// (CLAUDE.md: admin panel must be properly authenticated).
const SESSION_KEY = 'cs_admin_authed'

export default function AdminGate({ children }) {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === 'true' } catch { return false }
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (authed) return children

  const submit = (e) => {
    e.preventDefault()
    const expected = import.meta.env.VITE_ADMIN_PASSWORD
    if (!expected) {
      setError('Admin password is not configured. Set VITE_ADMIN_PASSWORD in your environment.')
      return
    }
    if (password === expected) {
      try { sessionStorage.setItem(SESSION_KEY, 'true') } catch {}
      setAuthed(true)
    } else {
      // Never reveal which part is wrong (CLAUDE.md auth error rule).
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 680, margin: '0 auto',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '24px max(24px, env(safe-area-inset-left)) max(24px, env(safe-area-inset-bottom))',
    }}>
      <FadeUp>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo size="md" />
        </div>
        <div className="cs-card" style={{ padding: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(236,36,97,0.12)', border: '0.5px solid rgba(236,36,97,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
          }}>
            <Lock size={22} style={{ color: '#EC2461' }} />
          </div>
          <h1 className="font-display italic" style={{ fontSize: 28, fontWeight: 600, textAlign: 'center', marginBottom: 6 }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', fontWeight: 300, textAlign: 'center', marginBottom: 24 }}>
            Enter the team password to continue.
          </p>

          <form onSubmit={submit}>
            <label htmlFor="admin-password" style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Password
            </label>
            <input
              id="admin-password"
              className="cs-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
              placeholder="••••••••"
              aria-invalid={!!error}
              aria-describedby={error ? 'admin-password-error' : undefined}
              style={{ minHeight: 48 }}
            />
            {error && (
              <p id="admin-password-error" role="alert" aria-live="polite"
                style={{ fontSize: 13, color: '#EC2461', marginTop: 8 }}>
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="cs-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 18, minHeight: 48 }}
            >
              Unlock admin
            </motion.button>
          </form>
        </div>
      </FadeUp>
    </div>
  )
}
