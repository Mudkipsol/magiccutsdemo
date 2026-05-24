// Shared server-side helpers for Netlify functions and agents.
// Files under _lib/ are NOT deployed as standalone functions.
import { createClient } from '@supabase/supabase-js'

// Service-role client: full DB access, bypasses RLS. Never expose to the browser.
export const admin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Verify the caller is an authenticated owner (Bearer token → user_profiles.role).
// Returns the user object or null. Mirrors the guard in send-marketing.js.
export async function requireOwner(req) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'owner' ? user : null
}

// In-memory rate limiter (per serverless instance — abuse deterrence, not a guarantee).
const rateMap = new Map()
export function checkRate(key, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now > entry.reset) { rateMap.set(key, { count: 1, reset: now + windowMs }); return true }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// Normalize a US phone to +1XXXXXXXXXX (matches normalize_phone() in migration 005).
export function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits || null
}
