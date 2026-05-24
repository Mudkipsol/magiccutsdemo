// Appointment reminders + no-show shield cron.
// Tier 1: 48h reminder (transactional, auto-send)
// Tier 2: 2h reminder with reschedule link (transactional, auto-send)
// Tier 3: no-show detection → offer freed slot to best-fit waitlist customer
import { admin, normalizePhone } from './_lib/admin.js'
import { gateOutbound, logAction } from './_lib/guardrails.js'
import { sendSMS } from './_lib/messaging.js'

const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

function shopLocalHour() {
  return Number(new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', hour12: false, timeZone: 'America/New_York',
  }).format(new Date()))
}

async function send(customer, body, agentAction) {
  const gate = await gateOutbound({ customer, channel: 'sms', kind: 'transactional' })
  if (!gate.allowed) {
    await logAction({ agent: 'reminders', customer_id: customer.id, action: agentAction, payload: { body }, status: 'skipped', reason: gate.reason })
    return false
  }
  const result = await sendSMS(customer.phone, `${body}\n\nReply STOP to opt out.`)
  await logAction({ agent: 'reminders', customer_id: customer.id, action: agentAction, payload: { body }, status: result.ok ? 'auto_sent' : 'failed', reason: result.error })
  return result.ok
}

export default async () => {
  if (!process.env.TWILIO_ACCOUNT_SID) return Response.json({ skipped: 'no twilio' })

  const now = Date.now()
  const nowIso = new Date(now).toISOString()
  let sent48 = 0, sent2h = 0, filledGaps = 0

  // ── Fetch upcoming confirmed appointments with customer data ─────────────────
  const in49h = new Date(now + 49 * 3600_000).toISOString().slice(0, 10)
  const todayStr = new Date(now).toISOString().slice(0, 10)

  const { data: appts } = await admin
    .from('appointments')
    .select('id, appointment_date, appointment_time, service_name, barber_id, customer_id, customer_name, customer_phone, reminder_48h_sent, reminder_2h_sent, status')
    .in('appointment_date', [todayStr, in49h])
    .in('status', ['pending', 'confirmed'])

  for (const a of appts || []) {
    const apptMs = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
    const hoursUntil = (apptMs - now) / 3600_000

    // Resolve customer (prefer linked customer_id, fallback to phone lookup)
    let customer = null
    if (a.customer_id) {
      const { data } = await admin.from('customers').select('*').eq('id', a.customer_id).single()
      customer = data
    }
    if (!customer && a.customer_phone) {
      const { data } = await admin.from('customers').select('*').eq('phone', normalizePhone(a.customer_phone)).maybeSingle()
      customer = data
    }
    if (!customer) continue

    const firstName = (customer.name || a.customer_name || '').split(' ')[0] || 'there'
    const dateLabel = new Date(a.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    // 48h reminder window: 24–49h before
    if (hoursUntil >= 24 && hoursUntil <= 49 && !a.reminder_48h_sent) {
      const body = `Hi ${firstName}! Reminder: you're booked at Magic Cuts on ${dateLabel} at ${a.appointment_time}. Need to reschedule? ${SITE_URL}/book`
      const ok = await send(customer, body, 'reminder_48h')
      if (ok) {
        await admin.from('appointments').update({ reminder_48h_sent: true }).eq('id', a.id)
        sent48++
      }
    }

    // 2h reminder window: 1.5–3h before
    if (hoursUntil >= 1.5 && hoursUntil <= 3 && !a.reminder_2h_sent) {
      const body = `See you soon, ${firstName}! Your cut is at ${a.appointment_time} today. Magic Cuts · 2779 Martin Rd, Dublin OH`
      const ok = await send(customer, body, 'reminder_2h')
      if (ok) {
        await admin.from('appointments').update({ reminder_2h_sent: true }).eq('id', a.id)
        sent2h++
      }
    }
  }

  // ── No-show detection: appointments that started >30min ago, still pending ───
  const { data: noShows } = await admin
    .from('appointments')
    .select('id, appointment_date, appointment_time, barber_id')
    .eq('appointment_date', todayStr)
    .eq('status', 'pending')

  for (const ns of noShows || []) {
    const apptMs = new Date(`${ns.appointment_date}T${ns.appointment_time}`).getTime()
    if (now - apptMs < 40 * 60_000) continue // not yet 40 min past

    await admin.from('appointments').update({ status: 'no_show' }).eq('id', ns.id)

    // Offer freed slot to best-fit waitlisted customer
    const { data: waiters } = await admin
      .from('waitlist')
      .select('id, customer_id, desired_window')
      .eq('barber_id', ns.barber_id)
      .eq('status', 'waiting')
      .or(`desired_date.eq.${ns.appointment_date},desired_date.is.null`)
      .limit(3)

    for (const w of waiters || []) {
      const { data: wcust } = await admin.from('customers').select('*').eq('id', w.customer_id).single()
      if (!wcust) continue

      const firstName = (wcust.name || '').split(' ')[0] || 'there'
      const body = `Hi ${firstName}! A slot just opened at Magic Cuts today at ${ns.appointment_time}. Book now: ${SITE_URL}/book`
      const gate = await gateOutbound({ customer: wcust, channel: 'sms', kind: 'transactional' })
      if (!gate.allowed) continue

      const result = await sendSMS(wcust.phone, `${body}\n\nReply STOP to opt out.`)
      await logAction({ agent: 'reminders', customer_id: wcust.id, action: 'gap_fill_offer', payload: { waitlist_id: w.id, appointment_id: ns.id }, status: result.ok ? 'auto_sent' : 'failed' })
      if (result.ok) {
        await admin.from('waitlist').update({ status: 'offered' }).eq('id', w.id)
        filledGaps++
        break // offer to first eligible only
      }
    }
  }

  console.log(`agent-reminders: 48h=${sent48} 2h=${sent2h} gaps=${filledGaps}`)
  return Response.json({ sent48, sent2h, filledGaps })
}

// Every 30 minutes
export const config = { schedule: '*/30 * * * *' }
