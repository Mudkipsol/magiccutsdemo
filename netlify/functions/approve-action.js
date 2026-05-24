// Owner approves or skips a queued agent action.
// POST /api/approve-action  { action_id, decision: 'approve' | 'skip' }
import { admin, requireOwner } from './_lib/admin.js'
import { sendSMS, sendEmail } from './_lib/messaging.js'
import { logAction } from './_lib/guardrails.js'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const owner = await requireOwner(req)
  if (!owner) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let payload
  try { payload = await req.json() } catch { return Response.json({ error: 'invalid JSON' }, { status: 400 }) }

  const { action_id, decision } = payload
  if (!action_id || !['approve', 'skip'].includes(decision)) {
    return Response.json({ error: 'action_id and decision (approve|skip) required' }, { status: 400 })
  }

  const { data: action } = await admin.from('agent_actions').select('*').eq('id', action_id).eq('status', 'queued').single()
  if (!action) return Response.json({ error: 'action not found or not queued' }, { status: 404 })

  if (decision === 'skip') {
    await admin.from('agent_actions').update({ status: 'skipped' }).eq('id', action_id)
    return Response.json({ ok: true, status: 'skipped' })
  }

  // Approve: send the message
  const { channel, body, subject } = action.payload || {}
  const { data: customer } = await admin.from('customers').select('phone, email').eq('id', action.customer_id).single()

  if (!customer) {
    await admin.from('agent_actions').update({ status: 'failed', reason: 'customer_not_found' }).eq('id', action_id)
    return Response.json({ error: 'customer not found' }, { status: 404 })
  }

  let result
  if (channel === 'sms') {
    result = await sendSMS(customer.phone, body)
  } else if (channel === 'email') {
    result = await sendEmail({ to: customer.email, subject: subject || 'Message from Magic Cuts', html: body })
  } else {
    return Response.json({ error: 'unknown channel in payload' }, { status: 400 })
  }

  await admin.from('agent_actions').update({ status: result.ok ? 'sent' : 'failed', reason: result.error || null }).eq('id', action_id)
  if (result.ok && action.customer_id) {
    await admin.from('customers').update({ last_contacted_at: new Date().toISOString() }).eq('id', action.customer_id)
  }

  return Response.json({ ok: result.ok, error: result.error })
}

export const config = { path: '/api/approve-action' }
