// Vercel serverless function — the ONLY place the Resend secret key is used.
// Receives a booking object from the client (fire-and-forget) and sends a
// single admin notification email via Resend. Recipients are controlled here,
// never taken from the client.
//
// Local dev: runs under `vercel dev`. With plain `npm run dev` this route does
// not exist, so the client's fetch simply fails silently (fire-and-forget).
import { Resend } from 'resend'

const BRAND_PINK = '#EC2461'

// GH₵ X,XXX (CLAUDE.md currency rule)
function formatCurrency(n) {
  return `GH₵ ${Number(n || 0).toLocaleString()}`
}

// YYYY-MM-DD -> DD/MM/YYYY (CLAUDE.md Ghana display format)
function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

// Sunday check for a 'YYYY-MM-DD' string (parsed as a local date).
function isSunday(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number)
  if (!y || !m || !d) return false
  return new Date(y, m - 1, d).getDay() === 0
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.5);">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#ffffff;text-align:right;font-weight:500;">${value}</td>
  </tr>`
}

function buildAdminEmailHtml(booking) {
  const customer = booking.customer || {}
  const tasks = Array.isArray(booking.tasks) ? booking.tasks : []
  const mediaUrls = Array.isArray(booking.mediaUrls) ? booking.mediaUrls : []
  // Multi-date bookings carry a `dates` array; fall back to legacy single `date`.
  const dates = Array.isArray(booking.dates) && booking.dates.length
    ? booking.dates
    : (booking.date ? [booking.date] : [])
  const totalVisits = booking.totalVisits || dates.length

  const datesHtml = dates.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;">${dates
        .map(d => `<li style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:6px;">${escapeHtml(formatDate(d))}${isSunday(d) ? ` <span style="color:${BRAND_PINK};">· Sunday (+surcharge)</span>` : ''}</li>`)
        .join('')}</ul>`
    : `<p style="font-size:13px;color:rgba(255,255,255,0.55);margin:8px 0 0;">—</p>`

  const tasksHtml = tasks.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;">${tasks
        .map(t => `<li style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:6px;">${escapeHtml(t)}</li>`)
        .join('')}</ul>`
    : `<p style="font-size:13px;color:rgba(255,255,255,0.55);margin:8px 0 0;">No specific tasks selected — assistant will confirm priorities before arrival.</p>`

  const notesHtml = booking.notes && String(booking.notes).trim()
    ? `<div style="margin-top:24px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Notes</div>
        <p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin:0;">${escapeHtml(booking.notes)}</p>
      </div>`
    : ''

  // Inline images don't render with onboarding@resend.dev, so link instead.
  const mediaHtml = mediaUrls.length
    ? `<div style="margin-top:24px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Media uploads (${mediaUrls.length})</div>
        <ul style="margin:0;padding-left:18px;">${mediaUrls
          .map((url, i) => `<li style="margin-bottom:6px;"><a href="${escapeHtml(url)}" style="font-size:13px;color:${BRAND_PINK};text-decoration:underline;">View photo ${i + 1}</a></li>`)
          .join('')}</ul>
      </div>`
    : ''

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;background:#0A0A0A;">
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px;">
      <span style="color:#ffffff;">Club</span><span style="color:${BRAND_PINK};">Scrub</span>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:28px;">Professional Home Assistance, Done Right.</div>

    <h1 style="font-size:20px;font-weight:600;margin:0 0 6px;color:#ffffff;">New booking received</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0 0 24px;">
      Reference <strong style="color:${BRAND_PINK};">${escapeHtml(booking.id)}</strong>
    </p>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Customer</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${row('Name', escapeHtml(customer.name || '—'))}
      ${row('Phone', escapeHtml(customer.phone || '—'))}
      ${row('Email', escapeHtml(customer.email || '—'))}
      ${row('Address', escapeHtml(customer.address || '—'))}
    </table>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 8px;">Booking</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Area', escapeHtml(booking.area || '—'))}
      ${row('Total visits', escapeHtml(String(totalVisits)))}
      ${row('Time', escapeHtml(booking.timeSlot || '—'))}
      ${booking.perVisit ? row('Per visit', formatCurrency(booking.perVisit)) : ''}
      ${booking.surcharge > 0 ? row('Sunday surcharge', formatCurrency(booking.surcharge)) : ''}
      ${row('Total', `<span style="color:${BRAND_PINK};font-weight:700;">${formatCurrency(booking.totalPrice ?? booking.total)}</span>`)}
    </table>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 0;">Dates (${totalVisits})</div>
    ${datesHtml}

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 0;">Tasks</div>
    ${tasksHtml}
    ${notesHtml}
    ${mediaHtml}

    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">
      Sent by ClubScrub booking system
    </div>
  </div></body></html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Email is not configured (RESEND_API_KEY missing).' })
  }

  const from = process.env.EMAIL_FROM || 'ClubScrub <onboarding@resend.dev>'
  const to = process.env.ADMIN_EMAIL
  if (!to) {
    return res.status(500).json({ error: 'Email is not configured (ADMIN_EMAIL missing).' })
  }

  try {
    const booking = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!booking || !booking.id) {
      return res.status(400).json({ error: 'Invalid booking payload.' })
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `New ClubScrub Booking — ${booking.id}`,
      html: buildAdminEmailHtml(booking),
    })

    if (error) {
      return res.status(502).json({ error: 'Failed to send admin email.', detail: String(error?.message || error) })
    }

    return res.status(200).json({ ok: true, id: data?.id || null })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send admin email.', detail: String(err?.message || err) })
  }
}
