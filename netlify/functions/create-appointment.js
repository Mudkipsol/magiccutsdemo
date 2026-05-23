import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const body = await req.json()
  const {
    barber_id, service_name, service_price,
    customer_name, customer_email, customer_phone,
    appointment_date, appointment_time, notes,
    stripe_payment_intent_id,
  } = body

  // Insert appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      barber_id: barber_id || null,
      service_name, service_price,
      customer_name, customer_email, customer_phone,
      appointment_date, appointment_time,
      notes, stripe_payment_intent_id,
      deposit_paid: true,
      deposit_amount: 1100,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  // Send confirmation email
  try {
    await resend.emails.send({
      from: `Magic Cuts <${process.env.SHOP_EMAIL}>`,
      to: customer_email,
      subject: `Your appointment is confirmed — Magic Cuts`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0a0b;color:#f4efe6;padding:40px;border-radius:16px">
          <h1 style="color:#c79a3a;font-size:28px;margin-bottom:8px">You're booked, ${customer_name.split(' ')[0]}.</h1>
          <p style="color:#9a958c;margin-top:0">Here's everything you need.</p>
          <table style="width:100%;border-top:1px solid rgba(255,255,255,0.08);margin-top:24px;padding-top:24px">
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Service</td><td style="color:#f4efe6;font-size:14px">${service_name}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Date</td><td style="color:#f4efe6;font-size:14px">${appointment_date}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Time</td><td style="color:#f4efe6;font-size:14px">${appointment_time}</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Location</td><td style="color:#f4efe6;font-size:14px">2779 Martin Rd, Dublin OH 43017</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Deposit paid</td><td style="color:#c79a3a;font-size:14px">$11 ✓</td></tr>
            <tr><td style="color:#9a958c;padding:6px 0;font-size:14px">Balance due</td><td style="color:#f4efe6;font-size:14px">$${service_price - 11} at the shop</td></tr>
          </table>
          <p style="color:#9a958c;font-size:13px;margin-top:32px">Need to reschedule? Call us at (614) 376-0074.</p>
          <p style="color:#34343d;font-size:11px;margin-top:40px">Magic Cuts Salon · 2779 Martin Rd · Dublin, OH 43017</p>
        </div>
      `,
    })
  } catch (e) { console.error('Email failed:', e.message) }

  // Send SMS confirmation via Twilio
  try {
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    if (customer_phone) {
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: customer_phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1'),
        body: `Magic Cuts: You're booked! ${service_name} on ${appointment_date} at ${appointment_time}. 2779 Martin Rd, Dublin OH. Questions? (614) 376-0074`,
      })
    }
  } catch (e) { console.error('SMS failed:', e.message) }

  return Response.json({ appointmentId: data.id })
}

export const config = { path: '/api/create-appointment' }
