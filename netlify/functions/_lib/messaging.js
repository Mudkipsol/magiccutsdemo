// Low-level send helpers. Guardrails (consent, quiet hours, caps) are applied by
// _lib/guardrails.js BEFORE these are called — keep these pure "transport".
import { normalizePhone } from './admin.js'

const FROM_EMAIL = process.env.SHOP_EMAIL
const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

// Send one SMS via Twilio. Returns { ok, error }.
export async function sendSMS(to, body) {
  const dest = normalizePhone(to)
  if (!dest) return { ok: false, error: 'invalid phone' }
  try {
    const twilio = (await import('twilio')).default
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    await client.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to: dest, body })
    return { ok: true }
  } catch (e) {
    console.error('sendSMS failed:', e.message)
    return { ok: false, error: e.message }
  }
}

// Send one email via Resend, wrapped in the brand shell used elsewhere.
export async function sendEmail({ to, subject, html, includeUnsub = true }) {
  if (!to || !FROM_EMAIL) return { ok: false, error: 'missing to/from' }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const unsub = includeUnsub
      ? `<hr style="border-color:rgba(255,255,255,0.08);margin-top:40px"><p style="color:#34343d;font-size:11px">Magic Cuts Salon · 2779 Martin Rd · Dublin, OH 43017 · <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(to)}&type=email" style="color:#9a958c">Unsubscribe</a></p>`
      : ''
    await resend.emails.send({
      from: `Magic Cuts <${FROM_EMAIL}>`,
      to,
      subject,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;background:#0a0a0b;color:#f4efe6;border-radius:16px">${html}${unsub}</div>`,
    })
    return { ok: true }
  } catch (e) {
    console.error('sendEmail failed:', e.message)
    return { ok: false, error: e.message }
  }
}
