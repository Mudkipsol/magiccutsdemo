import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Supabase env vars missing — running in demo mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
}

export const supabase = (url && key)
  ? createClient(url, key)
  : null

// Helper to check if Supabase is configured
export const hasSupabase = !!(url && key)
