import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { LogOut, Calendar, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkle } from '../components/Icons'
import { Link } from 'react-router-dom'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function defaultSchedule() {
  return DAYS.map((day, i) => ({
    day,
    working: i < 6,                       // off Sundays by default
    open: '10:00',
    close: i === 4 || i === 5 ? '20:00' : '19:00',
  }))
}

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
    if (err) toast.error(err.message || 'Wrong email or password')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950 px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <img src="/logo-full.png" alt="Magic Cuts Barbershop" className="mx-auto w-44 select-none" />
        <h1 className="mt-10 text-center font-display text-4xl font-bold uppercase text-bone">Barber Portal</h1>
        <p className="mt-2 text-center font-mono text-xs text-bone/45">staff access</p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block">
            <span className="mb-2 block font-mono text-xs text-bone/50">email</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="barber@magicutsalon.com" required />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs text-bone/50">password</span>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required />
          </label>
          <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link to="/" className="mt-8 block text-center font-mono text-xs text-bone/40 transition-colors hover:text-bone">← Back to website</Link>
      </motion.div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function BarberDashboard({ profile, signOut }) {
  const [tab, setTab] = useState('schedule') // schedule | hours

  return (
    <div className="min-h-screen bg-onyx-950">
      <header className="border-b border-white/10 bg-onyx-900/80 backdrop-blur">
        <div className="shell flex h-[64px] items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-gold-300" />
            <span className="font-display text-lg text-bone">Barber Portal</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-bone/50 hover:text-bone">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <div className="shell flex gap-1 border-b border-white/10">
        {[
          { id: 'schedule', label: 'My Schedule' },
          { id: 'hours', label: 'My Hours' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-gold-300 text-gold-300' : 'border-transparent text-bone/45 hover:text-bone'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="shell py-10">
        {tab === 'schedule' ? <ScheduleTab profile={profile} /> : <HoursTab profile={profile} />}
      </main>
    </div>
  )
}

// ─── Tab: upcoming appointments (contact info hidden by the DB view) ──────────
function ScheduleTab({ profile }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const load = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const weekEnd = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd')
      // barber_appointments is a view scoped to this barber that omits email/phone.
      const { data } = await supabase
        .from('barber_appointments')
        .select('id, customer_name, appointment_date, appointment_time, service_name, status')
        .gte('appointment_date', today)
        .lte('appointment_date', weekEnd)
        .order('appointment_date')
        .order('appointment_time')
      setAppointments(data || [])
      setLoading(false)
    }
    load()
  }, [profile.barber_id])

  const todayAppts = appointments.filter((a) => isToday(parseISO(a.appointment_date)))
  const tomorrowAppts = appointments.filter((a) => isTomorrow(parseISO(a.appointment_date)))
  const laterAppts = appointments.filter(
    (a) => !isToday(parseISO(a.appointment_date)) && !isTomorrow(parseISO(a.appointment_date))
  )

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Today's clients", value: todayAppts.length },
          { label: 'Tomorrow', value: tomorrowAppts.length },
          { label: 'This week', value: appointments.length },
          { label: 'Status', value: 'Open' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-bone/40">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-gold-300">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-center text-bone/40">Loading schedule…</p>
      ) : (
        <div className="mt-10 space-y-8">
          {[
            { label: 'Today', items: todayAppts },
            { label: 'Tomorrow', items: tomorrowAppts },
            { label: 'Later this week', items: laterAppts },
          ].map(({ label, items }) => items.length > 0 && (
            <div key={label}>
              <p className="eyebrow text-[0.6rem]">{label}</p>
              <div className="mt-3 space-y-2">
                {items.map((a) => <AppointmentCard key={a.id} appt={a} />)}
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
    </>
  )
}

// ─── Tab: weekly hours editor (writes to the barber's own profile row) ────────
function HoursTab({ profile }) {
  const [schedule, setSchedule] = useState(defaultSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('barbers')
      .select('schedule')
      .eq('id', profile.barber_id)
      .single()
      .then(({ data }) => {
        if (data?.schedule && Array.isArray(data.schedule) && data.schedule.length === 7) {
          setSchedule(data.schedule)
        }
        setLoading(false)
      })
  }, [profile.barber_id])

  const update = (i, patch) =>
    setSchedule((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))

  const save = async () => {
    if (!supabase) { toast.error('Connect Supabase to save hours'); return }
    setSaving(true)
    const { error } = await supabase
      .from('barbers')
      .update({ schedule })
      .eq('id', profile.barber_id)
    setSaving(false)
    if (error) { toast.error('Could not save hours'); return }
    toast.success('Hours updated')
  }

  if (loading) return <p className="text-center text-bone/40">Loading hours…</p>

  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow text-[0.6rem]">Set your working hours</p>
      <p className="mt-2 text-sm text-bone/50">
        Clients can only book you within these hours. Turn a day off to block it entirely.
      </p>

      <div className="mt-6 space-y-2">
        {schedule.map((d, i) => (
          <div key={d.day} className="card flex flex-wrap items-center gap-3 p-4">
            <button
              onClick={() => update(i, { working: !d.working })}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                d.working ? 'bg-gold-300' : 'bg-white/10'
              }`}
              aria-label={`Toggle ${d.day}`}
            >
              <span className={`h-5 w-5 rounded-full bg-onyx-950 transition-transform ${d.working ? 'translate-x-5' : ''}`} />
            </button>
            <span className="w-24 text-sm font-medium text-bone">{d.day}</span>
            {d.working ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={d.open}
                  onChange={(e) => update(i, { open: e.target.value })}
                  className="input w-32 px-2 py-1.5 text-sm"
                />
                <span className="text-bone/40">–</span>
                <input
                  type="time"
                  value={d.close}
                  onChange={(e) => update(i, { close: e.target.value })}
                  className="input w-32 px-2 py-1.5 text-sm"
                />
              </div>
            ) : (
              <span className="text-sm text-bone/30">Day off</span>
            )}
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-gold mt-6 w-full">
        {saving ? 'Saving…' : 'Save hours'}
      </button>
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
