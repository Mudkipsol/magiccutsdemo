import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { email, phone, optEmail, optSms } = await req.json()

  const { error } = await supabase.from('marketing_contacts').upsert(
    { email: email || null, phone: phone || null, opted_in_email: !!(optEmail && email), opted_in_sms: !!(optSms && phone), source: 'popup' },
    { onConflict: 'email' }
  )

  return Response.json({ ok: !error })
}

export const config = { path: '/api/subscribe-marketing' }
