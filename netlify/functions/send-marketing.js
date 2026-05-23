import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

// In-memory rate limiter (per serverless instance)
const rateMap = new Map()
function checkRate(key, limit = 3, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now > entry.reset) {
    rateMap.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// Verify the caller is an authenticated owner
async function requireOwner(req) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'owner' ? user : null
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const owner = await requireOwner(req)
  if (!owner) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  if (!checkRate(owner.id)) {
    return new Response(JSON.stringify({ error: 'Too many campaigns — slow down.' }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  const { subject, message, type } = await req.json()
  if (!subject || !message || !type) return new Response('Missing fields', { status: 400 })

  const { data: contacts } = await supabase
    .from('marketing_contacts')
    .select('email, phone')
    .eq(type === 'email' ? 'opted_in_email' : 'opted_in_sms', true)

  if (type === 'email') {
    const emails = (contacts || []).map((c) => c.email).filter(Boolean)
    // Batch send via Resend (50 at a time), each with a personalized unsubscribe link
    for (let i = 0; i < emails.length; i += 50) {
      await resend.batch.send(
        emails.slice(i, i + 50).map((to) => ({
          from: `Magic Cuts <${process.env.SHOP_EMAIL}>`,
          to,
          subject,
          html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;background:#0a0a0b;color:#f4efe6;border-radius:16px">${message}<hr style="border-color:rgba(255,255,255,0.08);margin-top:40px"><p style="color:#34343d;font-size:11px">Magic Cuts Salon · 2779 Martin Rd · Dublin, OH 43017 · <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(to)}&type=email" style="color:#9a958c">Unsubscribe</a></p></div>`,
        }))
      )
    }
    return Response.json({ sent: emails.length, type: 'email' })
  }

  // SMS
  const phones = (contacts || []).map((c) => c.phone).filter(Boolean)
  const twilio = (await import('twilio')).default
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  let sent = 0
  for (const phone of phones) {
    try {
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1'),
        body: `Magic Cuts: ${message.slice(0, 130)} Reply STOP to opt out.`,
      })
      sent++
    } catch { /* continue */ }
  }
  return Response.json({ sent, type: 'sms' })
}

export const config = { path: '/api/send-marketing' }
