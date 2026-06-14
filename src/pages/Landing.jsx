import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X, ChevronDown, MapPin, Clock, Shield, Star } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'
import ServiceCarousel from '../components/ServiceCarousel.jsx'
import { ZONES, TASK_GROUPS, EXCLUDED_TASKS, PRICING, SUNDAY_SURCHARGE } from '../data/index.js'

const FAQ = [
  { q: 'How do I book a ClubScrub Assistant?', a: 'Tap "Book Now", select the tasks you need done, then your area, date and start time. The process takes under 3 minutes.' },
  { q: 'How is the price calculated?', a: 'Pricing is based on time. The minimum booking is GH₵ 349 for up to 3 hours, then GH₵ 100 for each extra hour (rounded up). As you pick tasks, we estimate the time and show your price instantly.' },
  { q: 'Are assistants vetted and trained?', a: 'Yes. Every ClubScrub Assistant goes through a rigorous selection, training and supervised onboarding process before accepting jobs.' },
  { q: 'What payment methods are accepted?', a: 'Pay securely in-app by card or Mobile Money (via Paystack), or choose cash on arrival or bank transfer.' },
  { q: 'What if I need to cancel?', a: 'You can cancel upcoming bookings from your dashboard. Cancellations more than 24 hours before your appointment are fully refunded.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cs-card mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left">
        <span style={{ fontSize: 14, fontWeight: 400 }}>{q}</span>
        <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontWeight: 300 }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="cs-landing">
      {/* NAV — logo left, Book Now right (top nav, shown on all sizes) */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/assistant" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Become an Assistant</Link>
          <Link to="/book">
            <button className="cs-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Book Now</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cs-hero-section">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,36,97,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <FadeUp>
          <span className="cs-badge mb-5">🇬🇭 Serving Accra</span>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h1 className="font-display italic" style={{ fontSize: 'clamp(36px, 8vw, 52px)', lineHeight: 1.12, fontWeight: 600, marginBottom: 20 }}>
            Professional Home<br />Assistance, <span style={{ color: '#EC2461' }}>Done Right.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 460, marginBottom: 36, fontWeight: 300 }}>
            Pick the tasks you need done — we estimate the time and price instantly. Trained assistants. Clear pricing. No hidden costs.
          </p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <div className="flex flex-wrap gap-3">
            <Link to="/book">
              <button className="cs-btn-primary" style={{ fontSize: 16, padding: '15px 32px' }}>
                Book Now <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Compact pricing summary */}
          <div style={{ marginTop: 40, padding: '24px', background: 'rgba(255,255,255,0.95)', borderRadius: 16 }}>
            <p style={{ fontSize: 11, color: '#EC2461', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>Transparent pricing</p>
            <p style={{ fontSize: 15, color: '#0a0a0a', fontWeight: 500, marginBottom: 4 }}>Simple, transparent pricing.</p>
            <p style={{ fontSize: 13, color: '#555', fontWeight: 300, marginBottom: 16 }}>Pay for the time you need. Pick tasks, see the price instantly.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span className="font-display italic" style={{ fontSize: 42, fontWeight: 600, color: '#EC2461', lineHeight: 1 }}>GH₵ {PRICING.base}</span>
              <span style={{ fontSize: 13, color: '#666' }}>minimum · {PRICING.baseHours} hrs</span>
            </div>
            <p style={{ fontSize: 12, color: '#444', marginBottom: 8, fontWeight: 500 }}>How it adds up</p>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 12, lineHeight: 1.6 }}>
              3 hrs = <strong style={{ color: '#EC2461' }}>GH₵ {PRICING.base}</strong> · 4 hrs = <strong style={{ color: '#EC2461' }}>GH₵ {PRICING.base + PRICING.hourlyRate}</strong> · 5 hrs = <strong style={{ color: '#EC2461' }}>GH₵ {PRICING.base + PRICING.hourlyRate * 2}</strong>. Extra time is rounded up to the next hour.
            </p>
            <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: 12, color: '#666' }}>+GH₵ {PRICING.hourlyRate} / extra hr</span>
              <span style={{ fontSize: 12, color: '#666' }}>Sun +GH₵ {SUNDAY_SURCHARGE} surcharge</span>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* SERVICE CAROUSEL — full-width, all screen sizes */}
      <section className="cs-carousel-section">
        <ServiceCarousel />
      </section>

      <Divider />

      {/* HOW IT WORKS */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Process</p>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>How it <span style={{ color: '#EC2461' }}>works</span></h2>
        </FadeUp>
        <div className="cs-steps">
        {[
          { n: '01', t: 'Pick your tasks', d: 'Choose what you need done — we estimate the time and price live.' },
          { n: '02', t: 'Pick your area & date', d: 'Tell us your area, preferred date and start time.' },
          { n: '03', t: 'Confirm & pay', d: 'Pay securely by card or Mobile Money, or choose cash on arrival.' },
          { n: '04', t: 'Relax', d: 'Receive your booking reference. We assign your assistant and handle the rest.' },
        ].map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.04}>
            <div className="flex gap-4 mb-5">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,36,97,0.12)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-display italic" style={{ fontSize: 14, color: '#EC2461', fontWeight: 600 }}>{s.n}</span>
              </div>
              <div>
                <p style={{ fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            </div>
          </FadeUp>
        ))}
        </div>
      </section>

      <Divider />

      {/* SERVICE AREAS */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Coverage</p>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>Service <span style={{ color: '#EC2461' }}>areas</span></h2>
        </FadeUp>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.entries(ZONES).map(([k, z]) => (
            <FadeUp key={k} delay={0.05}>
              <div className="cs-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} style={{ color: '#EC2461' }} />
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#EC2461' }}>{z.label}</p>
                </div>
                {z.areas.map(a => (
                  <p key={a} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: '2px 0', fontWeight: 300 }}>{a}</p>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* WHAT'S INCLUDED */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Services</p>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>What's <span style={{ color: '#EC2461' }}>included</span></h2>
        </FadeUp>
        <div className="cs-grid-services">
          {TASK_GROUPS.map((g, i) => (
            <FadeUp key={g.id} delay={i * 0.04}>
              <div className="cs-card p-4">
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>{g.label}</p>
                {g.tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-2 mb-1.5">
                    <Check size={12} style={{ color: '#EC2461', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* WHAT'S NOT INCLUDED */}
      <section style={{ padding: '0 24px 40px' }}>
        <div className="cs-card p-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Not included</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>
            ClubScrub focuses on light home upkeep and household support. Specialist or deep-cleaning services are not included.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXCLUDED_TASKS.map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, padding: '4px 10px', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* WHY CLUBSCRUB */}
      <section className="cs-section">
        <FadeUp>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 8 }}>Why <span style={{ color: '#EC2461' }}>ClubScrub?</span></h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontWeight: 300 }}>We're redefining home assistance in Ghana — blending prestige, reliability, and a fresh approach.</p>
        </FadeUp>
        <div className="cs-grid-2to4">
          {[
            { icon: Shield, t: 'Vetted Assistants', d: 'Selected, trained & supervised' },
            { icon: Star, t: 'Prestige Standard', d: 'Consistent, high-quality results' },
            { icon: Clock, t: 'Always Punctual', d: 'On time, every time — guaranteed' },
            { icon: Check, t: 'Clear Pricing', d: 'No hidden fees or surprises' },
          ].map(({ icon: Icon, t, d }, i) => (
            <FadeUp key={t} delay={i * 0.04}>
              <div className="cs-card p-4">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={16} style={{ color: '#EC2461' }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* FAQ */}
      <section className="cs-section">
        <FadeUp>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>Frequently <span style={{ color: '#EC2461' }}>asked</span></h2>
        </FadeUp>
        {FAQ.map(f => <FAQItem key={f.q} {...f} />)}
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: '0 24px 40px' }}>
        <div style={{ background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 600, marginBottom: 12 }}>
            Ready for a cleaner home?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 24, fontWeight: 300 }}>
            Book time. Set priorities. We'll handle the rest.
          </p>
          <Link to="/book">
            <button className="cs-btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
              Book Now <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <Logo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontWeight: 300 }}>
          © 2026 ClubScrub Home Assistance · Accra, Ghana
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontWeight: 300 }}>
          Professional Home Assistance, Done Right.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/assistant" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Become an Assistant</Link>
          <Link to="/admin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Admin</Link>
        </div>
      </footer>
    </div>
  )
}
