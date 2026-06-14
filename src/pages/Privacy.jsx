import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'

// Privacy Policy — content per Club Scrub legal brief (launch version).
const SECTIONS = [
  {
    h: 'Information We Collect',
    blocks: [
      { type: 'p', text: 'To deliver our services, Club Scrub collects the following information from customers:' },
      { type: 'ul', items: [
        'Name',
        'Email address',
        'Telephone number',
        'Property address',
        'Booking information',
      ] },
    ],
  },
  {
    h: 'How We Use Your Information',
    blocks: [
      { type: 'p', text: 'Your information is used for:' },
      { type: 'ul', items: [
        'Managing bookings',
        'Customer support',
        'Service delivery',
        'Business administration',
      ] },
      { type: 'p', text: 'Customer information will not be sold to third parties.' },
    ],
  },
  {
    h: 'Your Rights',
    blocks: [
      { type: 'p', text: 'You have the right to:' },
      { type: 'ul', items: [
        'Access personal data',
        'Request corrections',
        'Request deletion',
      ] },
      { type: 'p', text: 'To exercise any of these rights, please contact us at info@club-scrub.com.' },
    ],
  },
  {
    h: 'Security',
    blocks: [
      { type: 'p', text: 'Club Scrub will take reasonable measures to protect customer information.' },
    ],
  },
]

function Block({ block }) {
  if (block.type === 'ul') {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
        {block.items.map((item) => (
          <li key={item} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ color: '#EC2461', flexShrink: 0, lineHeight: 1.8 }}>•</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.8 }}>{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  return <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.8, marginBottom: 12 }}>{block.text}</p>
}

export default function Privacy() {
  return (
    <div className="cs-landing">
      {/* NAV */}
      <nav className="cs-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
          <Link to="/book">
            <button className="cs-btn-primary cs-nav-btn">Book Now</button>
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Last updated: June 2026</p>
          <h1 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 8 }}>
            Privacy <span style={{ color: '#EC2461' }}>Policy</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.7 }}>
            This policy explains what information Club Scrub collects, how it is used, and the rights you have over your data.
          </p>
        </FadeUp>
      </section>

      <Divider />

      {/* SECTIONS */}
      <section className="cs-section">
        {SECTIONS.map((s, i) => (
          <FadeUp key={s.h} delay={Math.min(i * 0.04, 0.2)}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: '#EC2461', marginBottom: 10 }}>{s.h}</h2>
              {s.blocks.map((b, bi) => <Block key={bi} block={b} />)}
            </div>
          </FadeUp>
        ))}
      </section>

      <Divider />

      {/* CTA */}
      <section className="cs-section">
        <FadeUp>
          <Link to="/book">
            <button className="cs-btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
              Book Now <ArrowRight size={18} />
            </button>
          </Link>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <Logo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontWeight: 300 }}>
          © 2026 ClubScrub Home Assistance · Accra, Ghana
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <a href="mailto:info@club-scrub.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>info@club-scrub.com</a>
        </div>
      </footer>
    </div>
  )
}
