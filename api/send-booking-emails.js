// Vercel serverless function — the ONLY place the Resend secret key is used.
// Receives a booking object, builds both emails server-side (recipients are
// controlled here, never taken from the client), and sends via Resend.
//
// Local dev: runs under `vercel dev`. With plain `npm run dev` this route does
// not exist, so the client falls back to console-logging the emails.
import { buildAdminEmail, buildCustomerEmail } from '../src/lib/emailTemplates.js'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

async function sendViaResend(apiKey, from, { to, subject, html, text }) {
  if (!to) return { skipped: true, reason: 'no recipient' }
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.message || `Resend responded ${res.status}`)
  }
  return { id: body?.id || null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Misconfiguration — surface clearly so the client falls back to console.
    return res.status(500).json({ error: 'Email is not configured (RESEND_API_KEY missing).' })
  }

  // Resend requires a verified sender domain. Set EMAIL_FROM in your env once
  // club-scrub.com is verified in Resend; until then this default will be rejected.
  const from = process.env.EMAIL_FROM || 'ClubScrub <bookings@club-scrub.com>'

  try {
    const booking = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!booking || !booking.id) {
      return res.status(400).json({ error: 'Invalid booking payload.' })
    }

    const admin = buildAdminEmail(booking)
    const customer = buildCustomerEmail(booking)

    // Send both independently — one failing must not block the other.
    const [adminResult, customerResult] = await Promise.allSettled([
      sendViaResend(apiKey, from, admin),
      sendViaResend(apiKey, from, customer),
    ])

    return res.status(200).json({
      ok: true,
      admin: adminResult.status === 'fulfilled' ? adminResult.value : { error: String(adminResult.reason?.message || adminResult.reason) },
      customer: customerResult.status === 'fulfilled' ? customerResult.value : { error: String(customerResult.reason?.message || customerResult.reason) },
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send booking emails.', detail: String(err?.message || err) })
  }
}
