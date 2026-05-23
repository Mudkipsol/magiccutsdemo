import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { LogOut, Calendar, Clock, User, Scissors } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkle } from '../components/Icons'
import { Link } from 'react-router-dom'

export default function BarberPortalPage() {
  const { session, profile, signIn, signOut, loading } = useAuthStore()

  if (loading) return <Loader />
  if (!session || profile?.role !== 'barber') return <BarberLogin signIn={signIn} />
  return <BarberDashboard profile={profile} signOut={signOut} />
}

// ─── Login ────────────────────────────────────────────────────────────────────
function BarberLogin({ signIn }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const err = await signIn(email, pw)
    if (err) toast.error('Wrong email or password')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Sparkle className="h-8 w-8 text-gold-300" />
          <p className="font-display text-2xl text-bone">Barber Portal</p>
          <p className="text-sm text-bone/50">Magic Cuts Salon</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-7">
          <label className="block">
            <span className="text-[0.65rem] font-semibold uppercase tracking-ultra text-bone/50">Email</span>
            <input className="input mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="barber@magicutsalon.com" required />
          </label>
          <label className="block">
            <span className="text-[0.65rem] font-semibold uppercase tracking-ultra text-bone/50">Password</span>
            <input className="input mt-1.5" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required />
          </label>
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-bone/40 hover:text-bone">← Back to website</Link>
      </motion.div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function BarberDashboard({ profile, signOut }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('today') // today | week

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const load = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const weekEnd = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd')
      const { data } = await supabase
        .from('appointments')
        // Barbers only see name, time, date, service — no contact info (RLS enforces this server-side too)
        .select('id, customer_name, appointment_date, appointment_time, service_name, status')
        .eq('barber_id', profile.barber_id)
        .gte('appointment_date', today)
        .lte('appointment_date', weekEnd)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date')
        .order('appointment_time')
      setAppointments(data || [])
      setLoading(false)
    }
    load()

    // Real-time updates
    const sub = supabase
      .channel('barber-appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe()
    return () => sub.unsubscribe()
  }, [profile.barber_id])

  const todayAppts = appointments.filter((a) => isToday(parseISO(a.appointment_date)))
  const tomorrowAppts = appointments.filter((a) => isTomorrow(parseISO(a.appointment_date)))
  const laterAppts = appointments.filter(
    (a) => !isToday(parseISO(a.appointment_date)) && !isTomorrow(parseISO(a.appointment_date))
  )

  return (
    <div className="min-h-screen bg-onyx-950">
      <header className="border-b border-white/10 bg-onyx-900/80 backdrop-blur">
        <div className="shell flex h-[64px] items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-gold-300" />
            <span className="font-display text-lg text-bone">My Schedule</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-bone/50 hover:text-bone">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <main className="shell py-10">
        {/* Today summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Today's clients", value: todayAppts.length },
            { label: "Tomorrow", value: tomorrowAppts.length },
            { label: "This week", value: appointments.length },
            { label: 'Status', value: 'Open' },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-xs text-bone/40">{s.label}</p>
              <p className="mt-1 font-display text-2xl text-gold-300">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Appointment list */}
        {loading ? (
          <p className="mt-12 text-center text-bone/40">Loading schedule…</p>
        ) : (
          <div className="mt-10 space-y-8">
            {[
              { label: "Today", items: todayAppts },
              { label: "Tomorrow", items: tomorrowAppts },
              { label: "Later this week", items: laterAppts },
            ].map(({ label, items }) => items.length > 0 && (
              <div key={label}>
                <p className="eyebrow text-[0.6rem]">{label}</p>
                <div className="mt-3 space-y-2">
                  {items.map((a) => (
                    <AppointmentCard key={a.id} appt={a} />
                  ))}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <Calendar className="mx-auto h-8 w-8 text-bone/20" />
                <p className="mt-3 text-bone/40">No upcoming appointments</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function AppointmentCard({ appt }) {
  function to12h(t) {
    if (!t) return ''
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-gold-300">
        <User size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-bone">{appt.customer_name}</p>
        <p className="text-sm text-bone/55">{appt.service_name}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-bone">{to12h(appt.appointment_time)}</p>
        <span className={`text-[0.6rem] uppercase tracking-widest ${appt.status === 'confirmed' ? 'text-green-400' : 'text-gold-300/70'}`}>
          {appt.status}
        </span>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950">
      <Sparkle className="h-8 w-8 animate-pulse text-gold-300" />
    </div>
  )
}
