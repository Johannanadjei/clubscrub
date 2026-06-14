// Client-side entry point for sending booking emails.
// Tries the secure /api endpoint first (real Resend send). If that endpoint is
// unavailable (plain `npm run dev`, missing key, network error), it falls back
// to logging the fully-built emails to the console so nothing is silently lost.
//
// This function NEVER throws — a failed/booked email must not break the booking
// flow (CLAUDE.md: never block a confirmed booking on a side effect).
import { buildAdminEmail, buildCustomerEmail } from './emailTemplates.js'

const ENDPOINT = '/api/send-booking-emails'

function logFallback(booking, reason) {
  const admin = buildAdminEmail(booking)
  const customer = buildCustomerEmail(booking)
  // eslint-disable-next-line no-console
  console.groupCollapsed(`[ClubScrub] Email fallback (${reason}) — not actually sent`)
  // eslint-disable-next-line no-console
  console.log('ADMIN →', admin.to, '|', admin.subject)
  // eslint-disable-next-line no-console
  console.log(admin.text)
  // eslint-disable-next-line no-console
  console.log('CUSTOMER →', customer.to, '|', customer.subject)
  // eslint-disable-next-line no-console
  console.log(customer.text)
  // eslint-disable-next-line no-console
  console.groupEnd()
}

export async function sendBookingEmails(booking) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    })

    if (!res.ok) {
      // Endpoint exists but failed (e.g. missing key / Resend error) → fall back.
      logFallback(booking, `endpoint ${res.status}`)
      return { ok: false, fallback: true }
    }

    return { ok: true, fallback: false }
  } catch (err) {
    // Endpoint not reachable at all (likely plain `npm run dev`) → fall back.
    logFallback(booking, 'endpoint unavailable')
    return { ok: false, fallback: true }
  }
}
