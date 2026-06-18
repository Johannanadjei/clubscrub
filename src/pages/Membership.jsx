import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, MessageCircle } from 'lucide-react'
import { Logo, FadeUp } from '../components/UI.jsx'
import CookieNotice from '../components/CookieNotice.jsx'

const WHATSAPP = 'https://wa.me/233597207741'

// Build a WhatsApp enquiry link with a tier-specific prefilled message.
const enquireHref = (tier) =>
  `${WHATSAPP}?text=${encodeURIComponent(`Hi ClubScrub, I'd like to enquire about the ${tier} membership.`)}`

const TIERS = [
  {
    label: 'Club Member',
    price: '₵1,499',
    priceNote: 'per month',
    tagline: 'YOUR HOME. ALWAYS READY.',
    description: 'Designed for busy professionals, families and homeowners who want the convenience of a regularly maintained home without the hassle of repeatedly booking appointments.',
    benefits: [
      'Reserved weekly appointment',
      'Preferred scheduling window',
      'Priority booking access',
      'Home preferences stored and remembered',
      'Dedicated WhatsApp support',
      'Priority access to peak-demand booking periods',
      '10% off additional bookings',
    ],
    smallPrint: 'Members receive priority access to high-demand booking slots before non-members.',
    cta: 'Become a Member',
    popular: false,
    comingSoon: false,
  },
  {
    label: 'Signature Membership',
    price: '',
    priceNote: '',
    tagline: 'COMING SOON.',
    description: 'For households requiring multiple scheduled visits per week and enhanced home assistance services.',
    benefits: [],
    smallPrint: '',
    cta: 'Coming Soon',
    popular: false,
    comingSoon: true,
  },
  {
    label: 'Concierge Membership',
    price: '',
    priceNote: '',
    tagline: 'COMING SOON.',
    description: 'A premium home assistance experience with priority scheduling, enhanced support and concierge-style service.',
    benefits: [],
    smallPrint: '',
    cta: 'Coming Soon',
    popular: false,
    comingSoon: true,
  },
  {
    label: 'Private Household Membership',
    price: '',
    priceNote: '',
    tagline: 'COMING SOON.',
    description: 'A fully tailored home management experience designed for larger homes and high-touch support requirements.',
    benefits: [],
    smallPrint: '',
    cta: 'Coming Soon',
    popular: false,
    comingSoon: true,
  },
]

const INCLUDES = [
  { t: 'Priority booking', d: 'Your slot is always protected' },
  { t: 'Familiar assistant', d: 'The same person, every time' },
  { t: 'Home profile', d: 'Your preferences stored' },
  { t: 'Concierge support', d: 'Direct WhatsApp line to our team' },
]

// Tier CTA. Silver is full pink; the rest are outlined and invert to
// white-on-black on hover. Hover is purely visual — the link works on tap.
function EnquireButton({ tier, label, popular }) {
  const [hover, setHover] = useState(false)
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: '100%', minHeight: 48, padding: '13px 20px', borderRadius: 12,
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', boxSizing: 'border-box',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
    WebkitTapHighlightColor: 'transparent', cursor: 'pointer',
  }
  const style = popular
    ? { ...base, background: '#EC2461', color: '#fff', border: '1.5px solid #EC2461', opacity: hover ? 0.9 : 1 }
    : {
        ...base,
        background: hover ? '#fff' : 'transparent',
        color: hover ? '#0A0A0A' : '#fff',
        border: `0.5px solid ${hover ? '#fff' : 'rgba(255,255,255,0.2)'}`,
      }
  return (
    <a
      href={enquireHref(tier)}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      {label || `Enquire about ${tier}`} <ArrowRight size={15} />
    </a>
  )
}

// Plain-language explanations for each benefit, shown in a tooltip.
const TOOLTIPS = {
  'Reserved weekly appointment': 'Your appointment time is reserved for you every week — no need to rebook.',
  'Preferred scheduling window': 'Same day, same time, every week — automatically reserved for you.',
  'Priority booking access': 'Your session is always protected and reserved for you first.',
  'Home preferences stored and remembered': 'Your preferences, product choices and access notes stored — no explaining yourself twice.',
  'Dedicated WhatsApp support': 'Direct WhatsApp line to the ClubScrub team for anything you need.',
  'Priority access to peak-demand booking periods': 'First access to high-demand slots including weekends and public holidays.',
  '10% off additional bookings': 'Discount applied automatically to any bookings outside your included weekly visit.',
}

// A benefit row with an optional info tooltip. The "i" toggles on tap and
// shows on hover/focus, so it works on touch and keyboard alike.
function BenefitItem({ label }) {
  const [show, setShow] = useState(false)
  const tip = TOOLTIPS[label]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Check size={14} style={{ color: '#EC2461', flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.5 }}>{label}</span>
      {tip && (
        <span style={{ position: 'relative', display: 'inline-flex', marginTop: 2 }}>
          <button
            type="button"
            aria-label={`More about ${label}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocus={() => setShow(true)}
            onBlur={() => setShow(false)}
            onClick={() => setShow((s) => !s)}
            style={{
              width: 16, height: 16, borderRadius: '50%', background: '#EC2461',
              color: '#fff', fontSize: 10, fontWeight: 700, fontStyle: 'italic',
              fontFamily: 'Georgia, serif', lineHeight: 1, padding: 0, border: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, WebkitTapHighlightColor: 'transparent',
            }}
          >
            i
          </button>
          {show && (
            <span
              role="tooltip"
              style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                transform: 'translateX(-50%)', background: '#1a1a1a',
                border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8,
                padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.85)',
                width: 200, textAlign: 'center', zIndex: 10, pointerEvents: 'none',
                lineHeight: 1.5, fontWeight: 300,
              }}
            >
              {tip}
            </span>
          )}
        </span>
      )}
    </div>
  )
}

function TierCard({ tier }) {
  const soon = tier.comingSoon
  return (
    <div
      style={{
        position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#111',
        border: tier.popular ? '1.5px solid #EC2461' : '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: 32,
        opacity: soon ? 0.35 : 1,
        overflow: soon ? 'hidden' : 'visible',
        pointerEvents: soon ? 'none' : 'auto',
      }}
    >
      {/* Coming-soon watermark — diagonal, kept crisp outside the blurred content */}
      {soon && (
        <span
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-20deg)',
            fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            zIndex: 3, pointerEvents: 'none',
          }}
        >
          Coming Soon
        </span>
      )}

      {/* Card content — blurred when coming soon, leaving card shape + watermark crisp */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', filter: soon ? 'blur(2.5px)' : 'none' }}>
        {tier.popular && (
          <span
            style={{
              position: 'absolute', top: 20, right: 20,
              background: '#EC2461', color: '#fff', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: 100, fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Most popular
          </span>
        )}

        <p className="font-display italic" style={{ fontSize: 28, fontWeight: 500, color: '#fff', lineHeight: 1.1 }}>
          {tier.label}
        </p>
        <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginTop: 6, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
          {tier.tagline}
        </p>
        {tier.price && (
          <>
            <p className="font-display italic" style={{ fontSize: 32, fontWeight: 600, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
              {tier.price}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 300, marginBottom: 16 }}>
              {tier.priceNote}
            </p>
          </>
        )}
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontWeight: 300, marginBottom: 20 }}>
          {tier.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: tier.smallPrint ? 0 : 28 }}>
          {tier.benefits.map((b) => (
            <BenefitItem key={b} label={b} />
          ))}
        </div>

        {tier.smallPrint && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>
            {tier.smallPrint}
          </p>
        )}

        {/* Push CTA to the bottom so cards align regardless of benefit count */}
        <div style={{ marginTop: 'auto' }}>
          {soon ? (
            <button
              type="button"
              disabled
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', minHeight: 48, padding: '13px 20px', borderRadius: 12,
                background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif',
                fontSize: 14, fontWeight: 500, cursor: 'not-allowed', boxSizing: 'border-box',
              }}
            >
              Coming Soon
            </button>
          ) : (
            <EnquireButton tier={tier.label} label={tier.cta} popular={tier.popular} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Membership() {
  return (
    <div className="cs-landing">
      {/* NAV */}
      <nav className="cs-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/" className="cs-nav-hide-mobile" style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Home</Link>
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
          <Link to="/book">
            <button className="cs-btn-primary cs-nav-btn">Book Now</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cs-hero-section">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,36,97,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <FadeUp>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#EC2461', fontWeight: 500, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
            ClubScrub Membership
          </p>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h1 className="font-display italic" style={{ fontSize: 'clamp(34px, 9vw, 48px)', lineHeight: 1.12, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
            Memberships
          </h1>
        </FadeUp>
        <FadeUp delay={0.08}>
          <p className="font-display italic" style={{ fontSize: 'clamp(20px, 5vw, 24px)', color: '#fff', fontWeight: 500, lineHeight: 1.2, marginBottom: 18 }}>
            Your home. Always ready.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 520, fontWeight: 300 }}>
            Enjoy the convenience of a reserved weekly appointment, priority access to booking slots and a home that stays consistently refreshed, organised and guest-ready.
          </p>
        </FadeUp>
      </section>

      {/* MEMBERSHIP TIERS */}
      <section className="cs-section">
        <div className="cs-grid-2" style={{ gap: 16 }}>
          {TIERS.map((tier, i) => (
            <FadeUp key={tier.label} delay={i * 0.05}>
              <TierCard tier={tier} />
            </FadeUp>
          ))}
        </div>
      </section>

      {/* LUXURY CALLOUT */}
      <section style={{ padding: '0 24px' }}>
        <FadeUp>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, textAlign: 'center', marginTop: 48, marginBottom: 48 }}>
            <p className="font-display italic" style={{ fontSize: 22, color: '#fff', lineHeight: 1.4 }}>
              Priority scheduling. Exclusive savings. A home that stays beautifully maintained.
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 12, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7, fontWeight: 300 }}>
              Members receive first access to high-demand appointment times, preferred scheduling windows and discounts on any additional bookings beyond their included Home Resets.
            </p>
          </div>
        </FadeUp>
      </section>

      {/* EVERY MEMBERSHIP INCLUDES */}
      <section className="cs-section">
        <FadeUp>
          <h2 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 24 }}>
            Every membership <span style={{ color: '#EC2461' }}>includes</span>
          </h2>
        </FadeUp>
        <div className="cs-grid-2to4">
          {INCLUDES.map((item, i) => (
            <FadeUp key={item.t} delay={i * 0.04}>
              <div className="cs-card p-4" style={{ height: '100%' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Check size={16} style={{ color: '#EC2461' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.t}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300, lineHeight: 1.5 }}>{item.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ENQUIRY NOTE */}
      <section style={{ margin: '0 24px 40px' }}>
        <div style={{ background: 'rgba(236,36,97,0.1)', border: '0.5px solid rgba(236,36,97,0.25)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <h2 className="font-display italic" style={{ fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 600, marginBottom: 12 }}>
            Membership is by enquiry
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300, maxWidth: 460, margin: '0 auto 24px' }}>
            Contact us on WhatsApp to discuss your household's needs and we'll recommend the right tier for you.
          </p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button className="cs-btn-primary" style={{ fontSize: 15, padding: '15px 32px' }}>
              <MessageCircle size={18} /> Chat with us on WhatsApp <ArrowRight size={16} />
            </button>
          </a>
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
