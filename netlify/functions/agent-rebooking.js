// Daily rebooking engine — predicts which active clients are due for their
// next cut and queues a personalized nudge for owner one-tap approval.
// Autonomy mode for 'marketing' defaults to 'approval' (hybrid gate).
import { admin } from './_lib/admin.js'
import { aiEnabled, chat } from './_lib/ai.js'
import { gateOutbound, logAction } from './_lib/guardrails.js'

const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

async function getBrandVoice() {
  const { data } = await admin.from('shop_settings').select('value').eq('key', 'ai_brand_voice').single()
  return data?.value || 'warm, friendly, and concise. One sentence max.'
}

async function draftNudge(customer, brandVoice) {
  const firstName = (customer.name || '').split(' ')[0] || 'there'
  const daysPast = customer.avg_cadence_days
    ? Math.round((Date.now() - new Date(customer.predicted_next_visit).getTime()) / 86_400_000)
    : null

  if (!aiEnabled()) {
    // Fallback template when AI keys aren't configured
    return `Hey ${firstName}! It's been a while — time to get that fresh cut? Book at ${SITE_URL}/book`
  }

  const prompt = `Write a one-sentence rebooking SMS for a barbershop client named ${firstName}.
Their last haircut was ${customer.last_visit || 'a while ago'}.${daysPast !== null ? ` They're ${daysPast} days past their usual cadence.` : ''}
Brand voice: ${brandVoice}.
Include a call-to-action to book at ${SITE_URL}/book.
SMS only — keep it under 140 characters. No emojis unless the voice calls for it. Output ONLY the message text.`

  try {
    const msg = await chat({ messages: [{ role: 'user', content: prompt }], task: 'fast', temperature: 0.7 })
    return (msg.content || '').trim().replace(/^["']|["']$/g, '')
  } catch (e) {
    console.error('rebooking draft failed:', e.message)
    return `Hey ${firstName}, time for a fresh cut? Book now: ${SITE_URL}/book`
  }
}

export default async () => {
  const started = Date.now()
  const brandVoice = await getBrandVoice()

  // Customers who are active or lapsing and past their predicted next visit
  const today = new Date().toISOString().slice(0, 10)
  const { data: candidates } = await admin
    .from('customers')
    .select('id, name, phone, email, lifecycle_status, last_visit, avg_cadence_days, predicted_next_visit, consent_sms, consent_email, do_not_contact, last_contacted_at')
    .in('lifecycle_status', ['active', 'lapsing'])
    .lte('predicted_next_visit', today)
    .eq('do_not_contact', false)
    .not('predicted_next_visit', 'is', null)
    .limit(100)

  let queued = 0, skipped = 0

  for (const customer of candidates || []) {
    // Gate check — will return mode='approval' for marketing by default
    const gate = await gateOutbound({ customer, channel: 'sms', kind: 'marketing' })
    if (!gate.allowed) {
      await logAction({ agent: 'rebooking', customer_id: customer.id, action: 'rebook_nudge', payload: {}, status: 'skipped', reason: gate.reason })
      skipped++
      continue
    }

    const body = await draftNudge(customer, brandVoice)
    const fullBody = `${body}\n\nReply STOP to opt out.`

    if (gate.mode === 'auto') {
      // Auto-send path (owner has enabled marketing auto-send — uncommon but supported)
      const { sendSMS } = await import('./_lib/messaging.js')
      const result = await sendSMS(customer.phone, fullBody)
      await logAction({ agent: 'rebooking', customer_id: customer.id, action: 'rebook_nudge', payload: { body: fullBody }, status: result.ok ? 'auto_sent' : 'failed', reason: result.error })
      if (result.ok) queued++
    } else {
      // Default path: queue for owner approval
      await logAction({ agent: 'rebooking', customer_id: customer.id, action: 'rebook_nudge', payload: { channel: 'sms', body: fullBody }, status: 'queued' })
      queued++
    }
  }

  const elapsed = Date.now() - started
  console.log(`agent-rebooking: queued=${queued} skipped=${skipped} in ${elapsed}ms`)
  return Response.json({ queued, skipped, elapsed })
}

// Daily at 9 AM ET
export const config = { schedule: '0 14 * * *' }
