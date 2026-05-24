// Compliance + autonomy gate. Every agent-initiated outbound message must pass
// through gateOutbound() before send. Settings live in shop_settings (migration 005).
import { admin } from './admin.js'

let cache = null
let cacheAt = 0
async function settings() {
  if (cache && Date.now() - cacheAt < 30_000) return cache
  const { data } = await admin
    .from('shop_settings')
    .select('key, value')
    .in('key', ['ai_autonomy', 'ai_quiet_hours', 'ai_frequency_caps', 'ai_kill_switch'])
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
  cache = map
  cacheAt = Date.now()
  return map
}

function withinQuietHours(quiet) {
  if (!quiet?.start || !quiet?.end) return true
  try {
    const now = new Date()
    const hhmm = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: quiet.tz || 'America/New_York',
    }).format(now)
    return hhmm >= quiet.start && hhmm <= quiet.end
  } catch {
    return true
  }
}

// kind: 'transactional' (reminders/confirmations/review) | 'marketing' (rebooking/winback/promo)
// Returns { allowed, mode: 'auto'|'approval', reason }.
export async function gateOutbound({ customer, channel, kind }) {
  const s = await settings()

  if (s.ai_kill_switch === true) return { allowed: false, reason: 'kill_switch_on' }
  if (!customer) return { allowed: false, reason: 'no_customer' }
  if (customer.do_not_contact) return { allowed: false, reason: 'do_not_contact' }

  const consentOk = channel === 'sms' ? customer.consent_sms : customer.consent_email
  if (!consentOk) return { allowed: false, reason: `no_${channel}_consent` }

  // Transactional messages may bypass quiet hours; marketing may not.
  if (kind === 'marketing' && !withinQuietHours(s.ai_quiet_hours)) {
    return { allowed: false, reason: 'quiet_hours' }
  }

  const caps = s.ai_frequency_caps || {}
  if (caps.per_customer_per_week) {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString()
    const { count } = await admin
      .from('agent_actions')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .in('status', ['auto_sent', 'sent'])
      .gte('created_at', since)
    if ((count || 0) >= caps.per_customer_per_week) return { allowed: false, reason: 'per_customer_cap' }
  }
  if (caps.global_per_day) {
    const since = new Date(new Date().toISOString().slice(0, 10)).toISOString()
    const { count } = await admin
      .from('agent_actions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['auto_sent', 'sent'])
      .gte('created_at', since)
    if ((count || 0) >= caps.global_per_day) return { allowed: false, reason: 'global_cap' }
  }

  const autonomy = s.ai_autonomy || { transactional: 'auto', marketing: 'approval' }
  const mode = autonomy[kind] === 'auto' ? 'auto' : 'approval'
  return { allowed: true, mode }
}

// Record an agent action for the audit log + frequency accounting.
export async function logAction({ agent, customer_id, action, payload = {}, status, reason }) {
  await admin.from('agent_actions').insert({ agent, customer_id, action, payload, status, reason })
  if (status === 'auto_sent' || status === 'sent') {
    await admin.from('customers').update({ last_contacted_at: new Date().toISOString() }).eq('id', customer_id)
  }
}
