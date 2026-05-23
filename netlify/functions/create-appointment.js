import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

// In-memory rate limiter (per serverless instance; good enough for abuse deterrence)
const rateMap = new Map()
function checkRate(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function escHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function stripHtml(str) {
  if (!str) return ''
  return String(str).replace(/<[^>]*>/g, '').slice(0, 1000)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ip =
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (!checkRate(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  const body = await req.json()
  const {
    barber_id, service_name, service_price,
    customer_name, customer_email, customer_phone,
    appointment_date, appointment_time, notes,
    stripe_payment_intent_id,
  } = body

  // Validate required fields
  if (!service_name || !customer_name || !customer_email || !customer_phone ||
      !appointment_date || !appointment_time) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  // Sanitize text inputs that go into email HTML
  const safeName = escHtml(stripHtml(customer_name))
  const safeService = escHtml(stripHtml(service_name))
  const safeNotes = notes ? escHtml(stripHtml(notes)) : null
  const safeDate = escHtml(appointment_date)
  const safeTime = escHtml(appointment_time)
  const safePrice = parseInt(service_price) || 0

  // Only store a valid UUID barber_id; anything else (e.g. "any") becomes null
  // so the foreign-key constraint can't reject the whole booking.
  const safeBarberId = barber_id && UUID_RE.test(barber_id) ? barber_id : null

  // Insert appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      barber_id: safeBarberId,
      service_name: stripHtml(service_name),
      service_price: safePrice,
      customer_name: stripHtml(customer_name),
      customer_email: customer_email.slice(0, 254),
      customer_phone: customer_phone.replace(/[^0-9+\-() ]/g, '').slice(0, 20),
      appointment_date, appointment_time,
      notes: safeNotes,
      stripe_payment_intent_id,
      deposit_paid: true,
      deposit_amount: 1100,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const siteUrl = process.env.SITE_URL || 'https://www.magicutsalon.com'
  const manageUrl = `${siteUrl}/manage?id=${data.id}`
  const shopAddress = '2779 Martin Rd, Dublin OH 43017'
  const shopPhone = '(614) 376-0074'

  // Send confirmation email
  try {
    await resend.emails.send({
      from: `Magic Cuts <${process.env.SHOP_EMAIL}>`,
      to: customer_email,
      subject: `Your appointment is confirmed — Magic Cuts`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0a0b;color:#f4efe6;padding:40px;border-radius:16px">
          <h1 style="color:#c79a3a;font-size:28px;margin-bottom:8px">You're booked, ${safeName.split(' ')[0]}.</h1>
          <p style="color:#9a958c;margin-top:0">Here's everything you need.</p>
          <table style="width:100%;border-top:1px solid rgba(255,255,255,0.08);margin-top:24px;padding-top:24px">
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Service</td><td style="color:#f4efe6;font-size:14px">${safeService}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Date</td><td style="color:#f4efe6;font-size:14px">${safeDate}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Time</td><td style="color:#f4efe6;font-size:14px">${safeTime}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Location</td><td style="color:#f4efe6;font-size:14px">${shopAddress}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Deposit paid</td><td style="color:#c79a3a;font-size:14px">$11 ✓</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Balance due</td><td style="color:#f4efe6;font-size:14px">$${safePrice - 11} at the shop</td></tr>
          </table>
          <div style="margin-top:28px;text-align:center">
            <a href="${manageUrl}" style="display:inline-block;background:#c79a3a;color:#0a0a0b;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:10px;font-size:14px">View / manage my booking</a>
          </div>
          <div style="margin-top:24px;background:#16161a;border-radius:12px;padding:18px;border:1px solid rgba(199,154,58,0.15)">
            <p style="color:#9a958c;font-size:13px;margin:0 0 10px 0">Need to reschedule or cancel?</p>
            <p style="margin:0;font-size:14px">
              Call us: <a href="tel:+16143760074" style="color:#c79a3a">${shopPhone}</a>
              &nbsp;·&nbsp;
              <a href="mailto:hello@magicutsalon.com" style="color:#c79a3a">hello@magicutsalon.com</a>
            </p>
          </div>
          <p style="color:#34343d;font-size:11px;margin-top:40px">
            Magic Cuts Salon · 2779 Martin Rd · Dublin, OH 43017<br>
            <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(customer_email)}&type=email" style="color:#555">Unsubscribe from marketing emails</a>
          </p>
        </div>
      `,
    })
  } catch (e) { console.error('Customer email failed:', e.message) }

  // Notify the shop owner of the new booking
  try {
    if (process.env.SHOP_EMAIL) {
      await resend.emails.send({
        from: `Magic Cuts Bookings <${process.env.SHOP_EMAIL}>`,
        to: process.env.SHOP_EMAIL,
        replyTo: customer_email,
        subject: `New booking — ${safeService} · ${safeDate} ${safeTime}`,
        html: `
          <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;border:1px solid #eee;border-radius:12px">
            <h2 style="margin:0 0 4px 0">New appointment booked</h2>
            <p style="color:#666;margin:0 0 20px 0">Deposit of $11 paid via Stripe.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="color:#888;padding:6px 0">Customer</td><td><strong>${safeName}</strong></td></tr>
              <tr><td style="color:#888;padding:6px 0">Service</td><td>${safeService} ($${safePrice})</td></tr>
              <tr><td style="color:#888;padding:6px 0">Date</td><td>${safeDate}</td></tr>
              <tr><td style="color:#888;padding:6px 0">Time</td><td>${safeTime}</td></tr>
              <tr><td style="color:#888;padding:6px 0">Phone</td><td>${escHtml(customer_phone)}</td></tr>
              <tr><td style="color:#888;padding:6px 0">Email</td><td>${escHtml(customer_email)}</td></tr>
              ${safeNotes ? `<tr><td style="color:#888;padding:6px 0;vertical-align:top">Notes</td><td>${safeNotes}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px"><a href="${siteUrl}/dashboard" style="color:#c79a3a">Open dashboard →</a></p>
          </div>
        `,
      })
    }
  } catch (e) { console.error('Owner email failed:', e.message) }

  // Send SMS confirmation via Twilio
  try {
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    if (customer_phone) {
      const cleanPhone = customer_phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1')
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: cleanPhone,
        body: `Magic Cuts: You're booked! ${stripHtml(service_name)} on ${appointment_date} at ${appointment_time}. 2779 Martin Rd, Dublin OH. Questions? ${shopPhone}`,
      })
    }
  } catch (e) { console.error('SMS failed:', e.message) }

  return Response.json({ appointmentId: data.id })
}

export const config = { path: '/api/create-appointment' }
