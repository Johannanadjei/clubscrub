import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'
import CookieNotice from '../components/CookieNotice.jsx'

// Home Assistant Agreement — content per Club Scrub legal brief (launch version).
const SECTIONS = [
  {
    h: 'Position',
    blocks: [
      { type: 'p', text: 'Home Assistant' },
    ],
  },
  {
    h: 'Conduct',
    blocks: [
      { type: 'p', text: 'Home Assistants agree to:' },
      { type: 'ul', items: [
        'Act professionally at all times',
        'Treat customers respectfully',
        'Maintain confidentiality',
        'Follow ClubScrub procedures',
        'Wear approved uniforms when required',
        'Arrive on time',
      ] },
    ],
  },
  {
    h: 'Confidentiality',
    blocks: [
      { type: 'p', text: 'Home Assistants must not:' },
      { type: 'ul', items: [
        'Share customer information',
        'Discuss customer homes',
        'Share photographs of customer properties',
        'Share customer addresses or personal details',
      ] },
      { type: 'p', text: 'This obligation continues after leaving ClubScrub.' },
    ],
  },
  {
    h: 'Customer Protection',
    blocks: [
      { type: 'p', text: 'Home Assistants must not:' },
      { type: 'ul', items: [
        'Accept direct bookings from ClubScrub customers',
        'Advertise personal services to customers',
        'Exchange personal business cards with customers',
      ] },
      { type: 'p', text: 'All bookings must remain through ClubScrub.' },
    ],
  },
  {
    h: 'Property Care',
    blocks: [
      { type: 'p', text: 'Home Assistants agree to:' },
      { type: 'ul', items: [
        'Treat customer property with care',
        'Report accidents immediately',
        'Report breakages immediately',
        'Report safety concerns immediately',
      ] },
    ],
  },
  {
    h: 'Theft and Misconduct',
    blocks: [
      { type: 'p', text: 'Any theft, dishonesty, harassment or misconduct may result in immediate termination and legal action where appropriate.' },
    ],
  },
  {
    h: 'Uniform and Appearance',
    blocks: [
      { type: 'p', text: 'Home Assistants should maintain:' },
      { type: 'ul', items: [
        'Clean appearance',
        'Good hygiene',
        'Professional behaviour',
      ] },
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

export default function AssistantAgreement() {
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
            Home Assistant <span style={{ color: '#EC2461' }}>Agreement</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.7 }}>
            The standards and obligations every ClubScrub Home Assistant agrees to uphold.
          </p>
        </FadeUp>
      </section>

      <Divider />

      {/* SECTIONS */}
      <section className="cs-section">
        {SECTIONS.map((s, i) => (
          <FadeUp key={s.h} delay={Math.min(i * 0.03, 0.2)}>
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
          <Link to="/assistant">
            <button className="cs-btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
              Become an Assistant <ArrowRight size={18} />
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
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy Policy</Link>
          <a href="mailto:info@club-scrub.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>info@club-scrub.com</a>
        </div>
      </footer>

      <CookieNotice />
    </div>
  )
}
