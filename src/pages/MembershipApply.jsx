import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, X, Upload, AlertCircle, MessageCircle } from 'lucide-react'
import { Logo, FadeUp } from '../components/UI.jsx'
import CookieNotice from '../components/CookieNotice.jsx'
import { ZONES } from '../data/index.js'

const WHATSAPP = 'https://wa.me/233597207741'

const AREAS = [...ZONES].sort((a, b) => a.localeCompare(b))
const PROPERTY_TYPES = ['Apartment', 'House', 'Townhouse', 'Villa', 'Other']
const SIZES = ['Studio', '1-2 Bedrooms', '3-4 Bedrooms', '5+ Bedrooms']
const HOUSEHOLD_SIZES = ['1 person', '2 people', '3-4 people', '5+ people']
const SUPPORT_OPTIONS = [
  'General home maintenance',
  'Kitchen care',
  'Bedroom & linen',
  'Bathroom care',
  'Laundry & ironing',
  'Home organisation',
]
const FREQUENCIES = ['Weekly', 'Twice weekly', 'As needed']
// Membership monthly price by chosen Reset type, used for the live price card.
const RESET_PRICES = { signature: 1499, full: 2000 }
const RESET_CHOICES = [
  { id: 'signature', label: 'Signature Reset (Kitchen, Bedroom, Bathroom or Living Space)', note: '₵1,499/month' },
  { id: 'full', label: 'Full Home Reset', note: '₵2,000/month' },
]
// Short pill label → full day name stored in form state.
const DAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
]
const TIMES = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Flexible']

// Optional media upload — mirrors the booking flow (Cloudinary unsigned upload).
const MAX_MEDIA = 6
const MAX_VIDEO_SECONDS = 60
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'heic', 'webp']
const VIDEO_EXT = ['mp4', 'mov']

async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary is not configured')
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  form.append('folder', 'clubscrub/membership-applications')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Upload failed')
  const json = await res.json()
  return json.secure_url || json.url
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file)
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration || 0) }
      v.onerror = () => { URL.revokeObjectURL(url); resolve(0) }
      v.src = url
    } catch {
      resolve(0)
    }
  })
}

// Section wrapper — pink uppercase heading + subtle divider above (except first).
function Section({ title, first, children }) {
  return (
    <div style={{ marginTop: first ? 0 : 32, paddingTop: first ? 0 : 32, borderTop: first ? 'none' : '0.5px solid rgba(255,255,255,0.08)' }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EC2461', fontWeight: 500, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({ label, required, children, hint, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EC2461' }}> *</span>}
      </p>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6, fontWeight: 300, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#EC2461', marginTop: 6, fontWeight: 300 }}>{error}</p>}
    </div>
  )
}

// Native select styled with the shared cs-input class; a placeholder option
// guides the choice. 16px font (via cs-input) prevents iOS zoom.
function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="cs-input" value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function MembershipApply() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    area: '', propertyType: '', size: '', householdSize: '',
    support: [], resetChoice: '', frequency: '', preferredDays: [], time: '', notes: '',
  })
  const [media, setMedia] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [mediaNotice, setMediaNotice] = useState('')
  const [dayNote, setDayNote] = useState('')
  const inputRef = useRef(null)
  const counter = useRef(0)

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }

  const toggleSupport = (opt) => {
    setForm((p) => ({
      ...p,
      support: p.support.includes(opt) ? p.support.filter((s) => s !== opt) : [...p.support, opt],
    }))
    if (errors.support) setErrors((e) => ({ ...e, support: '' }))
  }

  // Changing frequency resets the day picker — the cap and "As needed" hide
  // mean prior selections may no longer be valid.
  const setFrequency = (v) => {
    setForm((p) => ({ ...p, frequency: v, preferredDays: [] }))
    setDayNote('')
    setErrors((e) => ({ ...e, frequency: '', preferredDays: '' }))
  }

  // Day picker adapts to frequency: Weekly = single (radio), Twice weekly =
  // toggle capped at 2, As needed = hidden (picker not rendered).
  const toggleDay = (day) => {
    setDayNote('')
    if (errors.preferredDays) setErrors((e) => ({ ...e, preferredDays: '' }))
    setForm((p) => {
      const selected = p.preferredDays
      const has = selected.includes(day)
      if (p.frequency === 'Weekly') {
        return { ...p, preferredDays: has ? [] : [day] }
      }
      // Twice weekly
      if (has) return { ...p, preferredDays: selected.filter((d) => d !== day) }
      if (selected.length >= 2) {
        setDayNote('Maximum 2 days for twice weekly')
        return p
      }
      return { ...p, preferredDays: [...selected, day] }
    })
  }

  const startUpload = (file, kind, preview) => {
    const id = `m${++counter.current}`
    setMedia((prev) => [...prev, { id, name: file.name, kind, preview, status: 'uploading', progress: 0, url: '' }])
    const timer = setInterval(() => {
      setMedia((prev) => prev.map((m) =>
        m.id === id && m.status === 'uploading' && m.progress < 90 ? { ...m, progress: m.progress + 10 } : m))
    }, 200)
    uploadToCloudinary(file)
      .then((url) => {
        clearInterval(timer)
        setMedia((prev) => prev.map((m) => m.id === id ? { ...m, status: 'done', progress: 100, url } : m))
      })
      .catch(() => {
        clearInterval(timer)
        setMedia((prev) => prev.map((m) => m.id === id ? { ...m, status: 'error', progress: 100 } : m))
        setMediaNotice("One of your files didn't upload. Please remove it and try again.")
      })
  }

  const addFiles = async (fileList) => {
    setMediaNotice('')
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    const remaining = MAX_MEDIA - media.length
    if (remaining <= 0) { setMediaNotice(`You can upload up to ${MAX_MEDIA} files.`); return }
    const toAdd = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      setMediaNotice(`You can upload up to ${MAX_MEDIA} files — we added the first ${remaining}.`)
    }
    for (const file of toAdd) {
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      const isImage = IMAGE_EXT.includes(ext) || file.type.startsWith('image/')
      const isVideo = VIDEO_EXT.includes(ext) || file.type.startsWith('video/')
      if (!isImage && !isVideo) {
        setMediaNotice('Only images (jpg, png, heic, webp) and videos (mp4, mov) are allowed.')
        continue
      }
      if (isVideo) {
        const duration = await getVideoDuration(file)
        if (duration > MAX_VIDEO_SECONDS) { setMediaNotice('Videos must be 60 seconds or shorter.'); continue }
      }
      let preview = ''
      try { preview = URL.createObjectURL(file) } catch { preview = '' }
      startUpload(file, isVideo ? 'video' : 'image', preview)
    }
  }

  const removeFile = (id) => {
    const target = media.find((m) => m.id === id)
    if (target?.preview) { try { URL.revokeObjectURL(target.preview) } catch { /* ignore */ } }
    setMedia((prev) => prev.filter((m) => m.id !== id))
    setMediaNotice('')
  }

  const atMax = media.length >= MAX_MEDIA
  const openPicker = () => { if (!atMax) inputRef.current?.click() }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name'
    else if (!/\S+\s+\S+/.test(form.name.trim())) e.name = 'Please enter your full name (first and last name)'
    if (!form.email.trim()) e.email = 'Please enter a valid email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email address'
    if (!form.phone.trim()) e.phone = 'Please enter a valid Ghana mobile number (e.g. 024 000 0000)'
    if (!form.area) e.area = 'Please select your area'
    if (!form.propertyType) e.propertyType = 'Please select a property type'
    if (form.support.length === 0) e.support = 'Please select at least one type of support'
    if ((form.frequency === 'Weekly' || form.frequency === 'Twice weekly') && form.preferredDays.length === 0) {
      e.preferredDays = 'Please select your preferred day' + (form.frequency === 'Twice weekly' ? 's' : '')
    }
    return e
  }

  const submit = async () => {
    if (submitting) return
    setSubmitError('')
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      const first = document.querySelector('[data-error="true"]')
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        area: form.area,
        propertyType: form.propertyType,
        size: form.size,
        householdSize: form.householdSize,
        support: form.support,
        resetChoice: form.resetChoice,
        resetPrice: form.resetChoice ? RESET_PRICES[form.resetChoice] : null,
        frequency: form.frequency,
        preferredDays: form.frequency === 'As needed' ? [] : form.preferredDays,
        time: form.time,
        notes: form.notes.trim(),
        mediaUrls: media.filter((m) => m.status === 'done' && m.url).map((m) => m.url),
      }
      const res = await fetch('/api/membership-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Request failed')
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError("We couldn't submit your application. Please try again, or contact us at info@club-scrub.com")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cs-landing">
      {/* NAV */}
      <nav className="cs-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/membership" className="cs-nav-hide-mobile" style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Membership</Link>
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
          <Link to="/book">
            <button className="cs-btn-primary cs-nav-btn">Book Now</button>
          </Link>
        </div>
      </nav>

      {done ? (
        // THANK YOU SCREEN
        <section className="cs-section" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', paddingTop: 64, paddingBottom: 64 }}>
          <FadeUp>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={32} style={{ color: '#EC2461' }} />
            </div>
            <h1 className="font-display italic" style={{ fontSize: 40, fontWeight: 600, color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
              Application received.
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300, maxWidth: 440, margin: '0 auto 28px' }}>
              Thank you, {form.name.trim().split(' ')[0] || 'there'}. We'll review your application and contact you within 24 hours to discuss your membership.
            </p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#EC2461', textDecoration: 'none', fontWeight: 500 }}>
              <MessageCircle size={16} /> Questions? Chat with us on WhatsApp <ArrowRight size={15} />
            </a>
          </FadeUp>
        </section>
      ) : (
        <>
          {/* HERO */}
          <section className="cs-hero-section">
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,36,97,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <FadeUp>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#EC2461', fontWeight: 500, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
                Club Member Application
              </p>
            </FadeUp>
            <FadeUp delay={0.05}>
              <h1 className="font-display italic" style={{ fontSize: 'clamp(32px, 9vw, 40px)', lineHeight: 1.12, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
                Apply for membership.
              </h1>
            </FadeUp>
            <FadeUp delay={0.08}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 520, fontWeight: 300 }}>
                Tell us about your home and what you need. We'll review your application and be in touch within 24 hours.
              </p>
            </FadeUp>
          </section>

          {/* FORM */}
          <section className="cs-section">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <FadeUp>
                {/* Section 1 — About you */}
                <Section title="About you" first>
                  <div data-error={!!errors.name}>
                    <Field label="Full name" required error={errors.name}>
                      <input className="cs-input" type="text" placeholder="e.g. Kwame Asante" value={form.name}
                        onChange={(e) => set('name', e.target.value)} />
                    </Field>
                  </div>
                  <div data-error={!!errors.email}>
                    <Field label="Email address" required error={errors.email}>
                      <input className="cs-input" type="email" placeholder="you@email.com" value={form.email}
                        onChange={(e) => set('email', e.target.value)} />
                    </Field>
                  </div>
                  <div data-error={!!errors.phone}>
                    <Field label="Phone number" required hint="Ghana mobile number, e.g. 024 000 0000" error={errors.phone}>
                      <input className="cs-input" type="tel" placeholder="024 000 0000" value={form.phone}
                        onChange={(e) => set('phone', e.target.value)} />
                    </Field>
                  </div>
                </Section>

                {/* Section 2 — Your home */}
                <Section title="Your home">
                  <div data-error={!!errors.area}>
                    <Field label="Area" required error={errors.area}>
                      <Select value={form.area} onChange={(e) => set('area', e.target.value)} options={AREAS} placeholder="Select your area" />
                    </Field>
                  </div>
                  <div data-error={!!errors.propertyType}>
                    <Field label="Property type" required error={errors.propertyType}>
                      <Select value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} options={PROPERTY_TYPES} placeholder="Select property type" />
                    </Field>
                  </div>
                  <Field label="Approximate size">
                    <Select value={form.size} onChange={(e) => set('size', e.target.value)} options={SIZES} placeholder="Select approximate size" />
                  </Field>
                  <Field label="Household size">
                    <Select value={form.householdSize} onChange={(e) => set('householdSize', e.target.value)} options={HOUSEHOLD_SIZES} placeholder="Select household size" />
                  </Field>
                </Section>

                {/* Section 3 — What you need */}
                <Section title="What you need">
                  <div data-error={!!errors.support}>
                    <Field label="Support needed" required error={errors.support}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {SUPPORT_OPTIONS.map((opt) => {
                          const checked = form.support.includes(opt)
                          return (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', cursor: 'pointer', minHeight: 44, WebkitTapHighlightColor: 'transparent' }}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSupport(opt)}
                                style={{ width: 20, height: 20, accentColor: '#EC2461', flexShrink: 0, cursor: 'pointer' }} />
                              <span style={{ fontSize: 14, color: checked ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: 300 }}>{opt}</span>
                            </label>
                          )
                        })}
                      </div>
                    </Field>
                  </div>
                  <Field label="Which Reset would you like?">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {RESET_CHOICES.map((opt) => {
                        const checked = form.resetChoice === opt.id
                        return (
                          <label key={opt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', cursor: 'pointer', minHeight: 44, WebkitTapHighlightColor: 'transparent' }}>
                            <input type="radio" name="resetChoice" checked={checked} onChange={() => set('resetChoice', opt.id)}
                              style={{ width: 20, height: 20, accentColor: '#EC2461', flexShrink: 0, cursor: 'pointer', marginTop: 1 }} />
                            <span style={{ fontSize: 14, color: checked ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: 300, lineHeight: 1.4 }}>
                              {opt.label} <span style={{ color: '#EC2461' }}>· {opt.note}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    {form.resetChoice && (
                      <div style={{ background: 'rgba(236,36,97,0.06)', border: '0.5px solid rgba(236,36,97,0.3)', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
                        <p style={{ fontSize: 11, color: '#EC2461', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>
                          Your membership
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                          <span className="font-display italic" style={{ fontSize: 36, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                            ₵{RESET_PRICES[form.resetChoice].toLocaleString()}
                          </span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>/month</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.5 }}>
                          Includes 1 Reset per week at your preferred time. Additional Resets available at 10% member discount via WhatsApp.
                        </p>
                      </div>
                    )}
                  </Field>
                  <Field label="Preferred frequency">
                    <Select value={form.frequency} onChange={(e) => setFrequency(e.target.value)} options={FREQUENCIES} placeholder="Select frequency" />
                  </Field>
                  {(form.frequency === 'Weekly' || form.frequency === 'Twice weekly') && (
                    <div data-error={!!errors.preferredDays}>
                      <Field
                        label={form.frequency === 'Twice weekly' ? 'Preferred days' : 'Preferred day'}
                        required
                        hint={form.frequency === 'Twice weekly' ? 'Select exactly 2 days' : 'Select 1 day'}
                        error={errors.preferredDays}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {DAYS.map(({ short, full }) => {
                            const selected = form.preferredDays.includes(full)
                            return (
                              <button
                                key={full}
                                type="button"
                                onClick={() => toggleDay(full)}
                                aria-pressed={selected}
                                style={{
                                  minWidth: 56, minHeight: 44, padding: '10px 16px', borderRadius: 100,
                                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                                  cursor: 'pointer', boxSizing: 'border-box', WebkitTapHighlightColor: 'transparent',
                                  transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                                  background: selected ? '#EC2461' : 'rgba(255,255,255,0.02)',
                                  color: selected ? '#fff' : 'rgba(255,255,255,0.6)',
                                  border: `0.5px solid ${selected ? '#EC2461' : 'rgba(255,255,255,0.2)'}`,
                                }}
                              >
                                {short}
                              </button>
                            )
                          })}
                        </div>
                        {dayNote && (
                          <p style={{ fontSize: 12, color: '#FBBF24', marginTop: 8, fontWeight: 300 }}>{dayNote}</p>
                        )}
                      </Field>
                    </div>
                  )}
                  <Field label="Preferred time">
                    <Select value={form.time} onChange={(e) => set('time', e.target.value)} options={TIMES} placeholder="Select time" />
                  </Field>
                  <Field label="Additional notes">
                    <textarea className="cs-input" style={{ height: 90, resize: 'none' }}
                      placeholder="Anything else we should know about your home or requirements?"
                      value={form.notes} onChange={(e) => set('notes', e.target.value)} />
                  </Field>
                </Section>

                {/* Section 4 — Share your space (optional) */}
                <Section title="Share your space">
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14, fontWeight: 300, lineHeight: 1.5 }}>
                    Photos help us understand your space and match you with the right assistant. This is optional but recommended.
                  </p>
                  <div
                    onClick={openPicker}
                    onDragOver={(e) => { e.preventDefault(); if (!atMax) setDragging(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); if (!atMax) addFiles(e.dataTransfer.files) }}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() } }}
                    style={{
                      border: `1.5px dashed ${dragging ? '#EC2461' : 'rgba(255,255,255,0.18)'}`,
                      background: dragging ? 'rgba(236,36,97,0.07)' : 'rgba(255,255,255,0.02)',
                      borderRadius: 14, padding: '30px 20px', textAlign: 'center',
                      cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.5 : 1,
                      transition: 'all 0.2s ease', minHeight: 44,
                    }}>
                    <Upload size={26} style={{ color: dragging ? '#EC2461' : 'rgba(255,255,255,0.65)', display: 'block', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {atMax ? 'Maximum of 6 files added' : 'Tap to upload or drag files here'}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
                      Up to {MAX_MEDIA} photos or videos of your property
                    </p>
                    <input ref={inputRef} type="file" accept="image/*,video/*,.heic,.mov" multiple
                      style={{ display: 'none' }}
                      onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
                  </div>

                  {mediaNotice && (
                    <p style={{ fontSize: 12, color: '#FBBF24', marginTop: 10, fontWeight: 300 }}>{mediaNotice}</p>
                  )}

                  {media.length > 0 && (
                    <>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '20px 0 10px' }}>
                        {media.length} / {MAX_MEDIA} added
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {media.map((m) => (
                          <div key={m.id} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                            {m.kind === 'video'
                              ? <video src={m.preview || m.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <img src={m.preview || m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            {m.status !== 'done' && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                {m.status === 'error' ? (
                                  <p style={{ fontSize: 11, color: '#EC2461', textAlign: 'center', fontWeight: 400 }}>Upload failed</p>
                                ) : (
                                  <>
                                    <div style={{ width: '80%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                                      <div style={{ width: `${m.progress}%`, height: '100%', background: '#EC2461', transition: 'width 0.2s ease' }} />
                                    </div>
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{m.progress}%</span>
                                  </>
                                )}
                              </div>
                            )}
                            {m.kind === 'video' && m.status === 'done' && (
                              <span style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em' }}>VIDEO</span>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); removeFile(m.id) }} aria-label={`Remove ${m.name}`}
                              style={{ position: 'absolute', top: 5, right: 5, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Section>

                {/* Submit */}
                {submitError && (
                  <div role="alert" aria-live="polite" className="cs-card p-4" style={{ marginTop: 28, borderColor: 'rgba(236,36,97,0.4)', background: 'rgba(236,36,97,0.06)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <AlertCircle size={16} style={{ color: '#EC2461', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: '#EC2461', fontWeight: 300 }}>{submitError}</p>
                    </div>
                  </div>
                )}
                <button className="cs-btn-primary" onClick={submit} disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', minHeight: 52, marginTop: 28, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Submitting…' : <>Submit Application <ArrowRight size={16} /></>}
                </button>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 14, fontWeight: 300, lineHeight: 1.6 }}>
                  We'll review your application and be in touch within 24 hours.
                </p>
              </FadeUp>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <Logo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12, fontWeight: 300 }}>
          © 2026 ClubScrub Home Assistance · Accra, Ghana
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontWeight: 300 }}>
          Professional Home Assistance, Done Right.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
          <Link to="/membership" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Membership</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/contact" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Contact Us</Link>
        </div>
      </footer>

      <CookieNotice />
    </div>
  )
}
