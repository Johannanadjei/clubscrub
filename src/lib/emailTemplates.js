// Pure, dependency-light email builders shared by BOTH the Vercel serverless
// function (real sending) and the client-side console fallback. No browser- or
// Node-specific APIs and no env access here, so it imports cleanly on both sides.
import { ZONES, formatDuration } from '../data/index.js'

export const ADMIN_EMAIL = 'info@club-scrub.com'
export const BRAND_PINK = '#EC2461'

// GH₵ X,XXX (CLAUDE.md currency rule)
export function formatCurrency(n) {
  return `GH₵ ${Number(n || 0).toLocaleString()}`
}

// YYYY-MM-DD -> DD/MM/YYYY (CLAUDE.md Ghana display format)
export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

// Address verification flag (CLAUDE.md address rules): an address is considered
// unverified — and flagged for admin follow-up — when it is too short, is just
// the area name, or is all digits. Never blocks a booking; only flags it.
export function isAddressVerified(address = '', area = '') {
  const a = String(address).trim()
  if (a.length < 10) return false
  if (area && a.toLowerCase() === String(area).trim().toLowerCase()) return false
  if (/^\d+$/.test(a.replace(/\s/g, ''))) return false
  return true
}

function serviceLabel(booking) {
  const count = booking.tasks?.length || 0
  const est = booking.estMins ? ` · est. ${formatDuration(booking.estMins)}` : ''
  return `${count} task${count === 1 ? '' : 's'}${est}`
}

function tasksList(booking) {
  const tasks = booking.tasks || []
  if (!tasks.length) return ['No specific tasks selected — assistant will confirm priorities before arrival.']
  return tasks
}

function paymentText(booking) {
  const label = booking.paymentLabel || booking.payment || '—'
  const status = {
    paid: 'Paid online',
    cash_on_arrival: 'Cash on arrival',
    pending: 'Awaiting payment',
  }[booking.paymentStatus] || booking.paymentStatus || 'Awaiting payment'
  return `${label} (${status})`
}

// Shared dark/branded shell so both emails look consistent.
function shell(title, innerHtml) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;background:#0A0A0A;">
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px;">
      <span style="color:#ffffff;">Club</span><span style="color:${BRAND_PINK};">Scrub</span>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:28px;">Professional Home Assistance, Done Right.</div>
    <h1 style="font-size:20px;font-weight:600;margin:0 0 20px;color:#ffffff;">${title}</h1>
    ${innerHtml}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">
      ClubScrub Home Assistance · Accra, Ghana<br/>
      Questions? Reply to this email or contact ${ADMIN_EMAIL}.
    </div>
  </div></body></html>`
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.5);">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#ffffff;text-align:right;font-weight:500;">${value}</td>
  </tr>`
}

function detailTable(booking) {
  const zone = ZONES[booking.zone]?.label
  return `<table style="width:100%;border-collapse:collapse;">
    ${row('Reference', `<span style="color:${BRAND_PINK};font-weight:700;">${booking.id}</span>`)}
    ${row('Service', serviceLabel(booking))}
    ${row('Area', `${booking.area || '—'}${zone ? ` (${zone})` : ''}`)}
    ${row('Date', formatDate(booking.date))}
    ${row('Time', booking.timeSlot || '—')}
    ${row('Total', `<span style="color:${BRAND_PINK};font-weight:700;">${formatCurrency(booking.total)}</span>`)}
  </table>`
}

function tasksHtml(booking) {
  const items = tasksList(booking).map(t =>
    `<li style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:6px;">${t}</li>`).join('')
  return `<ul style="margin:8px 0 0;padding-left:18px;">${items}</ul>`
}

// ---------------- ADMIN ALERT (to info@club-scrub.com) ----------------
export function buildAdminEmail(booking) {
  const verified = isAddressVerified(booking.customer?.address, booking.area)
  const flag = verified
    ? ''
    : `<div style="background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:13px;color:#FBBF24;">
        ⚠ Address looks brief or unverifiable — call the customer to confirm location before the appointment.
       </div>`

  const inner = `
    ${flag}
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      ${detailTable(booking)}
    </div>
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-bottom:12px;">Customer</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', booking.customer?.name || '—')}
        ${row('Phone', booking.customer?.phone || '—')}
        ${row('Email', booking.customer?.email || '—')}
        ${row('Address', booking.customer?.address || '—')}
        ${row('Address verified', verified ? 'Yes' : 'No — needs follow-up')}
        ${row('Payment', paymentText(booking))}
      </table>
    </div>
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Tasks</div>
      ${tasksHtml(booking)}
      ${booking.notes ? `<div style="margin-top:14px;font-size:13px;color:rgba(255,255,255,0.6);"><strong style="color:rgba(255,255,255,0.8);">Notes:</strong> ${booking.notes}</div>` : ''}
      ${booking.customer?.notes ? `<div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.6);"><strong style="color:rgba(255,255,255,0.8);">Access:</strong> ${booking.customer.notes}</div>` : ''}
    </div>`

  return {
    to: ADMIN_EMAIL,
    subject: `${verified ? '' : '⚠ '}New booking ${booking.id} — ${booking.customer?.name || 'Guest'}`,
    html: shell('New booking received', inner),
    text:
      `New booking ${booking.id}\n` +
      `Customer: ${booking.customer?.name} · ${booking.customer?.phone} · ${booking.customer?.email}\n` +
      `Address: ${booking.customer?.address} (verified: ${verified ? 'yes' : 'NO — follow up'})\n` +
      `Service: ${serviceLabel(booking)}\n` +
      `Area: ${booking.area} · Date: ${formatDate(booking.date)} · ${booking.timeSlot}\n` +
      `Tasks: ${tasksList(booking).join(', ')}\n` +
      `Payment: ${paymentText(booking)}\n` +
      `Total: ${formatCurrency(booking.total)}`,
  }
}

// ---------------- CUSTOMER CONFIRMATION ----------------
export function buildCustomerEmail(booking) {
  const inner = `
    <p style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;margin:0 0 20px;">
      Hi ${booking.customer?.name?.split(' ')[0] || 'there'}, your booking is confirmed. Here are the details — keep your reference handy.
    </p>
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      ${detailTable(booking)}
    </div>
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Your tasks</div>
      ${tasksHtml(booking)}
    </div>
    <p style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.6;margin:0;">
      ClubScrub focuses on light home upkeep and household support. Specialist or deep-cleaning services are not included.
      Cancellations made more than 24 hours before your appointment are fully refunded; cancellations within 24 hours are non-refundable.
    </p>`

  return {
    to: booking.customer?.email,
    subject: `Your ClubScrub booking is confirmed — ${booking.id}`,
    html: shell('Booking confirmed', inner),
    text:
      `Your ClubScrub booking is confirmed.\n` +
      `Reference: ${booking.id}\n` +
      `Service: ${serviceLabel(booking)}\n` +
      `Area: ${booking.area} · Date: ${formatDate(booking.date)} · ${booking.timeSlot}\n` +
      `Total: ${formatCurrency(booking.total)}\n\n` +
      `Thank you for choosing ClubScrub.`,
  }
}
