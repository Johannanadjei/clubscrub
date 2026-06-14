import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'

// Customer Terms & Conditions — content per Club Scrub legal brief (launch version).
// Each section: heading + ordered blocks (paragraph or bullet list).
const SECTIONS = [
  {
    h: 'About Club Scrub',
    blocks: [
      { type: 'p', text: 'Club Scrub provides home support services including light cleaning, tidying, dishwashing, laundry, ironing, bed changing, home organisation and similar household assistance.' },
      { type: 'p', text: 'Club Scrub does not provide heavy-duty cleaning, construction cleaning, pest control, hazardous waste removal, or specialist restoration services.' },
    ],
  },
  {
    h: 'Booking Services',
    blocks: [
      { type: 'p', text: 'Customers may book services through the Club Scrub website or approved booking channels.' },
      { type: 'p', text: 'All bookings are subject to availability.' },
      { type: 'p', text: 'Club Scrub reserves the right to decline a booking where:' },
      { type: 'ul', items: [
        'The service requested falls outside our scope',
        'The property presents health or safety risks',
        'Required information has not been provided',
      ] },
    ],
  },
  {
    h: 'Pricing',
    blocks: [
      { type: 'p', text: 'Pricing is based on:' },
      { type: 'ul', items: [
        'A minimum booking fee of ₵349 for up to 3 hours',
        '₵100 for each additional hour',
        'Custom quotations for larger or specialist jobs',
      ] },
      { type: 'p', text: 'Estimated durations are provided as a guide only and may vary depending on the size and condition of the property.' },
    ],
  },
  {
    h: 'Payment',
    blocks: [
      { type: 'p', text: 'Customers may choose:' },
      { type: 'ul', items: ['Mobile Money', 'Debit/Credit Card', 'Cash on Completion'] },
      { type: 'p', text: 'Where cash payment is selected, payment must be made immediately upon completion of the service.' },
      { type: 'p', text: 'Club Scrub reserves the right to refuse future bookings where previous payments remain outstanding.' },
    ],
  },
  {
    h: 'Customer Responsibilities',
    blocks: [
      { type: 'p', text: 'Customers agree to:' },
      { type: 'ul', items: [
        'Provide accurate booking information',
        'Provide safe access to the property',
        'Secure valuables, cash, jewellery and important documents',
        'Ensure pets are controlled where necessary',
        'Provide working utilities including water and electricity',
      ] },
    ],
  },
  {
    h: 'Cancellation Policy',
    blocks: [
      { type: 'p', text: 'Customers may cancel:' },
      { type: 'ul', items: [
        'More than 24 hours before service: No charge',
        'Less than 24 hours before service: Club Scrub may charge up to 50% of the booking value',
      ] },
      { type: 'p', text: 'Repeated cancellations may result in booking restrictions.' },
    ],
  },
  {
    h: 'Service Limitations',
    blocks: [
      { type: 'p', text: 'Club Scrub does not provide:' },
      { type: 'ul', items: [
        'Construction cleaning',
        'Deep restoration cleaning',
        'Biohazard cleaning',
        'Pest control',
        'Exterior building cleaning',
        'Roof cleaning',
        'Waste disposal services',
        'Heavy lifting services',
      ] },
      { type: 'p', text: 'Such requests may require a custom quotation or referral to a specialist provider.' },
    ],
  },
  {
    h: 'Damage Claims',
    blocks: [
      { type: 'p', text: 'Any concerns regarding damage must be reported within 24 hours of service completion.' },
      { type: 'p', text: 'Club Scrub will investigate all claims fairly and promptly.' },
      { type: 'p', text: 'Customers may be asked to provide photographs and supporting information.' },
    ],
  },
  {
    h: 'Limitation of Liability',
    blocks: [
      { type: 'p', text: "Club Scrub's liability shall not exceed the total amount paid for the relevant booking." },
      { type: 'p', text: 'Club Scrub shall not be responsible for:' },
      { type: 'ul', items: [
        'Pre-existing damage',
        'Normal wear and tear',
        'Hidden defects',
        'Losses resulting from inaccurate customer instructions',
      ] },
    ],
  },
  {
    h: 'Privacy',
    blocks: [
      { type: 'p', text: 'Club Scrub collects customer information solely for booking, communication, service delivery and business administration purposes.' },
      { type: 'p', text: 'Customer information will not be sold to third parties.' },
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

export default function Terms() {
  return (
    <div className="cs-landing">
      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <Link to="/book">
          <button className="cs-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Book Now</button>
        </Link>
      </nav>

      {/* HEADER */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Last updated: June 2026</p>
          <h1 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 8 }}>
            Terms & <span style={{ color: '#EC2461' }}>Conditions</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.7 }}>
            Club Scrub is your extra pair of hands at home. The terms below govern your use of Club Scrub home support services.
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
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy Policy</Link>
          <a href="mailto:info@club-scrub.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>info@club-scrub.com</a>
        </div>
      </footer>
    </div>
  )
}
