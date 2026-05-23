import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const REVIEW_URL = process.env.GOOGLE_REVIEW_URL ||
  'https://www.google.com/maps/search/?api=1&query=Magic+Cuts+Salon+Dublin+OH'

// Runs hourly. Sends a Google review request ~2h after an appointment's start
// time, once per appointment. Note: appointment_time is shop-local; this uses
// server (UTC) time, so the 2–4h window absorbs the offset rather than being
// minute-precise. Good enough for a review nudge.
export default async () => {
  const now = Date.now()
  const todayStr = new Date(now).toISOString().slice(0, 10)
  const yesterdayStr = new Date(now - 86_400_000).toISOString().slice(0, 10)

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('id, customer_name, customer_phone, appointment_date, appointment_time, status, review_sms_sent')
    .in('appointment_date', [todayStr, yesterdayStr])
    .in('status', ['confirmed', 'completed'])
    .eq('review_sms_sent', false)

  if (error) {
    console.error('Review query failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const due = (appts || []).filter((a) => {
    const start = new Date(`${a.appointment_date}T${a.appointment_time}`)
    const elapsed = now - start.getTime()
    return elapsed >= 2 * 3600_000 && elapsed <= 6 * 3600_000
  })

  if (!due.length) return Response.json({ sent: 0 })

  let sent = 0
  let client = null
  try {
    const twilio = (await import('twilio')).default
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  } catch (e) {
    console.error('Twilio init failed:', e.message)
    return Response.json({ error: 'sms unavailable' }, { status: 500 })
  }

  for (const a of due) {
    if (!a.customer_phone) continue
    try {
      const firstName = (a.customer_name || '').split(' ')[0]
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: a.customer_phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1'),
        body: `Thanks for visiting Magic Cuts${firstName ? `, ${firstName}` : ''}! Hope you're loving the cut. A quick Google review means the world to us: ${REVIEW_URL} Reply STOP to opt out.`,
      })
      await supabase.from('appointments').update({ review_sms_sent: true }).eq('id', a.id)
      sent++
    } catch (e) {
      console.error(`Review SMS failed for ${a.id}:`, e.message)
    }
  }

  return Response.json({ sent })
}

// Netlify scheduled function — runs at the top of every hour
export const config = { schedule: '@hourly' }
