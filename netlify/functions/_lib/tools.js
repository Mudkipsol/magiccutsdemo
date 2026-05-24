// Agent tool definitions (OpenAI function-calling format) + executor map.
// Import { TOOLS, makeExecutors } and pass to runTools().
import { admin, normalizePhone } from './admin.js'
import { gateOutbound, logAction } from './guardrails.js'
import { sendSMS, sendEmail } from './messaging.js'

// ─── Schema definitions (passed to the model) ─────────────────────────────────

export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'find_customer',
      description: 'Look up a customer by phone or email. Returns the customer record or null.',
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Phone number (any format)' },
          email: { type: 'string', description: 'Email address' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_availability',
      description: 'Get available booking slots for a barber on a given date.',
      parameters: {
        type: 'object',
        required: ['date'],
        properties: {
          barber_id: { type: 'string', description: 'UUID of the barber, or omit for any' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_barbers',
      description: 'List all active barbers.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_services',
      description: 'List all services offered and their prices.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Book an appointment. Returns the new appointment id.',
      parameters: {
        type: 'object',
        required: ['customer_id', 'barber_id', 'service_name', 'appointment_date', 'appointment_time'],
        properties: {
          customer_id: { type: 'string' },
          barber_id: { type: 'string' },
          service_name: { type: 'string' },
          appointment_date: { type: 'string', description: 'YYYY-MM-DD' },
          appointment_time: { type: 'string', description: 'HH:MM (24h)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule',
      description: 'Move an existing appointment to a new date/time.',
      parameters: {
        type: 'object',
        required: ['appointment_id', 'new_date', 'new_time'],
        properties: {
          appointment_id: { type: 'string' },
          new_date: { type: 'string', description: 'YYYY-MM-DD' },
          new_time: { type: 'string', description: 'HH:MM (24h)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_appointment',
      description: 'Cancel an appointment.',
      parameters: {
        type: 'object',
        required: ['appointment_id'],
        properties: {
          appointment_id: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_waitlist',
      description: 'Add a customer to the waitlist for a specific barber or time window.',
      parameters: {
        type: 'object',
        required: ['customer_id'],
        properties: {
          customer_id: { type: 'string' },
          barber_id: { type: 'string' },
          desired_date: { type: 'string', description: 'YYYY-MM-DD' },
          desired_window: { type: 'string', description: 'morning | afternoon | evening | any' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_message',
      description: 'Send an SMS or email to a customer. Always passes through compliance guardrails.',
      parameters: {
        type: 'object',
        required: ['customer_id', 'channel', 'kind', 'body'],
        properties: {
          customer_id: { type: 'string' },
          channel: { type: 'string', enum: ['sms', 'email'] },
          kind: { type: 'string', enum: ['transactional', 'marketing'], description: 'transactional = auto-send; marketing = queued for owner approval' },
          body: { type: 'string', description: 'Message text (SMS) or HTML (email)' },
          subject: { type: 'string', description: 'Email subject (required for channel=email)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'segment_customers',
      description: 'Return customers matching a lifecycle segment for targeting.',
      parameters: {
        type: 'object',
        properties: {
          lifecycle_status: { type: 'string', enum: ['new', 'active', 'lapsing', 'lapsed', 'winback'] },
          days_since_visit: { type: 'number', description: 'Filter to customers who last visited more than N days ago' },
          limit: { type: 'number', default: 50 },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_approval',
      description: 'Queue a draft message for owner one-tap approval (use for marketing messages).',
      parameters: {
        type: 'object',
        required: ['agent', 'customer_id', 'action', 'channel', 'body'],
        properties: {
          agent: { type: 'string' },
          customer_id: { type: 'string' },
          action: { type: 'string' },
          channel: { type: 'string', enum: ['sms', 'email'] },
          body: { type: 'string' },
          subject: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'Flag this conversation as needing a human to respond. Use when the request is outside your capabilities or the customer is frustrated.',
      parameters: {
        type: 'object',
        required: ['conversation_id', 'reason'],
        properties: {
          conversation_id: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
  },
]

// ALL_SLOTS mirrored here for server-side use (avoids importing from src/)
const ALL_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

function mondayIdx(dateStr) {
  const d = new Date(dateStr + 'T12:00:00') // noon to avoid DST edge
  return (d.getDay() + 6) % 7
}

// ─── Executors ─────────────────────────────────────────────────────────────────

export function makeExecutors({ agentName, conversationId } = {}) {
  return {
    find_customer: async ({ phone, email }) => {
      let q = admin.from('customers').select('id, name, phone, email, lifecycle_status, preferred_barber_id, consent_sms, consent_email, do_not_contact, last_visit, avg_cadence_days, predicted_next_visit')
      if (phone) q = q.eq('phone', normalizePhone(phone))
      else if (email) q = q.ilike('email', email)
      else return { error: 'provide phone or email' }
      const { data, error } = await q.maybeSingle()
      if (error) return { error: error.message }
      return data || { found: false }
    },

    get_availability: async ({ barber_id, date }) => {
      if (!date) return { error: 'date required' }
      const idx = mondayIdx(date)

      // Fetch barber schedule
      let schedule = null
      if (barber_id) {
        const { data } = await admin.from('barbers').select('schedule').eq('id', barber_id).single()
        const s = data?.schedule
        schedule = Array.isArray(s) && s.length === 7 ? s : null
      }

      // Determine slots for the day
      const entry = schedule ? schedule[idx] : null
      let slots
      if (entry && !entry.working) return { available: [], reason: 'barber not working' }
      if (entry) {
        slots = ALL_SLOTS.filter((t) => t >= entry.open && t < entry.close)
      } else {
        // Default: closed Sunday (JS getDay 0 = monday-first index 6)
        if (idx === 6) return { available: [], reason: 'shop closed Sundays' }
        slots = ALL_SLOTS
      }

      // Subtract booked slots
      let bq = admin.from('appointments').select('appointment_time').eq('appointment_date', date).in('status', ['pending', 'confirmed'])
      if (barber_id) bq = bq.eq('barber_id', barber_id)
      const { data: booked } = await bq
      const bookedSet = new Set((booked || []).map((r) => r.appointment_time.slice(0, 5)))
      const available = slots.filter((s) => !bookedSet.has(s))
      return { date, barber_id, available }
    },

    get_barbers: async () => {
      const { data } = await admin.from('barbers').select('id, name, specialties, photo_url').eq('active', true)
      return { barbers: data || [] }
    },

    get_services: async () => {
      const { data } = await admin.from('shop_settings').select('value').eq('key', 'services').single()
      return { services: data?.value || [] }
    },

    create_booking: async ({ customer_id, barber_id, service_name, appointment_date, appointment_time }) => {
      // Fetch customer name for the record
      const { data: cust } = await admin.from('customers').select('name, phone, email').eq('id', customer_id).single()
      if (!cust) return { error: 'customer not found' }
      const { data, error } = await admin.from('appointments').insert({
        customer_id,
        barber_id,
        service_name,
        appointment_date,
        appointment_time,
        customer_name: cust.name,
        customer_phone: cust.phone,
        customer_email: cust.email,
        status: 'confirmed',
        deposit_paid: false,
        deposit_amount: 0,
        review_sms_sent: false,
      }).select('id').single()
      if (error) return { error: error.message }
      return { appointment_id: data.id, status: 'confirmed' }
    },

    reschedule: async ({ appointment_id, new_date, new_time }) => {
      const { error } = await admin.from('appointments').update({ appointment_date: new_date, appointment_time: new_time }).eq('id', appointment_id)
      if (error) return { error: error.message }
      return { rescheduled: true, appointment_id, new_date, new_time }
    },

    cancel_appointment: async ({ appointment_id, reason }) => {
      const { error } = await admin.from('appointments').update({ status: 'cancelled' }).eq('id', appointment_id)
      if (error) return { error: error.message }
      await logAction({ agent: agentName || 'receptionist', customer_id: null, action: 'cancel', payload: { appointment_id, reason }, status: 'auto_sent' })
      return { cancelled: true, appointment_id }
    },

    add_to_waitlist: async ({ customer_id, barber_id, desired_date, desired_window }) => {
      const { data, error } = await admin.from('waitlist').insert({
        customer_id, barber_id, desired_date, desired_window: desired_window || 'any', status: 'waiting',
      }).select('id').single()
      if (error) return { error: error.message }
      return { waitlist_id: data.id }
    },

    send_message: async ({ customer_id, channel, kind, body, subject }) => {
      const { data: customer } = await admin.from('customers').select('*').eq('id', customer_id).single()
      if (!customer) return { error: 'customer not found' }

      const gate = await gateOutbound({ customer, channel, kind })
      if (!gate.allowed) {
        await logAction({ agent: agentName || 'agent', customer_id, action: 'send_message', payload: { channel, kind, body }, status: 'skipped', reason: gate.reason })
        return { sent: false, reason: gate.reason }
      }

      if (gate.mode === 'approval') {
        await logAction({ agent: agentName || 'agent', customer_id, action: 'send_message', payload: { channel, kind, body, subject }, status: 'queued' })
        return { sent: false, queued: true, reason: 'pending_approval' }
      }

      let result
      if (channel === 'sms') {
        const smsBody = `${body}\n\nReply STOP to opt out.`
        result = await sendSMS(customer.phone, smsBody)
      } else {
        result = await sendEmail({ to: customer.email, subject: subject || 'Message from Magic Cuts', html: body })
      }

      await logAction({ agent: agentName || 'agent', customer_id, action: 'send_message', payload: { channel, kind }, status: result.ok ? 'auto_sent' : 'failed', reason: result.error })
      return result
    },

    segment_customers: async ({ lifecycle_status, days_since_visit, limit = 50 }) => {
      let q = admin.from('customers').select('id, name, lifecycle_status, last_visit, avg_cadence_days, preferred_barber_id').limit(limit)
      if (lifecycle_status) q = q.eq('lifecycle_status', lifecycle_status)
      if (days_since_visit) {
        const cutoff = new Date(Date.now() - days_since_visit * 86_400_000).toISOString().slice(0, 10)
        q = q.lte('last_visit', cutoff)
      }
      const { data, error } = await q
      if (error) return { error: error.message }
      return { customers: data || [], count: (data || []).length }
    },

    request_approval: async ({ agent, customer_id, action, channel, body, subject }) => {
      await logAction({ agent, customer_id, action, payload: { channel, body, subject }, status: 'queued' })
      return { queued: true }
    },

    escalate_to_human: async ({ conversation_id, reason }) => {
      if (conversation_id) {
        await admin.from('conversations').update({ status: 'needs_human' }).eq('id', conversation_id)
      }
      await logAction({ agent: agentName || 'agent', customer_id: null, action: 'escalate', payload: { conversation_id, reason }, status: 'queued', reason })
      return { escalated: true }
    },
  }
}
