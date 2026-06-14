import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Briefcase, DollarSign, Star, Clock, MapPin, ChevronRight, User, AlertTriangle } from 'lucide-react'
import { Logo, FadeUp, Avatar, Stars, Divider } from '../components/UI.jsx'
import { useAssistantProfile } from '../hooks/useStore.js'
import { MOCK_JOBS, TASK_GROUPS } from '../data/index.js'

const SKILLS = TASK_GROUPS.map(g => g.label)

function AssistantSignup({ onComplete }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', email: '', area: '', experience: '', availability: [], skills: [], bio: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleArr = (k, v) => {
    setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }))
  }

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email) return
    onComplete({
      ...form, id: 'a_new', avatar: form.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
      rating: 4.8, jobs: 0, status: 'available'
    })
  }

  const steps = [
    // Step 0: Basic info
    <FadeUp key="0">
      <h2 className="font-display italic" style={{ fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Join ClubScrub</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, marginBottom: 24 }}>Become a ClubScrub Assistant and earn on your schedule.</p>
      <div style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Before applying, please read and understand our Home Assistant Agreement.</p>
        <Link to="/assistant-agreement" style={{ fontSize: 13, color: '#EC2461', fontWeight: 500, textDecoration: 'none' }}>Read the Home Assistant Agreement →</Link>
      </div>
      {[
        { k: 'name', label: 'Full name', ph: 'Your full name', type: 'text' },
        { k: 'phone', label: 'Phone number', ph: '024 000 0000', type: 'tel' },
        { k: 'email', label: 'Email address', ph: 'you@email.com', type: 'email' },
        { k: 'area', label: 'Your area', ph: 'e.g. East Legon', type: 'text' },
        { k: 'experience', label: 'Years of experience', ph: 'e.g. 3 years', type: 'text' },
      ].map(({ k, label, ph, type }) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
          <input className="cs-input" type={type} placeholder={ph} value={form[k]}
            onChange={e => set(k, e.target.value)} />
        </div>
      ))}
      <button className="cs-btn-primary" onClick={() => setStep(1)}
        disabled={!form.name || !form.phone || !form.email}
        style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: (!form.name || !form.phone || !form.email) ? 0.4 : 1 }}>
        Continue
      </button>
    </FadeUp>,

    // Step 1: Availability + Skills
    <FadeUp key="1">
      <h2 className="font-display italic" style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>Availability & Skills</h2>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Available days</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {days.map(d => (
          <button key={d} onClick={() => toggleArr('availability', d)}
            style={{ padding: '8px 14px', borderRadius: 10, border: `0.5px solid ${form.availability.includes(d) ? '#EC2461' : 'rgba(255,255,255,0.12)'}`, background: form.availability.includes(d) ? 'rgba(236,36,97,0.12)' : 'transparent', color: form.availability.includes(d) ? '#EC2461' : 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {d.slice(0,3)}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Skills</p>
      <div className="cs-card mb-4">
        {SKILLS.map((s, i) => (
          <div key={s} onClick={() => toggleArr('skills', s)}
            className="flex items-center justify-between cursor-pointer"
            style={{ padding: '12px 16px', borderBottom: i < SKILLS.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span style={{ fontSize: 14, fontWeight: 300 }}>{s}</span>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: form.skills.includes(s) ? '#EC2461' : 'transparent', border: form.skills.includes(s) ? 'none' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {form.skills.includes(s) && <Check size={11} color="#fff" />}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>About you</p>
        <textarea className="cs-input" style={{ height: 80, resize: 'none' }}
          placeholder="Brief description of your experience and working style…"
          value={form.bio} onChange={e => set('bio', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="cs-btn-ghost" onClick={() => setStep(0)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
        <button className="cs-btn-primary" onClick={() => setStep(2)} style={{ flex: 2, justifyContent: 'center' }}>Continue</button>
      </div>
    </FadeUp>,

    // Step 2: ID + submit
    <FadeUp key="2">
      <h2 className="font-display italic" style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>Verification</h2>
      <div className="cs-card p-5 mb-4" style={{ textAlign: 'center' }}>
        <User size={40} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 300 }}>Profile photo</p>
        <button className="cs-btn-ghost" style={{ fontSize: 13 }}>Upload photo</button>
      </div>
      <div className="cs-card p-5 mb-4" style={{ textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 300 }}>Ghana Card / Passport</p>
        <button className="cs-btn-ghost" style={{ fontSize: 13 }}>Upload ID</button>
      </div>
      <div className="cs-card p-4 mb-5" style={{ background: 'rgba(236,36,97,0.06)', borderColor: 'rgba(236,36,97,0.15)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.6 }}>
          Your ID will be verified before you can accept jobs. This keeps our platform safe for everyone.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="cs-btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
        <button className="cs-btn-primary" onClick={handleSubmit} style={{ flex: 2, justifyContent: 'center' }}>Submit application</button>
      </div>
    </FadeUp>
  ]

  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#EC2461' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function JobCard({ job, onAccept }) {
  const [accepted, setAccepted] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cs-card p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 3 }}>{job.type}</p>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{job.area} · {job.distance}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="font-display italic" style={{ fontSize: 20, fontWeight: 600, color: '#EC2461' }}>GH₵ {job.pay}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Est. pay</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{job.timeSlot}</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{job.date}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {job.tasks.map(t => (
          <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 11, padding: '3px 9px', color: 'rgba(255,255,255,0.4)' }}>{t}</span>
        ))}
      </div>
      {accepted ? (
        <div style={{ background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '10px', textAlign: 'center', fontSize: 13, color: '#4ADE80' }}>
          ✓ Job accepted
        </div>
      ) : (
        <button className="cs-btn-primary" onClick={() => { setAccepted(true); onAccept(job) }}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 13 }}>
          Accept Job
        </button>
      )}
    </motion.div>
  )
}

function AssistantDashboard({ profile }) {
  const [tab, setTab] = useState('jobs')
  const [acceptedJobs, setAcceptedJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [jobStatus, setJobStatus] = useState({})

  const todayEarnings = acceptedJobs.reduce((s, j) => s + j.pay, 0)

  return (
    <div style={{ padding: '24px' }}>
      {/* Profile header */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar initials={profile.avatar} size={52} />
        <div>
          <p style={{ fontWeight: 500, fontSize: 17 }}>{profile.name}</p>
          <div className="flex items-center gap-2">
            <Stars rating={profile.rating} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{profile.jobs} jobs</span>
          </div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)', color: '#4ADE80', padding: '4px 10px', borderRadius: 20 }}>Available</span>
      </div>

      {/* Earnings cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: "Today's earnings", val: `GH₵ ${todayEarnings}` },
          { label: 'Pending payout', val: `GH₵ ${Math.round(todayEarnings * 0.9)}` },
          { label: 'Jobs accepted', val: acceptedJobs.length },
          { label: 'Rating', val: `${profile.rating} ★` },
        ].map(({ label, val }) => (
          <div key={label} className="cs-card p-3">
            <p style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 600, color: '#EC2461' }}>{val}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[['jobs','Available Jobs'],['accepted','My Jobs']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.2s',
              background: tab === v ? '#EC2461' : 'transparent', color: tab === v ? '#fff' : 'rgba(255,255,255,0.45)' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'jobs' ? (
        MOCK_JOBS.map(j => (
          <JobCard key={j.id} job={j}
            onAccept={(job) => setAcceptedJobs(p => [...p, job])} />
        ))
      ) : (
        acceptedJobs.length === 0 ? (
          <div className="cs-card p-8 text-center">
            <Briefcase size={28} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>No jobs accepted yet</p>
          </div>
        ) : acceptedJobs.map(j => (
          <div key={j.id} className="cs-card p-4 mb-3">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 3 }}>{j.type}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{j.area} · {j.date}</p>
              </div>
              <p className="font-display italic" style={{ fontSize: 18, fontWeight: 600, color: '#EC2461' }}>GH₵ {j.pay}</p>
            </div>
            <div className="flex gap-2">
              {!jobStatus[j.id] && (
                <button className="cs-btn-primary" onClick={() => setJobStatus(p => ({ ...p, [j.id]: 'started' }))}
                  style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: 13 }}>
                  Start Job
                </button>
              )}
              {jobStatus[j.id] === 'started' && (
                <>
                  <button onClick={() => setJobStatus(p => ({ ...p, [j.id]: 'done' }))}
                    style={{ flex: 2, background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)', borderRadius: 12, padding: '11px', fontSize: 13, color: '#4ADE80', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Complete Job ✓
                  </button>
                  <button style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px', fontSize: 12, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Report Issue
                  </button>
                </>
              )}
              {jobStatus[j.id] === 'done' && (
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '11px', fontSize: 13, color: '#4ADE80' }}>
                  ✓ Completed
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function AssistantApp() {
  const [profile, setProfile] = useAssistantProfile()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="sm" />
        <span className="cs-badge">Assistant Portal</span>
      </div>
      {profile ? <AssistantDashboard profile={profile} /> : <AssistantSignup onComplete={setProfile} />}
    </div>
  )
}
