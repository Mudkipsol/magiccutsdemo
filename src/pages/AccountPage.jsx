import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft, LogOut, Calendar, Clock, Scissors,
  LayoutDashboard, CalendarClock, Mail,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Sparkle } from '../components/Icons'
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
        <div className="shell flex h-[64px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-bone/60 hover:text-bone">
            <ArrowLeft size={16} /> Back to site
          </Link>
          <span className="flex items-center gap-2 font-display text-lg text-bone">
            <Sparkle className="h-4 w-4 text-gold-300" /> Magic Cuts
          </span>
          {session ? (
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-bone/50 hover:text-bone">
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <span className="w-[88px]" />
          )}
        </div>
      </header>

      <main className="shell max-w-3xl py-12">
        {!session ? (
          <AuthForms />
        ) : profile?.role === 'owner' ? (
          <StaffRedirect to="/dashboard" label="Owner Dashboard" icon={LayoutDashboard} />
        ) : profile?.role === 'barber' ? (
          <StaffRedirect to="/barber" label="My Schedule" icon={CalendarClock} />
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
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-300/10">
          <Mail size={24} className="text-gold-300" />
        </div>
        <h1 className="font-display text-2xl text-bone">Check your inbox</h1>
        <p className="mt-3 text-sm text-bone/60">
          We sent a confirmation link to <span className="text-bone">{email}</span>. Click it to
          finish setting up your account, then come back and sign in.
        </p>
        <button onClick={() => { setSentConfirm(false); setMode('login') }} className="btn-ghost mt-6">
          Back to sign in
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-bone">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm text-bone/50">
          {mode === 'login'
            ? 'Sign in to view and manage your appointments.'
            : 'Track your bookings and breeze through checkout next time.'}
        </p>
      </div>

      <div className="mb-6 flex rounded-xl border border-white/10 p-1">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === m ? 'bg-gold-300/15 text-gold-200' : 'text-bone/50 hover:text-bone'}`}
          >
            {m === 'login' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card space-y-4 p-7">
        {mode === 'register' && (
          <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={mode === 'register' ? 8 : undefined} />
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? 'Just a moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-bone/40">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-gold-300 hover:underline">
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </p>
    </motion.div>
  )
}

// ─── Staff shortcut (owner/barber landing here) ───────────────────────────────
function StaffRedirect({ to, label, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-300/10">
        <Icon size={24} className="text-gold-300" />
      </div>
      <h1 className="font-display text-2xl text-bone">You're signed in</h1>
      <p className="mt-2 text-sm text-bone/50">Head to your workspace to keep going.</p>
      <Link to={to} className="btn-gold mt-6 inline-flex">
        <Icon size={15} /> Open {label}
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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[0.6rem]">Your account</p>
          <h1 className="font-display text-3xl text-bone">Hey, {firstName}.</h1>
        </div>
        <Link to="/book" className="btn-gold text-xs">Book a Chair</Link>
      </div>

      {loading ? (
        <p className="py-16 text-center text-bone/40">Loading your appointments…</p>
      ) : appts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Calendar className="mx-auto h-8 w-8 text-bone/20" />
          <p className="mt-3 text-bone/50">No appointments yet.</p>
          <p className="mt-1 text-sm text-bone/30">
            Bookings made with <span className="text-bone/50">{session.user.email}</span> will show up here.
          </p>
          <Link to="/book" className="btn-gold mt-6 inline-flex text-xs">Book your first cut</Link>
        </div>
      ) : (
        <div className="space-y-10">
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
      <p className="mb-3 eyebrow text-[0.6rem]">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-bone/30">{empty}</p>
      ) : (
        <div className="space-y-2">
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
    <div className={`card grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-[1.3fr_1fr_auto] ${muted ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gold-300">
          <Scissors size={15} />
        </span>
        <div>
          <p className="font-medium text-bone">{a.service_name}</p>
          <p className="text-xs text-bone/50">${a.service_price}{a.deposit_paid ? ' · $11 deposit paid' : ''}</p>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-0.5">
        <span className="flex items-center gap-1.5 text-bone/70"><Calendar size={12} /> {format(parseISO(a.appointment_date + 'T12:00:00'), 'EEE, MMM d, yyyy')}</span>
        <span className="flex items-center gap-1.5 text-bone/50"><Clock size={12} /> {to12h(a.appointment_time)}</span>
      </div>
      <div className="flex items-center justify-end">
        <span className={`text-[0.6rem] font-semibold uppercase tracking-widest ${statusColor[a.status] || 'text-bone/40'}`}>
          {a.status?.replace('_', '-')}
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
