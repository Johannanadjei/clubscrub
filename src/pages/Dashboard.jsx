import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, RotateCcw, X, ChevronRight } from 'lucide-react'
import { PageLayout, Logo, FadeUp, Avatar, StatusBadge, Divider } from '../components/UI.jsx'
import { useBookings, useAssistants } from '../hooks/useStore.js'
import { PRICING, ZONES } from '../data/index.js'

function BookingCard({ booking, assistant, onCancel, onRebook }) {
  const [expanded, setExpanded] = useState(false)
  const p = PRICING[booking.type]
  const canCancel = ['pending', 'accepted'].includes(booking.status)
  const canRebook = booking.status === 'completed' || booking.status === 'cancelled'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="cs-card mb-3 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{p?.label || booking.type}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
              {booking.days} day{booking.days > 1 ? 's' : ''} · {booking.area}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{booking.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{booking.timeSlot}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display italic" style={{ fontSize: 20, fontWeight: 600, color: '#EC2461' }}>
            GH₵ {booking.total?.toLocaleString()}
          </span>
          <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: '16px' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Booking details</p>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>{booking.area} · {ZONES[booking.zone]?.label}</span>
          </div>
          {assistant && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar initials={assistant.avatar} size={28} />
              <span style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>{assistant.name}</span>
            </div>
          )}
          {booking.tasks?.length > 0 && (
            <div className="mb-3">
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Tasks</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {booking.tasks.map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 11, padding: '3px 9px', color: 'rgba(255,255,255,0.45)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Ref</p>
          <p style={{ fontSize: 13, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#EC2461' }}>{booking.id}</p>
          <Divider />
          <div className="flex gap-2">
            {canRebook && (
              <button className="cs-btn-ghost" onClick={() => onRebook(booking)} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                <RotateCcw size={14} /> Rebook
              </button>
            )}
            {canCancel && (
              <button onClick={() => onCancel(booking.id)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', fontSize: 13, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const { bookings, cancelBooking } = useBookings()
  const { assistants } = useAssistants()
  const navigate = useNavigate()
  const [tab, setTab] = useState('upcoming')

  const upcoming = bookings.filter(b => ['pending','accepted','inprogress'].includes(b.status))
  const past = bookings.filter(b => ['completed','cancelled'].includes(b.status))
  const shown = tab === 'upcoming' ? upcoming : past

  const getAssistant = (id) => assistants.find(a => a.id === id)
  const rebook = (b) => navigate('/book')

  return (
    <PageLayout>
      <div style={{ padding: '24px 24px 0' }}>
        <FadeUp>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Logo size="sm" />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontWeight: 300 }}>Your bookings</p>
            </div>
            <button className="cs-btn-primary" onClick={() => navigate('/book')} style={{ padding: '10px 18px', fontSize: 13 }}>
              + New booking
            </button>
          </div>
        </FadeUp>

        {/* Summary cards */}
        <FadeUp delay={0.05}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Upcoming', val: upcoming.length, color: '#EC2461' },
              { label: 'Completed', val: past.filter(b => b.status === 'completed').length, color: '#4ADE80' },
              { label: 'Total spent', val: `GH₵ ${bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total || 0), 0).toLocaleString()}`, color: '#fff' },
            ].map(({ label, val, color }) => (
              <div key={label} className="cs-card p-3 text-center">
                <p style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 600, color }}>{val}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Tabs */}
        <FadeUp delay={0.08}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {[['upcoming','Upcoming'], ['past','Past']].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.2s',
                  background: tab === v ? '#EC2461' : 'transparent', color: tab === v ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                {l}
              </button>
            ))}
          </div>
        </FadeUp>
      </div>

      <div style={{ padding: '0 24px' }}>
        {shown.length === 0 ? (
          <FadeUp>
            <div className="cs-card p-8 text-center">
              <Calendar size={32} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 400, marginBottom: 6 }}>No {tab} bookings</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 20 }}>
                {tab === 'upcoming' ? 'Book your first ClubScrub assistant today.' : 'Your completed bookings will appear here.'}
              </p>
              {tab === 'upcoming' && (
                <button className="cs-btn-primary" onClick={() => navigate('/book')} style={{ padding: '12px 24px', fontSize: 14 }}>
                  Book now
                </button>
              )}
            </div>
          </FadeUp>
        ) : (
          shown.map(b => (
            <BookingCard key={b.id} booking={b}
              assistant={b.assistant ? getAssistant(b.assistant) : null}
              onCancel={cancelBooking} onRebook={rebook} />
          ))
        )}
      </div>
    </PageLayout>
  )
}
