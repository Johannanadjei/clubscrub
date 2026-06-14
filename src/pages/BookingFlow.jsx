import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, X, AlertCircle, Clock, Sparkles } from 'lucide-react'
import { Logo, FadeUp, PriceRow, Divider } from '../components/UI.jsx'
import {
  ZONES, TASK_GROUPS, QUICK_SELECTS, EXCLUDED_TASKS,
  calcEstimate, formatDuration, taskLabels, getZoneForArea, generateRef,
} from '../data/index.js'
import { useBookings } from '../hooks/useStore.js'
import { payWithPaystack } from '../lib/paystack.js'
import { sendBookingEmails } from '../lib/email.js'

const STEPS = ['Tasks', 'Area', 'Date & Time', 'Summary', 'Your Info', 'Confirmed']

const TIME_SLOTS = ['Morning (from 8am)', 'Afternoon (from 1pm)']

// Payment options. `online` routes through Paystack (card + Mobile Money);
// the others are settled manually and recorded with a payment status.
const PAYMENT_OPTIONS = [
  { id: 'online', label: 'Pay now — Card or Mobile Money', sub: 'Secure checkout via Paystack', online: true, paymentStatus: 'paid' },
  { id: 'cash', label: 'Cash on arrival', sub: 'Pay your assistant on the day', online: false, paymentStatus: 'cash_on_arrival' },
  { id: 'bank', label: 'Bank transfer', sub: "We'll share account details to confirm", online: false, paymentStatus: 'pending' },
]

const allAreas = [
  ...ZONES.zone1.areas.map(a => ({ a, z: 'zone1' })),
  ...ZONES.zone2.areas.map(a => ({ a, z: 'zone2' }))
].sort((x, y) => x.a.localeCompare(y.a))

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: i === step ? 2 : 1, height: 3, borderRadius: 2,
          background: i <= step ? '#EC2461' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.35s ease', opacity: i > step ? 0.5 : 1
        }} />
      ))}
    </div>
  )
}

function StepTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="font-display italic" style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{sub}</p>}
    </div>
  )
}

function OptionCard({ label, sub, selected, onClick }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick}
      className={`cs-card cursor-pointer p-5 mb-3 ${selected ? 'selected' : ''}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
      <div>
        <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 3 }}>{label}</p>
        {sub && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{sub}</p>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: selected ? '#EC2461' : 'transparent',
        border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {selected && <Check size={13} color="#fff" />}
      </div>
    </motion.div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
      {onBack && (
        <button className="cs-btn-ghost" onClick={onBack} style={{ flex: 1, minHeight: 48 }}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <button className="cs-btn-primary" onClick={onNext} disabled={nextDisabled}
        style={{ flex: 2, minHeight: 48, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer', justifyContent: 'center' }}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  )
}

// Live, sticky price/time bar for the tasks step.
function PriceBar({ estimate, onNext }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
      maxWidth: 680, margin: '0 auto',
      background: 'rgba(20,20,20,0.96)', backdropFilter: 'blur(12px)',
      borderTop: '0.5px solid rgba(255,255,255,0.1)',
      padding: '14px 24px max(14px, env(safe-area-inset-bottom))',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
          <Clock size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
            Est. {formatDuration(estimate.mins)}{estimate.mins < 180 ? ' · min. 3h' : ''}
          </span>
        </div>
        <p className="font-display italic" style={{ fontSize: 24, fontWeight: 600, color: '#EC2461', lineHeight: 1 }}>
          GH₵ {estimate.price.toLocaleString()}
        </p>
      </div>
      <button className="cs-btn-primary" onClick={onNext} style={{ minHeight: 48, padding: '0 24px', justifyContent: 'center' }}>
        Continue <ChevronRight size={16} />
      </button>
    </div>
  )
}

// STEP 1: Tasks (quick selects + groups + select all) — drives pricing
function StepTasks({ data, update, onNext }) {
  const selected = data.tasks || []
  const has = (id) => selected.includes(id)
  const toggle = (id) => update({ tasks: has(id) ? selected.filter(t => t !== id) : [...selected, id] })

  const applyQuick = (q) => update({ tasks: [...q.tasks] })
  const isQuickActive = (q) =>
    q.tasks.length === selected.length && q.tasks.every(t => selected.includes(t))

  const toggleGroup = (g) => {
    const ids = g.tasks.map(t => t.id)
    const allOn = ids.every(id => selected.includes(id))
    update({ tasks: allOn ? selected.filter(t => !ids.includes(t)) : [...new Set([...selected, ...ids])] })
  }

  return (
    <FadeUp>
      <div style={{ paddingBottom: 96 }}>
        <StepTitle title="What do you need done?" sub="Pick tasks and we'll estimate the time and price live." />

        {/* Quick selects */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>Quick selects</p>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
          {QUICK_SELECTS.map(q => {
            const active = isQuickActive(q)
            return (
              <motion.button key={q.id} whileTap={{ scale: 0.97 }} onClick={() => applyQuick(q)}
                className={`cs-card ${active ? 'selected' : ''}`}
                style={{ textAlign: 'left', padding: 14, minWidth: 180, flexShrink: 0, cursor: 'pointer', border: 'none' }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
                  <Sparkles size={13} style={{ color: '#EC2461' }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{q.label}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{q.sub}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Task groups */}
        {TASK_GROUPS.map(g => {
          const ids = g.tasks.map(t => t.id)
          const allOn = ids.every(id => selected.includes(id))
          return (
            <div key={g.id} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{g.label}</p>
                <button onClick={() => toggleGroup(g)}
                  style={{ background: 'transparent', border: 'none', color: '#EC2461', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 32, padding: '0 4px' }}>
                  {allOn ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <div className="cs-card">
                {g.tasks.map((t, i) => (
                  <div key={t.id} onClick={() => toggle(t.id)}
                    className="flex items-center justify-between cursor-pointer"
                    style={{ padding: '12px 16px', minHeight: 48, borderBottom: i < g.tasks.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 300 }}>{t.label}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{formatDuration(t.mins)}</span>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: has(t.id) ? '#EC2461' : 'transparent',
                      border: has(t.id) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {has(t.id) && <Check size={12} color="#fff" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {selected.length === 0 && (
          <div className="cs-card p-4" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)' }}>
            <p style={{ fontSize: 13, color: '#FBBF24', fontWeight: 300, lineHeight: 1.6 }}>
              You haven't selected any tasks. You can still continue — your assistant will confirm priorities before the appointment. The minimum 3-hour booking applies.
            </p>
          </div>
        )}
      </div>
      <PriceBar estimate={calcEstimate(selected)} onNext={onNext} />
    </FadeUp>
  )
}

// STEP 2: Area
function StepArea({ data, update, onBack, onNext }) {
  const [search, setSearch] = useState('')
  const filtered = allAreas.filter(({ a }) => a.toLowerCase().includes(search.toLowerCase()))
  return (
    <FadeUp>
      <StepTitle title="Select your area" sub="We service specific zones across Accra." />
      <input className="cs-input mb-4" placeholder="Search your area…" value={search}
        onChange={e => setSearch(e.target.value)} />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {filtered.map(({ a, z }) => (
          <OptionCard key={a} label={a} sub={ZONES[z].label}
            selected={data.area === a}
            onClick={() => update({ area: a, zone: z })} />
        ))}
        {filtered.length === 0 && (
          <div className="cs-card p-5 text-center">
            <AlertCircle size={20} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
              We currently do not service this location.
            </p>
          </div>
        )}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.area} />
    </FadeUp>
  )
}

// STEP 3: Date & Time
function StepDate({ data, update, onBack, onNext }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <FadeUp>
      <StepTitle title="Pick a date & time" sub="Choose when you'd like your assistant to arrive." />
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Date</p>
        <input type="date" className="cs-input" min={today}
          value={data.date || ''}
          onChange={e => update({ date: e.target.value })} />
      </div>
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Preferred start</p>
        {TIME_SLOTS.map(s => (
          <OptionCard key={s} label={s} selected={data.timeSlot === s} onClick={() => update({ timeSlot: s })} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.date || !data.timeSlot} />
    </FadeUp>
  )
}

// STEP 4: Summary
function StepSummary({ data, onBack, onNext }) {
  const est = calcEstimate(data.tasks || [])
  const labels = taskLabels(data.tasks || [])
  return (
    <FadeUp>
      <StepTitle title="Booking summary" sub="Review your booking before continuing." />
      <div className="cs-card p-5 mb-4">
        <PriceRow label="Estimated time" value={formatDuration(est.mins)} />
        <PriceRow label="Area" value={`${data.area} · ${ZONES[data.zone]?.label || ''}`} />
        <PriceRow label="Date" value={data.date} />
        <PriceRow label="Start" value={data.timeSlot} />
        <Divider />
        <PriceRow label={`Service (up to ${3} hrs)`} value={`GH₵ ${349}`} small />
        {est.extraHours > 0 && (
          <PriceRow label={`Extra time (${est.extraHours} hr${est.extraHours > 1 ? 's' : ''} × GH₵ 100)`} value={`GH₵ ${est.extraHours * 100}`} small />
        )}
        <Divider />
        <div className="flex items-center justify-between">
          <span style={{ fontWeight: 500 }}>Total</span>
          <span className="font-display italic" style={{ fontSize: 24, fontWeight: 600, color: '#EC2461' }}>GH₵ {est.total.toLocaleString()}</span>
        </div>
      </div>
      {labels.length > 0 && (
        <div className="cs-card p-4 mb-4">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Selected tasks ({labels.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {labels.map(t => (
              <span key={t} style={{ background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.2)', color: '#EC2461', fontSize: 11, padding: '3px 10px', borderRadius: 8 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      <div className="cs-card p-4 mb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Important reminder</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.6 }}>
          ClubScrub focuses on light home upkeep. Deep cleaning and specialist services are not included.
        </p>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Enter your details" />
    </FadeUp>
  )
}

// STEP 5: Customer info + payment
function StepInfo({ data, update, onBack, onNext, submitting, error }) {
  const info = data.customer || {}
  const set = (k, v) => update({ customer: { ...info, [k]: v } })
  const selectedPay = PAYMENT_OPTIONS.find(o => o.id === data.payment)
  const addressBrief = info.address && info.address.trim().length > 0 && info.address.trim().length < 10
  const valid = info.name && info.email && info.phone && info.address && data.payment
  const est = calcEstimate(data.tasks || [])
  const nextLabel = selectedPay?.online ? `Pay GH₵ ${est.total.toLocaleString()} & confirm` : 'Confirm booking'
  return (
    <FadeUp>
      <StepTitle title="Your information" sub="We'll use this to confirm and coordinate your booking." />
      <div className="cs-card p-5 mb-4">
        {[
          { k: 'name', label: 'Full name', ph: 'e.g. Kwame Asante', type: 'text' },
          { k: 'email', label: 'Email address', ph: 'you@email.com', type: 'email' },
          { k: 'phone', label: 'Phone number', ph: '024 000 0000', type: 'tel' },
          { k: 'address', label: 'Home address', ph: 'House no., street, area', type: 'text' },
        ].map(({ k, label, ph, type }) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
            <input className="cs-input" type={type} placeholder={ph} value={info[k] || ''}
              onChange={e => set(k, e.target.value)} />
            {k === 'address' && addressBrief && (
              <p style={{ fontSize: 12, color: '#FBBF24', marginTop: 6, fontWeight: 300 }}>
                Your address looks a bit brief. Adding a landmark or street name helps your assistant find you easily.
              </p>
            )}
          </div>
        ))}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Access instructions</p>
          <textarea className="cs-input" style={{ height: 70, resize: 'none' }}
            placeholder="Gate codes, pets, special access instructions…"
            value={info.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Payment method</p>
        {PAYMENT_OPTIONS.map(o => (
          <OptionCard key={o.id} label={o.label} sub={o.sub}
            selected={data.payment === o.id}
            onClick={() => update({ payment: o.id })} />
        ))}
      </div>
      {error && (
        <div role="alert" aria-live="polite" className="cs-card p-4 mb-4"
          style={{ borderColor: 'rgba(236,36,97,0.4)', background: 'rgba(236,36,97,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AlertCircle size={16} style={{ color: '#EC2461', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#EC2461', fontWeight: 300 }}>{error}</p>
          </div>
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext}
        nextLabel={submitting ? 'Processing…' : nextLabel}
        nextDisabled={!valid || submitting} />
    </FadeUp>
  )
}

// STEP 6: Confirmed
function StepConfirmed({ data, bookingRef }) {
  const navigate = useNavigate()
  const est = calcEstimate(data.tasks || [])
  return (
    <FadeUp>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={32} style={{ color: '#EC2461' }} />
        </div>
        <h2 className="font-display italic" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Booking confirmed!</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 300, marginBottom: 24 }}>
          {data.customer?.email
            ? <>A confirmation email is on its way to <span style={{ color: '#fff' }}>{data.customer.email}</span>.</>
            : "You'll receive a confirmation shortly."}
        </p>
      </div>
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Booking reference</p>
        <p className="font-display italic" style={{ fontSize: 28, fontWeight: 600, color: '#EC2461', marginBottom: 16 }}>{bookingRef}</p>
        <PriceRow label="Estimated time" value={formatDuration(est.mins)} />
        <PriceRow label="Area" value={data.area} />
        <PriceRow label="Date" value={data.date} />
        <PriceRow label="Start" value={data.timeSlot} />
        <Divider />
        <PriceRow label="Total" value={`GH₵ ${est.total.toLocaleString()}`} />
      </div>
      <button className="cs-btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center', padding: '15px', minHeight: 48 }}>
        View my bookings
      </button>
    </FadeUp>
  )
}

export default function BookingFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ tasks: [], area: '', zone: '', date: '', timeSlot: '', notes: '', customer: {}, payment: '' })
  const [bookingRef, setBookingRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { addBooking } = useBookings()
  const navigate = useNavigate()

  const update = (updates) => setData(p => ({ ...p, ...updates }))
  const next = () => setStep(s => s + 1)
  const back = () => step > 0 ? setStep(s => s - 1) : navigate('/')

  // Persist the booking, fire confirmation emails (non-blocking), advance.
  const finalize = (ref, est, payOption, extra = {}) => {
    const booking = {
      id: ref,
      taskIds: data.tasks,
      tasks: taskLabels(data.tasks),
      estMins: est.mins,
      estHours: Math.round(est.hours * 100) / 100,
      billedHours: est.billedHours,
      price: est.price,
      total: est.total,
      zone: data.zone, area: data.area,
      date: data.date, timeSlot: data.timeSlot,
      notes: data.notes,
      customer: data.customer,
      payment: payOption.id,
      paymentLabel: payOption.label,
      paymentStatus: payOption.paymentStatus,
      assistant: null, status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      ...extra,
    }
    try {
      addBooking(booking)
    } catch {
      setSubmitting(false)
      setError("We couldn't confirm your booking. Please try again, or contact us at info@club-scrub.com")
      return
    }
    setBookingRef(ref)
    setSubmitting(false)
    next()
    // Side effect — never blocks the confirmed booking (falls back to console).
    sendBookingEmails(booking)
  }

  const confirm = async () => {
    if (submitting) return
    setError('')
    const payOption = PAYMENT_OPTIONS.find(o => o.id === data.payment)
    if (!payOption) {
      setError('Please select a payment method to continue.')
      return
    }
    const est = calcEstimate(data.tasks || [])
    const ref = generateRef()

    if (!payOption.online) {
      finalize(ref, est, payOption)
      return
    }

    // Online payment via Paystack — only save the booking on success.
    setSubmitting(true)
    try {
      await payWithPaystack({
        email: data.customer.email,
        amountGhs: est.total,
        reference: ref,
        metadata: {
          custom_fields: [
            { display_name: 'Customer', variable_name: 'customer', value: data.customer.name },
            { display_name: 'Booking ref', variable_name: 'ref', value: ref },
          ],
        },
        onSuccess: (response) => {
          finalize(ref, est, payOption, { paymentRef: response?.reference || ref })
        },
        onClose: () => {
          setSubmitting(false)
          setError('Payment was not completed. You can try again or choose another payment method.')
        },
      })
    } catch (err) {
      setSubmitting(false)
      setError("We couldn't start the payment. Please try again, or choose Cash on arrival / Bank transfer.")
    }
  }

  const steps = [
    <StepTasks data={data} update={update} onNext={next} />,
    <StepArea data={data} update={update} onBack={back} onNext={next} />,
    <StepDate data={data} update={update} onBack={back} onNext={next} />,
    <StepSummary data={data} onBack={back} onNext={next} />,
    <StepInfo data={data} update={update} onBack={back} onNext={confirm} submitting={submitting} error={error} />,
    <StepConfirmed data={data} bookingRef={bookingRef} />,
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 && (
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '28px 24px' }}>
        <StepIndicator step={step} total={STEPS.length} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
