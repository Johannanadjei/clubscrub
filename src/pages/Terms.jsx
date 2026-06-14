import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo, FadeUp, Divider } from '../components/UI.jsx'

const SECTIONS = [
  {
    h: '1. Introduction',
    p: `ClubScrub Home Assistance ("ClubScrub", "we", "us") provides professional home assistance and light cleaning services to customers in Accra, Ghana. By booking a session with us, you ("the customer", "you") agree to these Terms & Conditions. Please read them carefully before making a booking.`,
  },
  {
    h: '2. Booking & Payment',
    p: `A booking is confirmed only once payment has been received. All sessions are subject to a minimum booking of 3 hours at a minimum rate of GH₵ 349. Additional time is charged at GH₵ 100 per extra hour, rounded up to the next whole hour. Bookings on a Sunday attract a flat GH₵ 50 weekend surcharge. The price shown to you before payment reflects the tasks and time you have selected; we do not add hidden fees.`,
  },
  {
    h: '3. Cancellation Policy',
    p: `Cancellations made more than 24 hours before your scheduled appointment are eligible for a full refund. Cancellations made within 24 hours of the appointment are non-refundable, as your assistant has already been scheduled. Refunds, where applicable, are processed via Mobile Money or bank transfer.`,
  },
  {
    h: '4. Service Standards',
    p: `Every ClubScrub Assistant is carefully selected, trained, and supervised before accepting jobs. We are committed to delivering consistent, high-quality home assistance. ClubScrub reserves the right to refuse or discontinue service where a working environment is unsafe, where staff are mistreated, or where the requested work falls outside the scope of our services.`,
  },
  {
    h: '5. Client Responsibilities',
    p: `You agree to provide a safe and reasonable working environment for your assistant, including access to the property at the agreed time. Harassment, abuse, or any form of mistreatment of our staff will not be tolerated and may result in immediate termination of the session without refund. Please secure any valuables and inform us of any hazards before the appointment.`,
  },
  {
    h: '6. Liability',
    p: `ClubScrub is not liable for pre-existing damage, wear, or defects to your property or belongings. In the unlikely event of damage directly caused by our negligence, our total liability is limited to the value of the service fee paid for the affected booking. We are not responsible for loss arising from circumstances beyond our reasonable control.`,
  },
  {
    h: '7. Privacy',
    p: `We collect only the information needed to deliver your booking, such as your name, contact details, and address. Your data is used solely for service delivery and customer support. We do not sell or rent your personal information to third parties. Reasonable measures are taken to keep your data secure.`,
  },
  {
    h: '8. Governing Law',
    p: `These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from your use of our services shall be subject to the jurisdiction of the Ghanaian courts.`,
  },
  {
    h: '9. Contact',
    p: `For any questions about these Terms & Conditions or your booking, please contact us at info@club-scrub.com. We aim to respond to all enquiries promptly.`,
  },
]

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
            The terms below govern your use of ClubScrub Home Assistance services in Accra, Ghana.
          </p>
        </FadeUp>
      </section>

      <Divider />

      {/* SECTIONS */}
      <section className="cs-section">
        {SECTIONS.map((s, i) => (
          <FadeUp key={s.h} delay={i * 0.03}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: '#EC2461', marginBottom: 8 }}>{s.h}</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.8 }}>{s.p}</p>
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
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontWeight: 300 }}>
          Professional Home Assistance, Done Right.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
          <a href="mailto:info@club-scrub.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>info@club-scrub.com</a>
        </div>
      </footer>
    </div>
  )
}
