import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function to12h(t) {
  if (!t) return ''
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function AccountPage() {
  const { session, profile, loading, signOut } = useAuthStore()

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-onyx-950">
      <header className="border-b border-white/10">
        <div className="shell flex h-16 items-center justify-between">
          <Link to="/" className="font-mono text-sm text-bone/60 transition-colors hover:text-bone">
            ← Back<span className="hidden sm:inline"> to site</span>
          </Link>
          <span className="flex items-center gap-3">
            <img src="/logo-mark.png" alt="Magic Cuts" className="h-8 w-auto -translate-y-[2px]" />
            <span className="hidden font-display text-xl font-bold uppercase leading-none text-bone translate-y-[1px] sm:inline">Magic Cuts</span>
          </span>
          {session ? (
            <button onClick={signOut} className="font-mono text-sm text-bone/50 transition-colors hover:text-bone">
              Sign out
            </button>
          ) : (
            <span className="w-[88px]" />
          )}
        </div>
      </header>

      <main className="shell max-w-3xl py-14">
        {!session ? (
          <AuthForms />
        ) : profile?.role === 'owner' ? (
          <StaffRedirect to="/dashboard" label="Owner Dashboard" />
        ) : profile?.role === 'barber' ? (
          <StaffRedirect to="/barber" label="My Schedule" />
        ) : (
          <MyBookings session={session} />
        )}
      </main>
    </div>
  )
}

// ─── Login / Register ───────────────────────────────────────────────────────
function AuthForms() {
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentConfirm, setSentConfirm] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!supabase) { toast.error('Accounts are unavailable in demo mode.'); return }
    setBusy(true)
    if (mode === 'login') {
      const err = await signIn(email, pw)
      if (err) toast.error(err.message || 'Invalid email or password')
    } else {
      if (pw.length < 8) { toast.error('Password must be at least 8 characters'); setBusy(false); return }
      const { error, needsConfirm } = await signUp(email, pw, name)
      if (error) toast.error(error.message || 'Could not create account')
      else if (needsConfirm) setSentConfirm(true)
      else toast.success('Welcome to Magic Cuts!')
    }
    setBusy(false)
  }

  if (sentConfirm) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm text-center">
        <img src="/logo-mark.png" alt="" className="mx-auto h-16 w-auto select-none" />
        <h1 className="mt-8 font-display text-4xl font-bold uppercase text-bone">Check your inbox</h1>
        <p className="mt-4 text-sm leading-relaxed text-bone/60">
          We sent a confirmation link to <span className="text-bone">{email}</span>. Click it to
          finish setting up your account, then come back and sign in.
        </p>
        <button onClick={() => { setSentConfirm(false); setMode('login') }} className="btn-ghost mt-8">
          Back to sign in
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm">
      <img src="/logo-full.png" alt="Magic Cuts Barbershop" className="mx-auto w-44 select-none" />

      <h1 className="mt-10 text-center font-display text-4xl font-bold uppercase text-bone">
        {mode === 'login' ? 'Welcome back' : 'Take a seat'}
      </h1>
      <p className="mt-3 text-center text-sm text-bone/50">
        {mode === 'login'
          ? 'Sign in to view and manage your appointments.'
          : 'Track your bookings and breeze through checkout next time.'}
      </p>

      {/* Mode switch — flat ruled tabs, same language as the booking steps */}
      <div className="mt-9 flex border-b border-white/10">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`relative flex-1 pb-3 font-display text-base font-bold uppercase tracking-[0.1em] transition-colors ${
              mode === m ? 'text-bone' : 'text-bone/35 hover:text-bone/70'
            }`}
          >
            {m === 'login' ? 'Sign in' : 'Register'}
            {mode === m && <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-gold-400" />}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === 'register' && (
          <label className="block">
            <span className="mb-2 block font-mono text-xs text-bone/50">full name</span>
            <input className="input" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label className="block">
          <span className="mb-2 block font-mono text-xs text-bone/50">email</span>
          <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-xs text-bone/50">password</span>
          <input className="input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={mode === 'register' ? 8 : undefined} />
        </label>
        <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
          {busy ? 'Just a moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </motion.div>
  )
}

// ─── Staff shortcut (owner/barber landing here) ───────────────────────────────
function StaffRedirect({ to, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm text-center">
      <img src="/logo-mark.png" alt="" className="mx-auto h-16 w-auto select-none" />
      <h1 className="mt-8 font-display text-4xl font-bold uppercase text-bone">You're signed in</h1>
      <p className="mt-3 font-mono text-sm text-bone/50">Head to your workspace to keep going.</p>
      <Link to={to} className="btn-gold mt-8 inline-flex">
        Open {label}
      </Link>
    </motion.div>
  )
}

// ─── Customer bookings ────────────────────────────────────────────────────────
function MyBookings({ session }) {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const firstName = (session.user.user_metadata?.full_name || session.user.email).split(' ')[0].split('@')[0]

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('appointments')
      .select('id, service_name, service_price, appointment_date, appointment_time, status, deposit_paid')
      .order('appointment_date', { ascending: false })
    setAppts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const now = new Date()
  const upcoming = appts.filter((a) => {
    const dt = parseISO(`${a.appointment_date}T${(a.appointment_time || '00:00').slice(0, 5)}`)
    return dt >= now && a.status !== 'cancelled'
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
  const past = appts.filter((a) => !upcoming.includes(a))

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-bold uppercase text-bone">Hey, {firstName}.</h1>
        <Link to="/book" className="btn-gold text-sm">Book a Chair</Link>
      </div>

      {loading ? (
        <p className="py-16 text-center font-mono text-sm text-bone/40">Loading your appointments…</p>
      ) : appts.length === 0 ? (
        <div className="border-y border-white/10 py-16 text-center">
          <p className="font-display text-2xl font-bold uppercase text-bone/60">No appointments yet</p>
          <p className="mt-2 font-mono text-xs text-bone/40">
            Bookings made with {session.user.email} will show up here.
          </p>
          <Link to="/book" className="btn-gold mt-8 inline-flex text-sm">Book your first cut</Link>
        </div>
      ) : (
        <div className="space-y-12">
          <Section title="Upcoming" items={upcoming} empty="No upcoming appointments." />
          <Section title="Past visits" items={past} empty="No past visits yet." muted />
        </div>
      )}
    </div>
  )
}

function Section({ title, items, empty, muted }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl font-bold uppercase text-bone/80">{title}</h2>
      {items.length === 0 ? (
        <p className="font-mono text-sm text-bone/30">{empty}</p>
      ) : (
        <div>
          {items.map((a) => <BookingRow key={a.id} a={a} muted={muted} />)}
        </div>
      )}
    </div>
  )
}

function BookingRow({ a, muted }) {
  const statusColor = {
    confirmed: 'text-green-400',
    pending: 'text-gold-300',
    completed: 'text-bone/40',
    cancelled: 'text-red-400',
    no_show: 'text-amber-400',
  }
  return (
    <div className={`grid grid-cols-1 gap-2 border-t border-white/[0.08] py-4 last:border-b sm:grid-cols-[1.3fr_1fr_auto] sm:items-baseline ${muted ? 'opacity-70' : ''}`}>
      <div>
        <p className="font-display text-xl font-bold uppercase text-bone">{a.service_name}</p>
        <p className="font-mono text-xs text-bone/50">${a.service_price}{a.deposit_paid ? ' · $11 deposit paid' : ''}</p>
      </div>
      <div className="font-mono text-sm text-bone/60">
        {format(parseISO(a.appointment_date + 'T12:00:00'), 'EEE, MMM d, yyyy')} · {to12h(a.appointment_time)}
      </div>
      <div className={`font-mono text-xs uppercase tracking-widest sm:text-right ${statusColor[a.status] || 'text-bone/40'}`}>
        {a.status?.replace('_', '-')}
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950">
      <img src="/logo-mark.png" alt="" className="h-12 w-auto animate-pulse select-none" />
    </div>
  )
}
