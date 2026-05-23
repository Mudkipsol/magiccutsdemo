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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ session: null, profile: null })
  },
}))
