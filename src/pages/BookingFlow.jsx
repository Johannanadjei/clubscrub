import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, X, AlertCircle, Upload } from 'lucide-react'
import { Logo, FadeUp, PriceRow, Divider } from '../components/UI.jsx'
import Calendar from '../components/Calendar.jsx'
import {
  ZONES, TASK_GROUPS, RESETS, EXCLUDED_TASKS,
  calcEstimate, calcMultiBooking, formatDuration, formatShortDate, taskLabels,
  isSaturday, isSunday, SUNDAY_SURCHARGE, generateRef,
} from '../data/index.js'
import { useBookings } from '../hooks/useStore.js'
import { payWithPaystack } from '../lib/paystack.js'

// The six customer-facing steps, in order. The post-booking confirmation
// screen is intentionally NOT included — it isn't a numbered step.
const STEPS = ['Your Home Reset', 'Share your space', 'Your area', 'Date & time', 'Your details', 'Summary & confirm']

const TIME_SLOTS = ['Morning (from 8am)', 'Afternoon (from 1pm)']

// Optional media upload (Share your space step).
const MAX_MEDIA = 6
const MAX_VIDEO_SECONDS = 60
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'heic', 'webp']
const VIDEO_EXT = ['mp4', 'mov']

// Direct, unsigned upload to Cloudinary. Returns the hosted URL.
async function uploadToCloudinary(file, folderId) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured')
  }
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  form.append('folder', `clubscrub/${folderId}`)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Upload failed')
  const json = await res.json()
  return json.secure_url || json.url
}

// Read a video's duration (seconds) from its file. Resolves 0 if unreadable.
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

// Payment options. `online` routes through Paystack (card + Mobile Money);
// the others are settled manually and recorded with a payment status.
const PAYMENT_OPTIONS = [
  { id: 'online', label: 'Pay now — Card or Mobile Money', sub: 'Secure checkout via Paystack', online: true, paymentStatus: 'paid' },
  { id: 'cash', label: 'Cash on arrival', sub: 'Pay your assistant on the day', online: false, paymentStatus: 'cash_on_arrival' },
  { id: 'bank', label: 'Bank transfer', sub: "We'll share account details to confirm", online: false, paymentStatus: 'pending' },
]

const allAreas = [...ZONES].sort((a, b) => a.localeCompare(b))

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
      {sub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>{sub}</p>}
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
        {sub && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{sub}</p>}
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

// Inline pricing feedback — slides in (height animation) once tasks are chosen.
// Always-visible; replaces the old sticky price bar / pricing modal.
function PricingFeedback({ estimate }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{ background: '#000', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
            Estimated duration: {formatDuration(estimate.mins)}
          </span>
          <span className="font-display italic" style={{ fontSize: 32, fontWeight: 600, color: '#EC2461', lineHeight: 1, whiteSpace: 'nowrap' }}>
            From GH₵ {estimate.price.toLocaleString()}
          </span>
        </div>
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '14px 0' }} />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 300, lineHeight: 1.5 }}>
          Final price confirmed at booking. Sunday surcharge +GH₵ {SUNDAY_SURCHARGE}.
        </p>
      </div>
    </motion.div>
  )
}

// STEP 1: Your Home Reset — pick a Signature Reset (drives pricing). Tasks can
// be fine-tuned via the optional "Add individual services" panel below.
function StepTasks({ data, update, onNext }) {
  const [customOpen, setCustomOpen] = useState(false)

  const selected = data.tasks || []
  const resetId = data.resetId || ''
  const has = (id) => selected.includes(id)
  const toggle = (id) => update({ tasks: has(id) ? selected.filter(t => t !== id) : [...selected, id] })

  // Selecting a reset maps its real task ids into booking data (pricing engine
  // is untouched). Selecting again clears it. Only one reset selectable at once.
  const selectReset = (r) =>
    resetId === r.id
      ? update({ resetId: '', tasks: [] })
      : update({ resetId: r.id, tasks: [...r.taskIds] })

  const toggleGroup = (g) => {
    const ids = g.tasks.map(t => t.id)
    const allOn = ids.every(id => selected.includes(id))
    update({ tasks: allOn ? selected.filter(t => !ids.includes(t)) : [...new Set([...selected, ...ids])] })
  }

  const estimate = calcEstimate(selected)
  const enabled = selected.length > 0

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <FadeUp>
        <h1 className="font-display italic" style={{ fontSize: 36, fontWeight: 500, color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
          Your Home Reset
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.6, marginBottom: 32 }}>
          Choose a Signature Reset. Your price is calculated instantly.
        </p>
      </FadeUp>

      {/* Reset selection rows — stacked, staggered reveal */}
      <div>
        {RESETS.map((r, i) => {
          const isSel = resetId === r.id
          return (
            <FadeUp key={r.id} delay={i * 0.05}>
              <div style={{ marginBottom: 16 }}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectReset(r)}
                  aria-pressed={isSel}
                  className="cs-reset-row"
                  data-selected={isSel}
                >
                  <div style={{ minWidth: 0 }}>
                    <p className="font-display italic" style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                      {r.name}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.45 }}>
                      {r.description}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {isSel ? (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EC2461', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} color="#fff" />
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 300, whiteSpace: 'nowrap' }}>
                        {r.timeRange}
                      </span>
                    )}
                  </div>
                </motion.button>

                {/* Pricing feedback slides in directly below the selected reset */}
                <AnimatePresence initial={false}>
                  {isSel && <PricingFeedback key="pricing" estimate={estimate} />}
                </AnimatePresence>
              </div>
            </FadeUp>
          )
        })}
      </div>

      {/* Custom — customise individual services on top of (or instead of) a reset */}
      <div>
        <button
          type="button"
          onClick={() => setCustomOpen(o => !o)}
          style={{ display: 'block', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', margin: '24px 0', padding: 0, minHeight: 32 }}>
          {customOpen ? 'hide individual services' : 'or customise individual services'}
        </button>

        {/* Pricing also appears here when tasks are chosen without a reset */}
        <AnimatePresence initial={false}>
          {!resetId && enabled && <PricingFeedback key="pricing-custom" estimate={estimate} />}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {customOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="cs-task-groups" style={{ marginTop: 16 }}>
                {TASK_GROUPS.map(g => {
                  const ids = g.tasks.map(t => t.id)
                  const allOn = ids.every(id => selected.includes(id))
                  return (
                    <div key={g.id} className="cs-task-group mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{g.label}</p>
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
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formatDuration(t.mins)}</span>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue — disabled until a reset (or task) is chosen; pulses on enable.
          Disabled reads as a quiet outlined button; enabled is full pink. */}
      <button
        className={`cs-btn-primary ${enabled ? 'cs-pulse-once' : ''}`}
        onClick={onNext}
        disabled={!enabled}
        style={{
          width: '100%', justifyContent: 'center', minHeight: 52, marginTop: 0,
          background: enabled ? '#EC2461' : 'transparent',
          border: enabled ? 'none' : '0.5px solid rgba(255,255,255,0.15)',
          color: enabled ? '#fff' : 'rgba(255,255,255,0.25)',
          cursor: enabled ? 'pointer' : 'not-allowed',
        }}>
        Continue <ChevronRight size={16} />
      </button>
    </div>
  )
}

// STEP 2: Share your space (optional) — upload photos/videos to Cloudinary
function StepMedia({ data, setData, onBack, onNext }) {
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const inputRef = useRef(null)
  const counter = useRef(0)

  const media = data.media || []
  const uploadedCount = media.filter(m => m.status === 'done').length
  const atMax = media.length >= MAX_MEDIA

  // Apply a change to the media list and keep mediaUrls in sync for the booking.
  const commit = (updater) => setData(p => {
    const nextMedia = updater(p.media || [])
    return {
      ...p,
      media: nextMedia,
      mediaUrls: nextMedia.filter(m => m.status === 'done' && m.url).map(m => m.url),
    }
  })

  const startUpload = (file, kind, preview) => {
    const id = `m${++counter.current}`
    commit(prev => [...prev, { id, name: file.name, kind, preview, status: 'uploading', progress: 0, url: '' }])
    // fetch() can't report upload progress, so we advance a gentle indicator
    // while the request is in flight and snap to 100% on completion.
    const timer = setInterval(() => {
      commit(prev => prev.map(m =>
        m.id === id && m.status === 'uploading' && m.progress < 90
          ? { ...m, progress: m.progress + 10 } : m))
    }, 200)
    uploadToCloudinary(file, data.mediaFolderId)
      .then(url => {
        clearInterval(timer)
        commit(prev => prev.map(m => m.id === id ? { ...m, status: 'done', progress: 100, url } : m))
      })
      .catch(() => {
        clearInterval(timer)
        commit(prev => prev.map(m => m.id === id ? { ...m, status: 'error', progress: 100 } : m))
        setNotice("One of your files didn't upload. Please remove it and try again.")
      })
  }

  const addFiles = async (fileList) => {
    setNotice('')
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    const remaining = MAX_MEDIA - (data.media || []).length
    if (remaining <= 0) { setNotice(`You can upload up to ${MAX_MEDIA} files.`); return }
    const toAdd = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      setNotice(`You can upload up to ${MAX_MEDIA} files — we added the first ${remaining}.`)
    }
    for (const file of toAdd) {
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      const isImage = IMAGE_EXT.includes(ext) || file.type.startsWith('image/')
      const isVideo = VIDEO_EXT.includes(ext) || file.type.startsWith('video/')
      if (!isImage && !isVideo) {
        setNotice('Only images (jpg, png, heic, webp) and videos (mp4, mov) are allowed.')
        continue
      }
      if (isVideo) {
        const duration = await getVideoDuration(file)
        if (duration > MAX_VIDEO_SECONDS) {
          setNotice('Videos must be 60 seconds or shorter.')
          continue
        }
      }
      let preview = ''
      try { preview = URL.createObjectURL(file) } catch { preview = '' }
      startUpload(file, isVideo ? 'video' : 'image', preview)
    }
  }

  const removeFile = (id) => {
    const target = (data.media || []).find(m => m.id === id)
    if (target?.preview) { try { URL.revokeObjectURL(target.preview) } catch { /* ignore */ } }
    commit(prev => prev.filter(m => m.id !== id))
    setNotice('')
  }

  const openPicker = () => { if (!atMax) inputRef.current?.click() }

  return (
    <FadeUp>
      <div className="mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 className="font-display italic" style={{ fontSize: 26, fontWeight: 500 }}>Share your space</h2>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 10px' }}>Optional</span>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>
          Help your assistant prepare — photos protect everyone and lead to better service.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={openPicker}
        onDragOver={e => { e.preventDefault(); if (!atMax) setDragging(true) }}
        onDragLeave={e => { e.preventDefault(); setDragging(false) }}
        onDrop={e => { e.preventDefault(); setDragging(false); if (!atMax) addFiles(e.dataTransfer.files) }}
        role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() } }}
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
          Images (jpg, png, heic, webp) or video (mp4, mov, max 60s) · up to {MAX_MEDIA} files
        </p>
        <input ref={inputRef} type="file" accept="image/*,video/*,.heic,.mov" multiple
          style={{ display: 'none' }}
          onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
      </div>

      {notice && (
        <p style={{ fontSize: 12, color: '#FBBF24', marginTop: 10, fontWeight: 300 }}>{notice}</p>
      )}

      {/* Thumbnails */}
      {media.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '20px 0 10px' }}>
            {media.length} / {MAX_MEDIA} added
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {media.map(m => (
              <div key={m.id} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                {m.kind === 'video'
                  ? <video src={m.preview || m.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <img src={m.preview || m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

                {/* Uploading / error overlay */}
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

                {/* Video badge */}
                {m.kind === 'video' && m.status === 'done' && (
                  <span style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em' }}>VIDEO</span>
                )}

                {/* Remove */}
                <button onClick={(e) => { e.stopPropagation(); removeFile(m.id) }} aria-label={`Remove ${m.name}`}
                  style={{ position: 'absolute', top: 5, right: 5, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="cs-btn-ghost" onClick={onBack} style={{ minHeight: 48, padding: '0 18px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="cs-btn-ghost"
          style={{ flex: 1, minHeight: 48, justifyContent: 'center', color: 'rgba(255,255,255,0.55)' }}>
          Skip for now
        </button>
        <button className="cs-btn-primary" onClick={onNext} disabled={uploadedCount < 1}
          style={{ flex: 1, minHeight: 48, justifyContent: 'center', opacity: uploadedCount < 1 ? 0.4 : 1, cursor: uploadedCount < 1 ? 'not-allowed' : 'pointer' }}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </FadeUp>
  )
}

// STEP 3: Area
function StepArea({ data, update, onBack, onNext }) {
  const [search, setSearch] = useState('')
  const filtered = allAreas.filter((a) => a.toLowerCase().includes(search.toLowerCase()))
  return (
    <FadeUp>
      <StepTitle title="Select your area" sub="We service these areas across Accra." />
      <input className="cs-input mb-4" placeholder="Search your area…" value={search}
        onChange={e => setSearch(e.target.value)} />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {filtered.map((a) => (
          <OptionCard key={a} label={a}
            selected={data.area === a}
            onClick={() => update({ area: a })} />
        ))}
        {filtered.length === 0 && (
          <div className="cs-card p-5 text-center">
            <AlertCircle size={20} style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              We currently do not service this location.
            </p>
          </div>
        )}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.area} />
    </FadeUp>
  )
}

// STEP 4: Date & Time — free multi-date selection (one booking, several visits).
function StepDate({ data, update, onBack, onNext }) {
  const dates = data.dates || []
  const sorted = [...dates].sort()
  const sundayCount = dates.filter(isSunday).length

  const toggleDate = (ymd) =>
    update({ dates: dates.includes(ymd) ? dates.filter(d => d !== ymd) : [...dates, ymd] })
  const removeDate = (ymd) => update({ dates: dates.filter(d => d !== ymd) })

  return (
    <FadeUp>
      <StepTitle title="Pick your dates & time" sub="Tap every day you'd like a visit — book as many as you need." />
      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Dates</p>
        <Calendar selectedDates={dates} onToggleDate={toggleDate} />
      </div>

      {/* Selected dates summary — each date is a removable pill */}
      {sorted.length > 0 && (
        <div className="cs-card p-4 mb-4">
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
            {sorted.length} {sorted.length === 1 ? 'date' : 'dates'} selected
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sorted.map(d => (
              <span key={d} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)',
                color: '#fff', fontSize: 13, padding: '5px 8px 5px 12px', borderRadius: 20,
              }}>
                {formatShortDate(d)}{isSunday(d) && <span style={{ color: '#EC2461', fontSize: 11 }}>+50</span>}
                <button type="button" onClick={() => removeDate(d)} aria-label={`Remove ${formatShortDate(d)}`}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent', flexShrink: 0,
                  }}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {sundayCount > 0 && (
        <div className="cs-card p-4 mb-4" style={{ borderColor: 'rgba(236,36,97,0.3)', background: 'rgba(236,36,97,0.06)' }}>
          <p style={{ fontSize: 13, color: '#EC2461', fontWeight: 400 }}>
            Sunday surcharge of GH₵ {SUNDAY_SURCHARGE} applies to each Sunday visit.
          </p>
        </div>
      )}

      <div className="cs-card p-5 mb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Preferred start</p>
        {TIME_SLOTS.map(s => (
          <OptionCard key={s} label={s} selected={data.timeSlot === s} onClick={() => update({ timeSlot: s })} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={dates.length < 1 || !data.timeSlot} />
    </FadeUp>
  )
}

// STEP 6: Summary & confirm — final review; the confirm/pay action fires here.
function StepSummary({ data, onBack, onNext, submitting, error }) {
  const dates = data.dates || []
  const sorted = [...dates].sort()
  const est = calcMultiBooking({ taskIds: data.tasks || [], dates })
  const labels = taskLabels(data.tasks || [])
  const selectedPay = PAYMENT_OPTIONS.find(o => o.id === data.payment)
  const nextLabel = selectedPay?.online ? `Pay GH₵ ${est.total.toLocaleString()} & confirm` : 'Confirm booking'
  return (
    <FadeUp>
      <StepTitle title="Summary & confirm" sub="Review your booking before confirming." />
      <div className="cs-card p-5 mb-4">
        <PriceRow label="Estimated time / visit" value={formatDuration(est.mins)} />
        <PriceRow label="Area" value={data.area} />
        <PriceRow label={`Dates (${est.visits} ${est.visits === 1 ? 'visit' : 'visits'})`}
          value={<span style={{ textAlign: 'right', display: 'block' }}>{sorted.map(formatShortDate).join(' · ')}</span>} />
        <PriceRow label="Start" value={data.timeSlot} />
        <Divider />
        <PriceRow label={`${est.visits} ${est.visits === 1 ? 'visit' : 'visits'} × GH₵ ${est.perVisit.toLocaleString()}`}
          value={`GH₵ ${est.visitsTotal.toLocaleString()}`} small />
        {est.surcharge > 0 && (
          <PriceRow label={`Sunday surcharge (${est.sundayCount} × GH₵ ${SUNDAY_SURCHARGE})`}
            value={`GH₵ ${est.surcharge.toLocaleString()}`} accent small />
        )}
        <Divider />
        <div className="flex items-center justify-between">
          <span style={{ fontWeight: 500 }}>Total</span>
          <span className="font-display italic" style={{ fontSize: 24, fontWeight: 600, color: '#EC2461' }}>GH₵ {est.total.toLocaleString()}</span>
        </div>
      </div>
      {labels.length > 0 && (
        <div className="cs-card p-4 mb-4">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Selected tasks ({labels.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {labels.map(t => (
              <span key={t} style={{ background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.2)', color: '#EC2461', fontSize: 11, padding: '3px 10px', borderRadius: 8 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {selectedPay && (
        <div className="cs-card p-4 mb-4">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment method</p>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{selectedPay.label}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{selectedPay.sub}</p>
        </div>
      )}
      <div className="cs-card p-4 mb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Important reminder</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.6 }}>
          ClubScrub focuses on light home upkeep. Deep cleaning and specialist services are not included.
        </p>
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
        nextDisabled={submitting} />
    </FadeUp>
  )
}

// STEP 5: Your details — customer info + payment selection. The booking is
// confirmed on the next step (Summary & confirm), so Continue just advances.
function StepInfo({ data, update, onBack, onNext }) {
  const info = data.customer || {}
  const set = (k, v) => update({ customer: { ...info, [k]: v } })
  const addressBrief = info.address && info.address.trim().length > 0 && info.address.trim().length < 10
  const valid = info.name && info.email && info.phone && info.address && data.payment
  return (
    <FadeUp>
      <StepTitle title="Your information" sub="We'll use this to confirm and coordinate your booking." />
      <div className="cs-card p-5 mb-4">
        {[
          { k: 'name', label: 'Full name', ph: 'e.g. Kwame Asante', type: 'text' },
          { k: 'email', label: 'Email address', ph: 'you@email.com', type: 'email' },
          { k: 'phone', label: 'Phone number', ph: '024 000 0000', type: 'tel', required: true },
          { k: 'address', label: 'Property address', ph: 'e.g. 5 Liberation Road, Airport Residential Area', type: 'text', required: true },
        ].map(({ k, label, ph, type, required }) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {label}{required && <span style={{ color: '#EC2461' }}> *</span>}
            </p>
            <input className="cs-input" type={type} placeholder={ph} value={info[k] || ''}
              onChange={e => set(k, e.target.value)} />
            {k === 'address' && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 300 }}>
                Your assistant will confirm the exact location before arrival.
              </p>
            )}
            {k === 'address' && addressBrief && (
              <p style={{ fontSize: 12, color: '#FBBF24', marginTop: 6, fontWeight: 300 }}>
                Your address looks a bit brief. Adding a landmark or street name helps your assistant find you easily.
              </p>
            )}
          </div>
        ))}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Access instructions</p>
          <textarea className="cs-input" style={{ height: 70, resize: 'none' }}
            placeholder="Gate codes, pets, special access instructions…"
            value={info.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Payment method</p>
        {PAYMENT_OPTIONS.map(o => (
          <OptionCard key={o.id} label={o.label} sub={o.sub}
            selected={data.payment === o.id}
            onClick={() => update({ payment: o.id })} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </FadeUp>
  )
}

// Final screen: Confirmed — shown after booking; not part of the 6-step counter.
function StepConfirmed({ data, bookingRef, onBookAnother }) {
  const dates = data.dates || []
  const sorted = [...dates].sort()
  const est = calcMultiBooking({ taskIds: data.tasks || [], dates })
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
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Booking reference</p>
        <p className="font-display italic" style={{ fontSize: 28, fontWeight: 600, color: '#EC2461', marginBottom: 16 }}>{bookingRef}</p>
        <PriceRow label="Estimated time / visit" value={formatDuration(est.mins)} />
        <PriceRow label="Area" value={data.area} />
        <PriceRow label={`Dates (${est.visits} ${est.visits === 1 ? 'visit' : 'visits'})`}
          value={<span style={{ textAlign: 'right', display: 'block' }}>{sorted.map(formatShortDate).join(' · ')}</span>} />
        <PriceRow label="Start" value={data.timeSlot} />
        <Divider />
        <PriceRow label={`${est.visits} ${est.visits === 1 ? 'visit' : 'visits'} × GH₵ ${est.perVisit.toLocaleString()}`}
          value={`GH₵ ${est.visitsTotal.toLocaleString()}`} small />
        {est.surcharge > 0 && (
          <PriceRow label={`Sunday surcharge (${est.sundayCount} × GH₵ ${SUNDAY_SURCHARGE})`} value={`GH₵ ${est.surcharge.toLocaleString()}`} accent small />
        )}
        <Divider />
        <PriceRow label="Total" value={`GH₵ ${est.total.toLocaleString()}`} />
      </div>
      <button className="cs-btn-primary" onClick={onBookAnother} style={{ width: '100%', justifyContent: 'center', padding: '15px', minHeight: 48 }}>
        Book another clean
      </button>
    </FadeUp>
  )
}

export default function BookingFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(() => ({ tasks: [], area: '', zone: '', dates: [], timeSlot: '', notes: '', customer: {}, payment: '', media: [], mediaUrls: [], mediaFolderId: generateRef() }))
  const [bookingRef, setBookingRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { addBooking } = useBookings()
  const navigate = useNavigate()

  const update = (updates) => setData(p => ({ ...p, ...updates }))
  const next = () => setStep(s => s + 1)
  const back = () => step > 0 ? setStep(s => s - 1) : navigate('/')

  // Reset the whole flow back to step 1 for a fresh booking.
  const resetFlow = () => {
    setData({ tasks: [], area: '', zone: '', dates: [], timeSlot: '', notes: '', customer: {}, payment: '', media: [], mediaUrls: [], mediaFolderId: generateRef() })
    setBookingRef('')
    setError('')
    setSubmitting(false)
    setStep(0)
    navigate('/book')
  }

  // Persist the booking, fire confirmation emails (non-blocking), advance.
  const finalize = (ref, est, payOption, extra = {}) => {
    const sortedDates = [...(data.dates || [])].sort()
    const booking = {
      id: ref,
      taskIds: data.tasks,
      tasks: taskLabels(data.tasks),
      estMins: est.mins,
      estHours: Math.round(est.hours * 100) / 100,
      billedHours: est.billedHours,
      price: est.price,              // per-visit price
      perVisit: est.perVisit,
      surcharge: est.surcharge || 0, // total Sunday surcharge across all visits
      total: est.total,
      totalPrice: est.total,         // explicit total incl. all surcharges
      totalVisits: est.visits,
      zone: data.zone, area: data.area,
      dates: sortedDates,
      date: sortedDates[0] || '',    // first visit — legacy display (Admin/Dashboard)
      timeSlot: data.timeSlot,
      notes: data.notes,
      mediaUrls: data.mediaUrls || [],
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
    // Notify admin — fire and forget. Never blocks or surfaces errors to the
    // customer; the confirmed booking is already saved.
    fetch('/api/send-booking-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch(() => {})
  }

  const confirm = async () => {
    if (submitting) return
    setError('')
    const dates = data.dates || []
    if (dates.length < 1) {
      setError('Please select at least one date for your booking.')
      return
    }
    // Saturday is closed — reject even if a Saturday date slips through (CLAUDE.md).
    if (dates.some(isSaturday)) {
      setError("We're closed on Saturdays. Please choose another day.")
      return
    }
    const payOption = PAYMENT_OPTIONS.find(o => o.id === data.payment)
    if (!payOption) {
      setError('Please select a payment method to continue.')
      return
    }
    const est = calcMultiBooking({ taskIds: data.tasks || [], dates })
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
    <StepMedia data={data} setData={setData} onBack={back} onNext={next} />,
    <StepArea data={data} update={update} onBack={back} onNext={next} />,
    <StepDate data={data} update={update} onBack={back} onNext={next} />,
    <StepInfo data={data} update={update} onBack={back} onNext={next} />,
    <StepSummary data={data} onBack={back} onNext={confirm} submitting={submitting} error={error} />,
    <StepConfirmed data={data} bookingRef={bookingRef} onBookAnother={resetFlow} />,
  ]

  return (
    <div className="cs-booking">
      {/* Header */}
      <div className="cs-booking-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          {step < STEPS.length && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Step {step + 1} of {STEPS.length}</span>
          )}
          {step < STEPS.length && (
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="cs-booking-body">
        {step < STEPS.length && <StepIndicator step={step} total={STEPS.length} />}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
