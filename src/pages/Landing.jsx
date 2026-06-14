import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X, ChevronDown, MapPin, Clock, Shield, Star } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'
import ServiceCarousel from '../components/ServiceCarousel.jsx'
import { ZONES, TASK_GROUPS, EXCLUDED_TASKS, PRICING, SUNDAY_SURCHARGE } from '../data/index.js'

const FAQ = [
  { q: 'Are your staff vetted?', a: 'Yes. All Home Assistants undergo an application and screening process before joining Club Scrub.' },
  { q: 'Do I need to provide cleaning products?', a: 'Customers may provide preferred products, or Club Scrub may supply basic products where available.' },
  { q: 'Can I pay in cash?', a: 'Yes. Customers may choose Mobile Money, Card, or Cash on Completion.' },
  { q: 'What areas do you cover?', a: 'Club Scrub currently serves selected areas within Accra.' },
  { q: 'Do you provide deep cleaning?', a: 'No. Club Scrub focuses on home support, tidying, laundry, ironing and light cleaning services.' },
  { q: 'Can I book recurring visits?', a: 'Yes. Weekly, fortnightly and custom recurring bookings are available.' },
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
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
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

          {/* Pricing card */}
          <div style={{ marginTop: 40, background: '#000', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '28px 24px' }}>

            {/* Eyebrow */}
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 24, fontFamily: 'DM Sans, sans-serif' }}>Transparent pricing</p>

            {/* Hero price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
              <span className="font-display italic" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: '#fff', letterSpacing: '-2px' }}>{PRICING.base}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', paddingBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>GH₵ · minimum</span>
            </div>

            {/* Pink badge */}
            <span style={{ display: 'inline-block', background: '#EC2461', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100, marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>{PRICING.baseHours} hours included</span>

            {/* 3-column breakdown grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              {[[3, PRICING.base], [4, PRICING.base + PRICING.hourlyRate], [5, PRICING.base + PRICING.hourlyRate * 2]].map(([hrs, price]) => (
                <div key={hrs} style={{ background: '#000', padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>{hrs} hours</p>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                    <span style={{ color: '#EC2461' }}>₵</span>{price}
                  </p>
                </div>
              ))}
            </div>

            {/* Note */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>
              Pay for the time you need. Pick your tasks, see the price instantly. Extra time rounded up to the next hour.
            </p>

            {/* Surcharge pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', fontFamily: 'DM Sans, sans-serif' }}>
                +<strong style={{ color: '#fff', fontWeight: 500 }}>GH₵ {PRICING.hourlyRate}</strong> / extra hr
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', fontFamily: 'DM Sans, sans-serif' }}>
                Sundays +<strong style={{ color: '#fff', fontWeight: 500 }}>GH₵ {SUNDAY_SURCHARGE}</strong>
              </span>
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
          {ZONES.map((a, i) => (
            <FadeUp key={a} delay={Math.min(i * 0.03, 0.2)}>
              <div className="cs-card p-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: '#EC2461', flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{a}</p>
                </div>
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
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/assistant" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Become an Assistant</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/assistant-agreement" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home Assistant Agreement</Link>
          <Link to="/contact" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Contact Us</Link>
          <Link to="/admin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Admin</Link>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 20, fontWeight: 300, lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          Club Scrub provides light home support and refresh services. Services are not intended to replace specialist cleaning, restoration, construction cleaning, pest control, or hazardous waste removal services.
        </p>
      </footer>
    </div>
  )
}
