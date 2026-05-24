// Twilio inbound SMS webhook — the AI Receptionist.
// Twilio posts application/x-www-form-urlencoded to /api/sms/inbound.
// Responds with TwiML <Response><Message>...</Message></Response>.
import { admin, normalizePhone } from './_lib/admin.js'
import { aiEnabled, runTools } from './_lib/ai.js'
import { logAction } from './_lib/guardrails.js'
import { TOOLS, makeExecutors } from './_lib/tools.js'

const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

// Validate Twilio signature to reject spoofed webhooks
async function validateTwilio(req, body) {
  const sig = req.headers.get('x-twilio-signature')
  if (!sig || !process.env.TWILIO_AUTH_TOKEN) return true // skip in dev
  try {
    const twilio = (await import('twilio')).default
    const url = `${SITE_URL}/api/sms/inbound`
    const params = Object.fromEntries(new URLSearchParams(body))
    return twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, sig, url, params)
  } catch {
    return false
  }
}

function twiml(msg) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } },
  )
}

// Fetch or create the customer record + conversation thread
async function resolveCustomer(phone) {
  const normalized = normalizePhone(phone)
  let { data: customer } = await admin.from('customers').select('*').eq('phone', normalized).maybeSingle()

  if (!customer) {
    // Create a minimal customer record; consent defaults false until they explicitly opt in
    const { data } = await admin.from('customers').insert({
      phone: normalized, consent_sms: false, lifecycle_status: 'new',
    }).select('*').single()
    customer = data
  }
  return customer
}

async function resolveConversation(customer_id) {
  const { data: existing } = await admin
    .from('conversations')
    .select('id, status')
    .eq('customer_id', customer_id)
    .eq('channel', 'sms')
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const { data } = await admin.from('conversations').insert({
    customer_id, channel: 'sms', status: 'open',
  }).select('id').single()
  return data.id
}

async function loadHistory(conversation_id, limit = 10) {
  const { data } = await admin
    .from('messages')
    .select('direction, body, sender')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []).reverse()
}

async function saveMessage(conversation_id, direction, body, sender) {
  await admin.from('messages').insert({ conversation_id, direction, body, sender })
}

// STOP / HELP keyword handler (A2P compliance)
async function handleKeyword(keyword, customer) {
  const kw = keyword.trim().toUpperCase()
  if (['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(kw)) {
    await admin.from('customers').update({ consent_sms: false, do_not_contact: true }).eq('id', customer.id)
    await logAction({ agent: 'receptionist', customer_id: customer.id, action: 'opt_out', payload: { keyword: kw }, status: 'auto_sent' })
    return twiml('You have been unsubscribed from Magic Cuts messages. Reply START to re-subscribe.')
  }
  if (['HELP', 'INFO'].includes(kw)) {
    return twiml(`Magic Cuts Salon — 2779 Martin Rd, Dublin OH 43017. Book at ${SITE_URL}. Reply STOP to opt out.`)
  }
  if (['START', 'YES', 'UNSTOP'].includes(kw)) {
    await admin.from('customers').update({ consent_sms: true, do_not_contact: false }).eq('id', customer.id)
    return twiml('Welcome back! You\'re subscribed to Magic Cuts messages. Book at ' + SITE_URL)
  }
  return null // not a keyword
}

async function buildSystemPrompt() {
  const { data: settings } = await admin.from('shop_settings').select('key, value').in('key', ['shop_name', 'shop_address', 'shop_phone', 'ai_brand_voice', 'services'])
  const s = Object.fromEntries((settings || []).map((r) => [r.key, r.value]))

  const services = Array.isArray(s.services) ? s.services.map((sv) => `${sv.name} $${sv.price}`).join(', ') : 'haircut, fade, lineup'

  return `You are the AI receptionist for ${s.shop_name || 'Magic Cuts'}, a barbershop at ${s.shop_address || '2779 Martin Rd, Dublin OH 43017'}.
Your job: answer questions, check availability, and book/reschedule/cancel appointments via the tools provided.
Voice: ${s.ai_brand_voice || 'warm, professional, concise. Never more than 2–3 sentences per SMS reply.'}
Services: ${services}.
Booking site: ${SITE_URL}
Hours: Mon–Fri 10am–7pm, Sat 10am–8pm, Sun closed.
Rules:
- Keep replies under 160 characters when possible.
- Never make up availability — always use get_availability tool.
- If a customer asks to be removed from messages, confirm and set opt-out.
- If you cannot help, escalate_to_human.
- Do NOT share customer phone numbers or emails with anyone.`
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const body = await req.text()
  const valid = await validateTwilio(req, body)
  if (!valid) return new Response('Forbidden', { status: 403 })

  const params = Object.fromEntries(new URLSearchParams(body))
  const from = params.From || ''
  const inboundBody = (params.Body || '').trim()

  const customer = await resolveCustomer(from)
  if (!customer) return twiml('Sorry, something went wrong. Please call us directly.')

  // Handle STOP/HELP/START keywords first (A2P compliance)
  const kwResponse = await handleKeyword(inboundBody, customer)
  if (kwResponse) return kwResponse

  const conversation_id = await resolveConversation(customer.id)
  await saveMessage(conversation_id, 'in', inboundBody, 'customer')

  // If AI is disabled, give a helpful fallback
  if (!aiEnabled()) {
    const reply = `Thanks for reaching out! Book online at ${SITE_URL} or call us. Reply STOP to opt out.`
    await saveMessage(conversation_id, 'out', reply, 'agent')
    return twiml(reply)
  }

  // Build conversation history for context
  const history = await loadHistory(conversation_id)
  const messages = [
    { role: 'system', content: await buildSystemPrompt() },
    ...history.map((m) => ({ role: m.direction === 'in' ? 'user' : 'assistant', content: m.body })),
    { role: 'user', content: inboundBody },
  ]

  // Subset of tools safe for the receptionist (no segment/approval — those are for cron agents)
  const receptionistTools = TOOLS.filter((t) => !['segment_customers', 'request_approval'].includes(t.function.name))
  const executors = makeExecutors({ agentName: 'receptionist', conversationId: conversation_id })

  let replyText
  try {
    const { text } = await runTools({ messages, tools: receptionistTools, executors, task: 'fast', maxSteps: 6 })
    replyText = (text || '').slice(0, 1500) // hard cap for SMS
    if (!replyText) replyText = `Thanks! Book online at ${SITE_URL} or we'll be in touch.`
  } catch (e) {
    console.error('sms-inbound AI error:', e.message)
    replyText = `Thanks for reaching out! Book at ${SITE_URL} or call us. Reply STOP to opt out.`
  }

  await saveMessage(conversation_id, 'out', replyText, 'agent')
  await logAction({ agent: 'receptionist', customer_id: customer.id, action: 'sms_reply', payload: { conversation_id }, status: 'auto_sent' })

  return twiml(replyText)
}

export const config = { path: '/api/sms/inbound' }
