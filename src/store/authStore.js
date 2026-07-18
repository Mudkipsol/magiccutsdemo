import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  session: null,
  profile: null,   // { role: 'owner'|'barber', barber_id }
  loading: true,

  init: async () => {
    if (!supabase) { set({ loading: false }); return }
    const { data: { session } } = await supabase.auth.getSession()
    let profile = null
    if (session) {
      const { data } = await supabase
        .from('user_profiles')
        .select('role, barber_id')
        .eq('id', session.user.id)
        .single()
      profile = data
    }
    set({ session, profile, loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      let profile = null
      if (session) {
        const { data } = await supabase
          .from('user_profiles')
          .select('role, barber_id')
          .eq('id', session.user.id)
          .single()
        profile = data
      }
      set({ session, profile })
    })
  },

  signIn: async (email, password) => {
    if (!supabase) return { message: 'Demo mode: add Supabase keys to .env.local to enable sign-in.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  },

  // Customer self-registration. Staff (owner/barber) are created by the owner,
  // never through this path. Returns { error, needsConfirm }.
  signUp: async (email, password, name) => {
    if (!supabase) return { error: { message: 'Demo mode: add Supabase keys to .env.local to enable accounts.' }, needsConfirm: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    // When email confirmation is enabled, Supabase returns a user but no session.
    return { error, needsConfirm: !error && !data.session }
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ session: null, profile: null })
  },
}))
