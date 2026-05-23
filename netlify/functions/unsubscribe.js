import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { email, phone, type } = await req.json()

  if (!email && !phone) {
    return new Response(JSON.stringify({ error: 'email or phone required' }), { status: 400 })
  }

  const updates = {}
  if (type === 'sms') updates.opted_in_sms = false
  else if (type === 'all') { updates.opted_in_email = false; updates.opted_in_sms = false }
  else updates.opted_in_email = false

  let query = supabase.from('marketing_contacts').update(updates)
  if (email) query = query.eq('email', email)
  else if (phone) query = query.eq('phone', phone)

  const { error } = await query
  if (error) {
    console.error('Unsubscribe failed:', error.message)
    return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
  }

  return Response.json({ success: true })
}

export const config = { path: '/api/unsubscribe' }
