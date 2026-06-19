import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X, ChevronDown, MapPin, Clock, Shield, Star } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'
import ResetCarousel from '../components/ResetCarousel.jsx'
import CookieNotice from '../components/CookieNotice.jsx'
import { ZONES, EXCLUDED_TASKS, PRICING, SUNDAY_SURCHARGE } from '../data/index.js'

function AccordionRow({ section }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', width: 20, textAlign: 'right', flexShrink: 0 }}>{section.num}</span>
          <span className="font-display italic" style={{ fontSize: 22, color: open ? '#EC2461' : '#fff', transition: 'color 200ms', textAlign: 'left' }}>{section.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 300, opacity: open ? 0 : 1, transition: 'opacity 200ms' }}>{section.time}</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: open ? '0.5px solid #EC2461' : '0.5px solid rgba(255,255,255,0.15)', background: open ? '#EC2461' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 16, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 200ms', display: 'block', marginTop: open ? '-1px' : '0' }}>+</span>
          </div>
        </div>
      </button>
      {open && (
        <div style={{ paddingBottom: 28, paddingLeft: 40 }}>
          <p className="font-display italic" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontWeight: 400, lineHeight: 1.6 }}>{section.desc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            {section.items.map(item => (
              <div key={item} style={{ background: '#0a0a0a', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#EC2461', flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
        <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.65)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }} />
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
  const navigate = useNavigate()
  return (
    <div className="cs-landing">
      {/* NAV — logo left, Book Now right (top nav, shown on all sizes) */}
      <nav className="cs-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/assistant" className="cs-nav-hide-mobile" style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Become an Assistant</Link>
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
          <Link to="/membership" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Membership</Link>
          <Link to="/book">
            <button className="cs-btn-primary cs-nav-btn">Book Now</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cs-hero-section">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,36,97,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <FadeUp>
          <span className="cs-badge mb-5">🇬🇭 Private Home Assistance · Accra</span>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h1 className="font-display italic" style={{ fontSize: 'clamp(36px, 8vw, 52px)', lineHeight: 1.12, fontWeight: 600, marginBottom: 20 }}>
            Your home,<br /><span style={{ color: '#EC2461' }}>always at its finest.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 460, marginBottom: 36, fontWeight: 300 }}>
            Private Home Assistants for Ghana's most discerning households. Book a Signature Reset and come home to something better.
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
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontFamily: 'DM Sans, sans-serif' }}>Transparent pricing</p>

            {/* Hero price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
              <span className="font-display italic" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: '#fff', letterSpacing: '-2px' }}>{PRICING.base}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', paddingBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>GH₵ · minimum</span>
            </div>

            {/* Pink badge */}
            <span style={{ display: 'inline-block', background: '#EC2461', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100, marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>{PRICING.baseHours} hours included</span>

            {/* 3-column breakdown grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              {[[3, PRICING.base], [4, PRICING.base + PRICING.hourlyRate], [5, PRICING.base + PRICING.hourlyRate * 2]].map(([hrs, price]) => (
                <div key={hrs} style={{ background: '#000', padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>{hrs} hours</p>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                    <span style={{ color: '#EC2461' }}>₵</span>{price}
                  </p>
                </div>
              ))}
            </div>

            {/* Note */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>
              Pay for the time you need. Pick your tasks, see the price instantly. Extra time rounded up to the next hour.
            </p>

            {/* Surcharge pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', fontFamily: 'DM Sans, sans-serif' }}>
                +<strong style={{ color: '#fff', fontWeight: 500 }}>GH₵ {PRICING.hourlyRate}</strong> / extra hr
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', fontFamily: 'DM Sans, sans-serif' }}>
                Sundays +<strong style={{ color: '#fff', fontWeight: 500 }}>GH₵ {SUNDAY_SURCHARGE}</strong>
              </span>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* SIGNATURE RESETS — premium room-based bundles */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Services</p>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 8 }}>Signature Home <span style={{ color: '#EC2461' }}>Resets</span></h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 24, fontWeight: 300 }}>Every space. Perfectly presented.</p>
        </FadeUp>
        <ResetCarousel onSelect={() => navigate('/book')} />
      </section>

      <Divider />

      {/* HOW IT WORKS */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Process</p>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>How it <span style={{ color: '#EC2461' }}>works</span></h2>
        </FadeUp>
        <div className="cs-steps">
        {[
          { n: '01', t: 'Choose your Reset', d: 'Select from our Signature Resets or build your own' },
          { n: '02', t: 'Choose your time', d: 'Pick a date and arrival window that suits your schedule' },
          { n: '03', t: 'Come home to perfection', d: 'Your assistant arrives, cares for your home, and leaves it transformed' },
        ].map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.04}>
            <div className="flex gap-4 mb-5">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,36,97,0.12)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-display italic" style={{ fontSize: 14, color: '#EC2461', fontWeight: 600 }}>{s.n}</span>
              </div>
              <div>
                <p style={{ fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 300, lineHeight: 1.6 }}>{s.d}</p>
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
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Coverage</p>
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

      {/* WHAT'S INCLUDED ACCORDION */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#EC2461', marginBottom: 16, fontWeight: 500 }}>Every Reset</p>
          <h2 className="font-display italic" style={{ fontSize: 38, fontWeight: 600, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>What's included.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 40, fontWeight: 300, lineHeight: 1.6 }}>Every space cared for, to a consistent standard.</p>
        </FadeUp>

        {/* Accordion */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          {[
            {
              num: '01', name: 'Kitchen Reset', count: 8,
              time: '~2h 45m – 3h 45m',
              desc: 'A beautifully presented kitchen, ready for the day ahead.',
              items: ['Wash dishes & utensils', 'Clean countertops & stovetop', 'Scrub sink', 'Wipe cabinet fronts', 'Clean microwave', 'Sweep & mop floor', 'Take out trash', 'General organisation'],
            },
            {
              num: '02', name: 'Bedroom Reset', count: 8,
              time: '~2h 45m – 3h 45m',
              desc: 'A calm, hotel-inspired bedroom experience.',
              items: ['Make beds to hotel standard', 'Change bed linen', 'Dust all surfaces', 'Tidy & organise', 'Sweep & vacuum floor', 'Mop floor', 'Fold & put away clothes', 'Cushion arrangement'],
            },
            {
              num: '03', name: 'Bathroom Reset', count: 8,
              time: '~2h 45m – 3h 45m',
              desc: 'A polished, spa-standard bathroom.',
              items: ['Clean & sanitise toilet', 'Clean sink & counter', 'Polish mirror', 'Clean shower & bath', 'Present towels', 'Sweep & mop floor', 'Restock & tidy', 'Empty bin'],
            },
            {
              num: '04', name: 'Living Space Reset', count: 8,
              time: '~2h 45m – 3h 45m',
              desc: 'A welcoming, guest-ready living environment.',
              items: ['Dust all surfaces', 'Tidy & declutter', 'Sweep & vacuum', 'Mop floors', 'Wipe tables & surfaces', 'Clean glass & mirrors', 'Arrange soft furnishings', 'Presentation styling'],
            },
            {
              num: '05', name: 'Full Home Reset', count: 4,
              time: '~2h 45m – 3h 45m',
              desc: 'Our complete Signature Reset — every room, every detail.',
              items: ['Everything in our Signature Resets', 'Kitchen · Bedroom · Bathroom · Living Space', 'Your entire home, beautifully restored', 'Our most comprehensive Reset'],
            },
          ].map((section) => (
            <AccordionRow key={section.num} section={section} />
          ))}
        </div>
      </section>

      {/* CLEANING PRODUCTS NOTE */}
      <section style={{ padding: '0 24px' }}>
        <div style={{ margin: '0 0 16px', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300 }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>Your products, your standards.</span> We ask that clients provide their preferred cleaning products. Our ethos is to keep your already beautiful space looking exactly that way.
          </p>
        </div>
      </section>

      {/* WHAT'S NOT INCLUDED */}
      <section style={{ padding: '0 24px 40px' }}>
        <div className="cs-card p-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Not included</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>
            ClubScrub focuses on light home upkeep and household support. Specialist or deep-cleaning services are not included.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXCLUDED_TASKS.map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, padding: '4px 10px', color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
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
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 24, fontWeight: 300 }}>We're redefining home assistance in Ghana — blending prestige, reliability, and a fresh approach.</p>
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
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{d}</p>
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
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12, fontWeight: 300 }}>
          © 2026 ClubScrub Home Assistance · Accra, Ghana
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontWeight: 300 }}>
          Professional Home Assistance, Done Right.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/assistant" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Become an Assistant</Link>
          <Link to="/membership" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Membership</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/assistant-agreement" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home Assistant Agreement</Link>
          <Link to="/contact" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Contact Us</Link>
          <Link to="/admin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Admin</Link>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 20, fontWeight: 300, lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          Club Scrub provides light home support and refresh services. Services are not intended to replace specialist cleaning, restoration, construction cleaning, pest control, or hazardous waste removal services.
        </p>
      </footer>

      <CookieNotice />
    </div>
  )
}
