// Vercel serverless function — sends a membership application notification to
// the admin via Resend. The Resend secret key is used ONLY here, never client
// side. Recipients are controlled here, never taken from the client.
//
// Local dev: runs under `vercel dev`. With plain `npm run dev` this route does
// not exist, so the client's fetch fails and an inline error is shown.
import { Resend } from 'resend'

const BRAND_PINK = '#EC2461'

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.5);vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#ffffff;text-align:right;font-weight:500;">${value}</td>
  </tr>`
}

function buildEmailHtml(app) {
  const support = Array.isArray(app.support) ? app.support : []
  const mediaUrls = Array.isArray(app.mediaUrls) ? app.mediaUrls : []

  const supportHtml = support.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;">${support
        .map(s => `<li style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:6px;">${escapeHtml(s)}</li>`)
        .join('')}</ul>`
    : `<p style="font-size:13px;color:rgba(255,255,255,0.55);margin:8px 0 0;">None specified.</p>`

  const notesHtml = app.notes && String(app.notes).trim()
    ? `<div style="margin-top:24px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Additional notes</div>
        <p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin:0;">${escapeHtml(app.notes)}</p>
      </div>`
    : ''

  const mediaHtml = mediaUrls.length
    ? `<div style="margin-top:24px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Property media (${mediaUrls.length})</div>
        <ul style="margin:0;padding-left:18px;">${mediaUrls
          .map((url, i) => `<li style="margin-bottom:6px;"><a href="${escapeHtml(url)}" style="font-size:13px;color:${BRAND_PINK};text-decoration:underline;">View file ${i + 1}</a></li>`)
          .join('')}</ul>
      </div>`
    : ''

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;background:#0A0A0A;">
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px;">
      <span style="color:#ffffff;">Club</span><span style="color:${BRAND_PINK};">Scrub</span>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:28px;">Professional Home Assistance, Done Right.</div>

    <h1 style="font-size:20px;font-weight:600;margin:0 0 24px;color:#ffffff;">New membership application</h1>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin-bottom:8px;">Applicant</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', escapeHtml(app.name || '—'))}
      ${row('Email', escapeHtml(app.email || '—'))}
      ${row('Phone', escapeHtml(app.phone || '—'))}
    </table>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 8px;">Home</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Area', escapeHtml(app.area || '—'))}
      ${row('Property type', escapeHtml(app.propertyType || '—'))}
      ${row('Approximate size', escapeHtml(app.size || '—'))}
      ${row('Household size', escapeHtml(app.householdSize || '—'))}
    </table>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 8px;">Preferences</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Frequency', escapeHtml(app.frequency || '—'))}
      ${row('Preferred days', escapeHtml(Array.isArray(app.preferredDays) && app.preferredDays.length ? app.preferredDays.join(', ') : '—'))}
      ${row('Preferred time', escapeHtml(app.time || '—'))}
    </table>

    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);margin:24px 0 0;">Support needed</div>
    ${supportHtml}
    ${notesHtml}
    ${mediaHtml}

    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">
      Sent by ClubScrub membership system
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
    const app = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!app || !app.name || !app.email) {
      return res.status(400).json({ error: 'Invalid application payload.' })
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `New Membership Application — ${app.name}`,
      html: buildEmailHtml(app),
    })

    if (error) {
      return res.status(500).json({ error: 'Failed to send application email.', detail: String(error?.message || error) })
    }

    return res.status(200).json({ ok: true, id: data?.id || null })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send application email.', detail: String(err?.message || err) })
  }
}
