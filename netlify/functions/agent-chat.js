// Web chat endpoint — powers the floating ChatWidget on the public site.
// POST /api/chat  { messages: [{role, content}], session_id? }
import { admin } from './_lib/admin.js'
import { aiEnabled, runTools } from './_lib/ai.js'
import { logAction } from './_lib/guardrails.js'
import { TOOLS, makeExecutors } from './_lib/tools.js'

const SITE_URL = process.env.SITE_URL || 'https://www.magicutsalon.com'

async function buildSystemPrompt() {
  const { data: settings } = await admin
    .from('shop_settings')
    .select('key, value')
    .in('key', ['shop_name', 'shop_address', 'ai_brand_voice', 'services'])
  const s = Object.fromEntries((settings || []).map((r) => [r.key, r.value]))
  const services = Array.isArray(s.services)
    ? s.services.map((sv) => `${sv.name} ($${sv.price})`).join(', ')
    : 'haircuts, fades, lineups'

  return `You are the friendly web chat assistant for ${s.shop_name || 'Magic Cuts'}, a premium barbershop at ${s.shop_address || '2779 Martin Rd, Dublin OH 43017'}.

Your purpose: answer questions about the shop and help visitors book, reschedule, or cancel appointments using the tools provided.

Tone: ${s.ai_brand_voice || 'warm, confident, concise. Under 3 sentences per reply.'}
Services offered: ${services}.
Booking: ${SITE_URL}/book
Hours: Mon–Fri 10am–7pm, Sat 10am–8pm, Sunday closed.

Rules:
- Always use get_availability before confirming open slots — never guess.
- To book, you need: preferred barber (or "any"), service, date, time, and the customer's name and phone.
- Collect info naturally over multiple turns — don't demand everything at once.
- Never share another customer's information.
- If a request is outside your scope, invite them to call or say you'll have someone follow up.`
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let payload
  try { payload = await req.json() } catch { return Response.json({ error: 'invalid JSON' }, { status: 400 }) }

  const { messages = [], session_id, customer_phone } = payload
  if (!Array.isArray(messages) || !messages.length) {
    return Response.json({ error: 'messages array required' }, { status: 400 })
  }

  if (!aiEnabled()) {
    return Response.json({
      reply: `Thanks for reaching out! You can book online at ${SITE_URL}/book or give us a call. We'd love to see you.`,
      session_id,
    })
  }

  // Resolve customer if phone provided (enables tool personalization)
  let customer_id = null
  if (customer_phone) {
    const { normalizePhone } = await import('./_lib/admin.js')
    const { data } = await admin.from('customers').select('id').eq('phone', normalizePhone(customer_phone)).maybeSingle()
    customer_id = data?.id || null
  }

  // Persist conversation in DB if we have a session_id
  let conversation_id = session_id || null
  if (session_id) {
    const { data } = await admin.from('conversations').select('id').eq('id', session_id).maybeSingle()
    if (!data) {
      const { data: newConvo } = await admin.from('conversations').insert({
        customer_id, channel: 'web', status: 'open',
      }).select('id').single()
      conversation_id = newConvo?.id || null
    }
  }

  const systemPrompt = await buildSystemPrompt()
  const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages]

  // Chat tools — web chat gets full tool set except escalate (less relevant)
  const chatTools = TOOLS.filter((t) => !['segment_customers', 'request_approval'].includes(t.function.name))
  const executors = makeExecutors({ agentName: 'chat', conversationId: conversation_id })

  let reply
  try {
    const { text } = await runTools({ messages: fullMessages, tools: chatTools, executors, task: 'fast', maxSteps: 6 })
    reply = text || "I'm here to help! What can I assist you with today?"
  } catch (e) {
    console.error('agent-chat error:', e.message)
    reply = `Happy to help! You can also book directly at ${SITE_URL}/book.`
  }

  // Save the last turn to messages table
  if (conversation_id) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) await admin.from('messages').insert({ conversation_id, direction: 'in', body: lastUser.content, sender: 'customer' })
    await admin.from('messages').insert({ conversation_id, direction: 'out', body: reply, sender: 'agent' })
    if (customer_id) {
      await logAction({ agent: 'chat', customer_id, action: 'chat_reply', payload: { conversation_id }, status: 'auto_sent' })
    }
  }

  return Response.json({ reply, conversation_id })
}

export const config = { path: '/api/chat' }
