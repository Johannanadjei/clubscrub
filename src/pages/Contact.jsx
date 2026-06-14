import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Instagram, ArrowRight } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'

const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'Chat on WhatsApp',
    value: '+233 59 720 7741',
    href: 'https://wa.me/233597207741',
    external: true,
  },
  {
    icon: Mail,
    label: 'Send us an email',
    value: 'info@club-scrub.com',
    href: 'mailto:info@club-scrub.com',
    external: false,
  },
  {
    icon: Instagram,
    label: '@clubscrub_gh',
    value: 'Follow us on Instagram',
    href: 'https://instagram.com/clubscrub_gh',
    external: true,
  },
]

function ContactCard({ icon: Icon, label, value, href, external }) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a href={href} {...linkProps} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="cs-card" style={{ padding: 24, height: '100%' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(236,36,97,0.12)', border: '0.5px solid rgba(236,36,97,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={20} style={{ color: '#EC2461' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{value}</p>
      </div>
    </a>
  )
}

export default function Contact() {
  return (
    <div className="cs-landing">
      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>Contact</Link>
          <Link to="/book">
            <button className="cs-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Book Now</button>
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="cs-section">
        <FadeUp>
          <h1 className="font-display italic cs-h2" style={{ fontWeight: 500, marginBottom: 8 }}>
            Get in <span style={{ color: '#EC2461' }}>touch</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.7 }}>
            We're here to help. Reach us through any of the channels below.
          </p>
        </FadeUp>
      </section>

      {/* CONTACT CARDS */}
      <section className="cs-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {CHANNELS.map((c, i) => (
            <FadeUp key={c.label} delay={i * 0.05}>
              <ContactCard {...c} />
            </FadeUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* LOCATION */}
      <section className="cs-section">
        <FadeUp>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Where we work</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.8 }}>
            Based in Accra, Ghana — serving East Legon, Airport, Cantonments, Labone, Ridge, Osu, Dzorwulu and surrounding areas.
          </p>
        </FadeUp>
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
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy Policy</Link>
          <a href="mailto:info@club-scrub.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>info@club-scrub.com</a>
        </div>
      </footer>
    </div>
  )
}
