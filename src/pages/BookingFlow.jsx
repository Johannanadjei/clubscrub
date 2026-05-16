import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react'
import { Logo, FadeUp, PriceRow, Divider } from '../components/UI.jsx'
import { PRICING, ZONES, TASK_GROUPS, EXCLUDED_TASKS, calcPricing, getZoneForArea, generateRef } from '../data/index.js'
import { useBookings } from '../hooks/useStore.js'

const STEPS = ['Service','Days','Area','Date & Time','Tasks','Summary','Your Info','Confirmed']

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
          background: i < step ? '#EC2461' : i === step ? '#EC2461' : 'rgba(255,255,255,0.1)',
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
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <button className="cs-btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <button className="cs-btn-primary" onClick={onNext} disabled={nextDisabled}
        style={{ flex: 2, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer', justifyContent: 'center' }}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  )
}

// STEP 1: Service type
function Step1({ data, update, onNext }) {
  return (
    <FadeUp>
      <StepTitle title="Choose your service" sub="Select the duration that works for your household needs." />
      {Object.entries(PRICING).map(([k, p]) => (
        <OptionCard key={k} label={p.label}
          sub={`${p.hours} hours · GH₵ ${p.price}`}
          selected={data.type === k}
          onClick={() => update({ type: k })} />
      ))}
      <NavButtons onNext={onNext} nextDisabled={!data.type} />
    </FadeUp>
  )
}

// STEP 2: Days
function Step2({ data, update, onBack, onNext }) {
  const days = data.days || 1
  return (
    <FadeUp>
      <StepTitle title="Number of days" sub="Book one day or multiple days. Over 3 days gets a 10% discount." />
      <div className="cs-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => update({ days: Math.max(1, days - 1) })}
            style={{ width: 40, height: 40, borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <p className="font-display italic" style={{ fontSize: 40, fontWeight: 600 }}>{days}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{days === 1 ? 'day' : 'days'}</p>
          </div>
          <button onClick={() => update({ days: days + 1 })}
            style={{ width: 40, height: 40, borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#EC2461', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        {days > 3 && (
          <div style={{ background: 'rgba(236,36,97,0.08)', border: '0.5px solid rgba(236,36,97,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EC2461' }}>
            🎉 10% multi-day discount applied to service cost!
          </div>
        )}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </FadeUp>
  )
}

// STEP 3: Area
function Step3({ data, update, onBack, onNext }) {
  const [search, setSearch] = useState('')
  const filtered = allAreas.filter(({ a }) => a.toLowerCase().includes(search.toLowerCase()))
  return (
    <FadeUp>
      <StepTitle title="Select your area" sub="We service specific zones in Accra. Service fees vary by zone." />
      <input className="cs-input mb-4" placeholder="Search your area…" value={search}
        onChange={e => setSearch(e.target.value)} />
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {filtered.map(({ a, z }) => (
          <OptionCard key={a} label={a}
            sub={`${ZONES[z].label} · GH₵ ${ZONES[z].fee} service fee/day`}
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

// STEP 4: Date & Time
function Step4({ data, update, onBack, onNext }) {
  const isHalf = data.type === 'halfDay'
  const timeSlots = isHalf ? ['Morning (7am–11am)', 'Afternoon (12pm–4pm)'] : ['Full day (7am–3pm)']
  const today = new Date().toISOString().split('T')[0]
  return (
    <FadeUp>
      <StepTitle title="Pick a date & time" sub="Choose when you'd like your assistant to arrive." />
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Date</p>
        <input type="date" className="cs-input" min={today}
          value={data.date || today}
          onChange={e => update({ date: e.target.value })} />
      </div>
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Time Slot</p>
        {timeSlots.map(s => (
          <OptionCard key={s} label={s} selected={data.timeSlot === s} onClick={() => update({ timeSlot: s })} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.date || !data.timeSlot} />
    </FadeUp>
  )
}

// STEP 5: Tasks
function Step5({ data, update, onBack, onNext }) {
  const selected = data.tasks || []
  const toggle = (task) => {
    const next = selected.includes(task) ? selected.filter(t => t !== task) : [...selected, task]
    update({ tasks: next })
  }
  return (
    <FadeUp>
      <StepTitle title="Set your priorities" sub="Select tasks for your assistant. Tasks don't affect pricing." />
      {TASK_GROUPS.map(g => (
        <div key={g.id} className="mb-5">
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>{g.label}</p>
          <div className="cs-card">
            {g.tasks.map((t, i) => (
              <div key={t} onClick={() => toggle(t)}
                className="flex items-center justify-between cursor-pointer"
                style={{ padding: '12px 16px', borderBottom: i < g.tasks.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 300 }}>{t}</span>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: selected.includes(t) ? '#EC2461' : 'transparent',
                  border: selected.includes(t) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {selected.includes(t) && <Check size={11} color="#fff" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="cs-card p-4 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Priority notes</p>
        <textarea className="cs-input" style={{ height: 80, resize: 'none' }}
          placeholder="Any specific instructions or priority areas…"
          value={data.notes || ''}
          onChange={e => update({ notes: e.target.value })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </FadeUp>
  )
}

// STEP 6: Summary
function Step6({ data, onBack, onNext }) {
  const pricing = calcPricing({ type: data.type, days: data.days, zone: data.zone })
  const p = PRICING[data.type]
  return (
    <FadeUp>
      <StepTitle title="Booking summary" sub="Review your booking before proceeding." />
      <div className="cs-card p-5 mb-4">
        <PriceRow label="Service type" value={`${p?.label} · ${p?.hours}hrs`} />
        <PriceRow label="Number of days" value={`${data.days} day${data.days > 1 ? 's' : ''}`} />
        <PriceRow label="Area" value={data.area} />
        <PriceRow label="Date" value={data.date} />
        <PriceRow label="Time slot" value={data.timeSlot} />
        <Divider />
        <PriceRow label={`Service cost (${data.days} × GH₵ ${p?.price})`} value={`GH₵ ${pricing.subtotal}`} small />
        {pricing.discount > 0 && <PriceRow label="10% multi-day discount" value={`− GH₵ ${pricing.discount}`} accent small />}
        <PriceRow label={`Service fee (${data.days} × GH₵ ${ZONES[data.zone]?.fee})`} value={`GH₵ ${pricing.serviceFee}`} small />
        <Divider />
        <div className="flex items-center justify-between">
          <span style={{ fontWeight: 500 }}>Total</span>
          <span className="font-display italic" style={{ fontSize: 24, fontWeight: 600, color: '#EC2461' }}>GH₵ {pricing.total.toLocaleString()}</span>
        </div>
      </div>
      {data.tasks?.length > 0 && (
        <div className="cs-card p-4 mb-4">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Selected tasks ({data.tasks.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.tasks.map(t => (
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

// STEP 7: Customer info
function Step7({ data, update, onBack, onNext }) {
  const info = data.customer || {}
  const set = (k, v) => update({ customer: { ...info, [k]: v } })
  const valid = info.name && info.email && info.phone && info.address
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
          </div>
        ))}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Additional notes</p>
          <textarea className="cs-input" style={{ height: 70, resize: 'none' }}
            placeholder="Gate codes, pets, special access instructions…"
            value={info.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="cs-card p-4 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Payment method</p>
        <select className="cs-input" value={data.payment || ''} onChange={e => update({ payment: e.target.value })}>
          <option value="">Select payment method</option>
          <option>Mobile Money (MTN)</option>
          <option>Mobile Money (Vodafone Cash)</option>
          <option>Mobile Money (AirtelTigo)</option>
          <option>Cash on arrival</option>
          <option>Bank transfer</option>
        </select>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Confirm booking" nextDisabled={!valid} />
    </FadeUp>
  )
}

// STEP 8: Confirmed
function Step8({ data, bookingRef }) {
  const navigate = useNavigate()
  const pricing = calcPricing({ type: data.type, days: data.days, zone: data.zone })
  return (
    <FadeUp>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={32} style={{ color: '#EC2461' }} />
        </div>
        <h2 className="font-display italic" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Booking confirmed!</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 300, marginBottom: 24 }}>
          You'll receive an SMS confirmation shortly.
        </p>
      </div>
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Booking reference</p>
        <p className="font-display italic" style={{ fontSize: 28, fontWeight: 600, color: '#EC2461', marginBottom: 16 }}>{bookingRef}</p>
        <PriceRow label="Service" value={`${PRICING[data.type]?.label} · ${data.days} day${data.days > 1 ? 's' : ''}`} />
        <PriceRow label="Area" value={data.area} />
        <PriceRow label="Date" value={data.date} />
        <PriceRow label="Time" value={data.timeSlot} />
        <Divider />
        <PriceRow label="Total" value={`GH₵ ${pricing.total.toLocaleString()}`} />
      </div>
      <div className="cs-card p-4 mb-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reminder</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.6 }}>
          ClubScrub focuses on light home upkeep and household support. Specialist or deep-cleaning services are not included.
        </p>
      </div>
      <button className="cs-btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center', padding: '15px' }}>
        View my bookings
      </button>
    </FadeUp>
  )
}

export default function BookingFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ type: '', days: 1, area: '', zone: '', date: '', timeSlot: '', tasks: [], notes: '', customer: {}, payment: '' })
  const [bookingRef, setBookingRef] = useState('')
  const { addBooking } = useBookings()
  const navigate = useNavigate()

  const update = (updates) => setData(p => ({ ...p, ...updates }))
  const next = () => setStep(s => s + 1)
  const back = () => step > 0 ? setStep(s => s - 1) : navigate('/')

  const confirm = () => {
    const pricing = calcPricing({ type: data.type, days: data.days, zone: data.zone })
    const ref = generateRef()
    setBookingRef(ref)
    addBooking({
      id: ref, ...data, ...pricing,
      assistant: null, status: 'pending', createdAt: new Date().toISOString().split('T')[0]
    })
    next()
  }

  const steps = [
    <Step1 data={data} update={update} onNext={next} />,
    <Step2 data={data} update={update} onBack={back} onNext={next} />,
    <Step3 data={data} update={update} onBack={back} onNext={next} />,
    <Step4 data={data} update={update} onBack={back} onNext={next} />,
    <Step5 data={data} update={update} onBack={back} onNext={next} />,
    <Step6 data={data} onBack={back} onNext={next} />,
    <Step7 data={data} update={update} onBack={back} onNext={confirm} />,
    <Step8 data={data} bookingRef={bookingRef} />,
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Step {step + 1} of {STEPS.length}</span>
          {step < 7 && (
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
