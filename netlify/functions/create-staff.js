import { createClient } from '@supabase/supabase-js'

// Service-role client: can create auth users and write profiles. Never exposed
// to the browser — this runs only inside the function.
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const rateMap = new Map()
function checkRate(key, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now > entry.reset) { rateMap.set(key, { count: 1, reset: now + windowMs }); return true }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

async function requireOwner(req) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'owner' ? user : null
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const owner = await requireOwner(req)
  if (!owner) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkRate(owner.id)) return Response.json({ error: 'Slow down — try again in a minute.' }, { status: 429 })

  const { email, password, barber_id, role = 'barber' } = await req.json()
  if (!email || !password) return Response.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  if (!['barber', 'owner'].includes(role)) return Response.json({ error: 'Invalid role.' }, { status: 400 })
  if (role === 'barber' && !barber_id) return Response.json({ error: 'A barber must be linked to a barber profile.' }, { status: 400 })

  // Create the auth user (pre-confirmed so they can sign in immediately).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr) {
    const msg = /already.*registered|exists/i.test(createErr.message)
      ? 'That email already has an account.'
      : createErr.message
    return Response.json({ error: msg }, { status: 400 })
  }

  // Assign the staff role. Roll back the auth user if the profile write fails
  // so we never leave an orphaned login with no role.
  const { error: profileErr } = await admin.from('user_profiles').insert({
    id: created.user.id,
    role,
    barber_id: role === 'barber' ? barber_id : null,
  })
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id)
    return Response.json({ error: 'Could not assign the staff role. No account was created.' }, { status: 500 })
  }

  return Response.json({ ok: true, id: created.user.id, email, role })
}

export const config = { path: '/api/create-staff' }
