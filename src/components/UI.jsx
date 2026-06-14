import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ChevronLeft, Star } from 'lucide-react'
import { getStatusLabel } from '../data/index.js'

export function Logo({ size = 'md', linkTo = '/' }) {
  const cls = size === 'lg'
    ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  return (
    <Link to={linkTo} className={`font-display italic font-semibold ${cls} tracking-tight`}>
      <span className="text-white">Club</span><span style={{color:'#EC2461'}}>Scrub</span>
    </Link>
  )
}

export function Avatar({ initials, size = 48, color = '#EC2461' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(236,36,97,0.12)',
      border: '1.5px solid rgba(236,36,97,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
      fontSize: size * 0.35, color, fontWeight: 600, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`status-${status.replace(' ', '').toLowerCase()} text-xs font-medium px-2.5 py-1 rounded-full`}
      style={{ border: '0.5px solid', fontSize: 11 }}>
      {getStatusLabel(status)}
    </span>
  )
}

export function BackButton({ label = 'Back' }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)}
      className="flex items-center gap-1.5 text-sm font-light mb-6"
      style={{ color: 'rgba(255,255,255,0.5)' }}>
      <ChevronLeft size={16} /> {label}
    </button>
  )
}

export function Stars({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm" style={{ color: '#EC2461' }}>
      <Star size={13} fill="#EC2461" /> {rating}
    </span>
  )
}

export function SectionLabel({ children }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest mb-3"
      style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
      {children}
    </p>
  )
}

export function Card({ children, className = '', selected, onClick, style }) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`cs-card ${selected ? 'selected' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function Divider() {
  return <div style={{ height: 0.5, background: 'rgba(255,255,255,0.07)', margin: '1.5rem 0' }} />
}

export function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function CustomerNav() {
  const loc = useLocation()
  // Customer-facing nav: Home | Book (centre FAB) only.
  // /admin, /dashboard and /assistant routes still exist — reachable by direct
  // URL — they're just not surfaced in the nav.
  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/book', icon: null, label: 'Book', primary: true },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#141414', borderTop: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 max(10px, env(safe-area-inset-bottom))',
      zIndex: 50, maxWidth: 680, margin: '0 auto'
    }}>
      {tabs.map(t => {
        const active = loc.pathname === t.path
        if (t.primary) return (
          <Link key={t.path} to={t.path}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: '#EC2461', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginTop: -16,
              boxShadow: '0 0 24px rgba(236,36,97,0.35)'
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 20, color: '#fff', fontWeight: 600 }}>+</span>
            </div>
          </Link>
        )
        const Icon = t.icon
        return (
          <Link key={t.path} to={t.path}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
            <Icon size={20} color={active ? '#EC2461' : 'rgba(255,255,255,0.4)'} />
            <span style={{ fontSize: 10, color: active ? '#EC2461' : 'rgba(255,255,255,0.35)', fontWeight: active ? 500 : 400 }}>
              {t.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function PageLayout({ children, nav = true }) {
  return (
    <div style={{ minHeight: '100vh', maxWidth: 680, margin: '0 auto', paddingBottom: nav ? 90 : 0 }}>
      {children}
      {nav && <CustomerNav />}
    </div>
  )
}

export function PriceRow({ label, value, accent, small }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '6px 0' }}>
      <span style={{ fontSize: small ? 12 : 14, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>{label}</span>
      <span style={{ fontSize: small ? 13 : 15, color: accent ? '#EC2461' : '#fff', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export function InfoBox({ title, children }) {
  return (
    <div className="cs-card p-4">
      {title && <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{title}</p>}
      {children}
    </div>
  )
}
