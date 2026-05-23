import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Returns a small, safe slice of an appointment for the customer "manage
// booking" page. The appointment UUID acts as an unguessable access token.
// Contact details are intentionally NOT returned.
export default async (req) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id || !UUID_RE.test(id)) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('id, service_name, service_price, appointment_date, appointment_time, status, barber_id')
    .eq('id', id)
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  return Response.json(data)
}

export const config = { path: '/api/get-appointment' }
