import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, TrendingUp, Check, X, User, MapPin, Clock, ChevronRight } from 'lucide-react'
import { Logo, FadeUp, Avatar, StatusBadge, Stars, Divider } from '../components/UI.jsx'
import { useBookings, useAssistants } from '../hooks/useStore.js'
import { formatDuration } from '../data/index.js'

const PAY_STATUS = {
  paid: { label: 'Paid', color: '#4ADE80' },
  cash_on_arrival: { label: 'Cash on arrival', color: '#FBBF24' },
  pending: { label: 'Awaiting payment', color: 'rgba(255,255,255,0.72)' },
}

function StatCard({ label, value, sub, color = '#EC2461' }) {
  return (
    <div className="cs-card p-4">
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 28, color }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: 300 }}>{sub}</p>}
    </div>
  )
}

function AdminBookingRow({ booking, assistants, onAssign, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const assigned = assistants.find(a => a.id === booking.assistant)

  return (
    <div className="cs-card mb-3">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p style={{ fontWeight: 500, fontSize: 14 }}>{booking.id}</p>
            <StatusBadge status={booking.status} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
            {booking.customer?.name} · {booking.tasks?.length || 0} task{(booking.tasks?.length || 0) === 1 ? '' : 's'} · {booking.area}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="font-display italic" style={{ fontSize: 17, fontWeight: 600, color: '#EC2461' }}>GH₵ {booking.total?.toLocaleString()}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{booking.date}</p>
        </div>
      </div>
      {/* Desktop-only quick detail — visible without expanding */}
      <div className="cs-row-extra" style={{ padding: '0 16px 14px', gap: 24, flexWrap: 'wrap' }}>
        {[
          ['Phone', booking.customer?.phone || '—'],
          ['Start', booking.timeSlot || '—'],
          ['Est.', formatDuration(booking.estMins || 0)],
          ['Payment', (booking.paymentLabel || booking.payment || '—')],
          ['Pay status', PAY_STATUS[booking.paymentStatus]?.label || 'Awaiting payment'],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>{val}</p>
          </div>
        ))}
      </div>
      {expanded && (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Customer</p>
              <p style={{ fontSize: 13, fontWeight: 300 }}>{booking.customer?.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>{booking.customer?.phone}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Service</p>
              <p style={{ fontSize: 13, fontWeight: 300 }}>{booking.tasks?.length || 0} tasks · est. {formatDuration(booking.estMins || 0)}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>{booking.timeSlot}</p>
            </div>
          </div>
          <div className="mb-3">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Payment</p>
            <p style={{ fontSize: 13, fontWeight: 300 }}>
              {booking.paymentLabel || booking.payment || '—'}
              {' · '}
              <span style={{ color: PAY_STATUS[booking.paymentStatus]?.color || 'rgba(255,255,255,0.72)' }}>
                {PAY_STATUS[booking.paymentStatus]?.label || 'Awaiting payment'}
              </span>
            </p>
          </div>
          <div className="mb-3">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Assigned assistant</p>
            {assigned ? (
              <div className="flex items-center gap-2">
                <Avatar initials={assigned.avatar} size={28} />
                <span style={{ fontSize: 13 }}>{assigned.name}</span>
              </div>
            ) : (
              <select className="cs-input" style={{ fontSize: 13 }} onChange={e => onAssign(booking.id, e.target.value)} defaultValue="">
                <option value="">Unassigned — select assistant</option>
                {assistants.filter(a => a.status === 'available').map(a => (
                  <option key={a.id} value={a.id}>{a.name} · {a.area}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            {booking.status === 'pending' && (
              <button className="cs-btn-primary" onClick={() => onUpdate(booking.id, { status: 'accepted' })}
                style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: 13 }}>
                <Check size={14} /> Accept
              </button>
            )}
            {booking.status === 'accepted' && (
              <button onClick={() => onUpdate(booking.id, { status: 'inprogress' })}
                style={{ flex: 1, background: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: 11, fontSize: 13, color: '#60A5FA', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Mark In Progress
              </button>
            )}
            {booking.status === 'inprogress' && (
              <button onClick={() => onUpdate(booking.id, { status: 'completed' })}
                style={{ flex: 1, background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)', borderRadius: 12, padding: 11, fontSize: 13, color: '#4ADE80', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Mark Completed ✓
              </button>
            )}
            {!['completed','cancelled'].includes(booking.status) && (
              <button onClick={() => onUpdate(booking.id, { status: 'cancelled' })}
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { bookings, updateBooking } = useBookings()
  const { assistants } = useAssistants()
  const [tab, setTab] = useState('overview')

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total || 0), 0)
  const pending = bookings.filter(b => b.status === 'pending')
  const active = bookings.filter(b => ['accepted','inprogress'].includes(b.status))
  const completed = bookings.filter(b => b.status === 'completed')

  const tabs = [['overview','Overview'],['bookings','Bookings'],['assistants','Assistants']]

  return (
    <div className="cs-admin">
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <Logo size="sm" />
        <span className="cs-badge">Admin</span>
      </div>

      {/* Desktop: side nav left + content right. Mobile: top tabs + content. */}
      <div className="cs-admin-layout" style={{ padding: '16px 24px' }}>
      <div className="cs-admin-tabs">
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className="cs-admin-tab"
            style={{ padding: '10px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.2s',
              background: tab === v ? '#EC2461' : 'transparent', color: tab === v ? '#fff' : 'rgba(255,255,255,0.7)' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="cs-admin-content">
        {tab === 'overview' && (
          <FadeUp>
            <div className="cs-admin-stats" style={{ marginBottom: 20 }}>
              <StatCard label="Total bookings" value={bookings.length} />
              <StatCard label="Revenue" value={`GH₵ ${totalRevenue.toLocaleString()}`} />
              <StatCard label="Pending" value={pending.length} color="#FBBF24" />
              <StatCard label="Active" value={active.length} color="#60A5FA" />
              <StatCard label="Completed" value={completed.length} color="#4ADE80" />
              <StatCard label="Assistants" value={assistants.length} />
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pending bookings requiring action</p>
            {pending.length === 0 ? (
              <div className="cs-card p-5 text-center">
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>No pending bookings</p>
              </div>
            ) : pending.slice(0, 3).map(b => (
              <AdminBookingRow key={b.id} booking={b} assistants={assistants}
                onAssign={(id, aid) => updateBooking(id, { assistant: aid })}
                onUpdate={updateBooking} />
            ))}
          </FadeUp>
        )}

        {tab === 'bookings' && (
          <FadeUp>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>All bookings ({bookings.length})</p>
            {bookings.map(b => (
              <AdminBookingRow key={b.id} booking={b} assistants={assistants}
                onAssign={(id, aid) => updateBooking(id, { assistant: aid })}
                onUpdate={updateBooking} />
            ))}
          </FadeUp>
        )}

        {tab === 'assistants' && (
          <FadeUp>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Assistants ({assistants.length})</p>
            {assistants.map(a => (
              <div key={a.id} className="cs-card p-4 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={a.avatar} size={44} />
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 15 }}>{a.name}</p>
                    <div className="flex items-center gap-2">
                      <Stars rating={a.rating} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{a.jobs} jobs</span>
                    </div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: a.status === 'available' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                    color: a.status === 'available' ? '#4ADE80' : 'rgba(255,255,255,0.6)',
                    border: `0.5px solid ${a.status === 'available' ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                    {a.status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>{a.area}</span>
                </div>
                {a.skills && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {a.skills.map(s => (
                      <span key={s} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 11, padding: '3px 9px', color: 'rgba(255,255,255,0.65)' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </FadeUp>
        )}
      </div>
      </div>
    </div>
  )
}
