import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, parseISO } from 'date-fns'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { LogOut, Users, DollarSign, Calendar, TrendingUp, Scissors, Phone, Mail, Search, Download, Send, BarChart2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkle } from '../components/Icons'
import { Link } from 'react-router-dom'

const TABS = ['Overview', 'Appointments', 'Customers', 'Marketing', 'Barbers']

export default function OwnerDashboardPage() {
  const { session, profile, signIn, signOut, loading } = useAuthStore()
  if (loading) return <Spinner />
  if (!session || profile?.role !== 'owner') return <OwnerLogin signIn={signIn} />
  return <CommandStation signOut={signOut} />
}

// ─── Login ────────────────────────────────────────────────────────────────────
function OwnerLogin({ signIn }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const err = await signIn(email, pw)
    if (err) toast.error('Invalid credentials')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-300/10">
            <BarChart2 size={24} className="text-gold-300" />
          </div>
          <p className="font-display text-2xl text-bone">Command Station</p>
          <p className="text-sm text-bone/40">Magic Cuts · Owner Access</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-7">
          <input className="input" type="email" placeholder="owner@magicutsalon.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <button type="submit" disabled={busy} className="btn-gold w-full">{busy ? 'Signing in…' : 'Access Dashboard'}</button>
        </form>
        <Link to="/" className="mt-5 block text-center text-sm text-bone/30 hover:text-bone">← Back to site</Link>
      </motion.div>
    </div>
  )
}

// ─── Command Station ──────────────────────────────────────────────────────────
function CommandStation({ signOut }) {
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState({ appointments: [], contacts: [], revenue: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const load = async () => {
      const [appts, contacts] = await Promise.all([
        supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('marketing_contacts').select('id, email, phone, opted_in_email, opted_in_sms, created_at').limit(500),
      ])
      // Build daily revenue chart (last 14 days)
      const revenueMap = {}
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MM/dd')
        revenueMap[d] = 0
      }
      ;(appts.data || []).forEach((a) => {
        const d = format(parseISO(a.appointment_date), 'MM/dd')
        if (revenueMap[d] !== undefined) revenueMap[d] += (a.deposit_amount || 0) / 100
      })
      const revenue = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount }))
      setData({ appointments: appts.data || [], contacts: contacts.data || [], revenue })
      setLoading(false)
    }
    load()
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayAppts = data.appointments.filter((a) => a.appointment_date === todayStr)
  const totalRevenue = data.appointments.filter((a) => a.deposit_paid).length * 11
  const totalAppts = data.appointments.length
  const uniqueCustomers = new Set(data.appointments.map((a) => a.customer_email)).size

  return (
    <div className="min-h-screen bg-onyx-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-onyx-950/90 backdrop-blur">
        <div className="shell flex h-[60px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkle className="h-5 w-5 text-gold-300" />
            <span className="font-display text-lg text-bone">Magic Cuts Command Station</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-bone/40 sm:block">{format(new Date(), 'EEEE, MMM d')}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-bone/50 hover:text-bone">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="shell flex gap-1 overflow-x-auto pb-px">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-gold-300 text-gold-300' : 'text-bone/50 hover:text-bone'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="shell py-8">
        {loading ? (
          <p className="text-center text-bone/40 py-20">Loading data…</p>
        ) : (
          <>
            {tab === 'Overview' && <Overview today={todayAppts} totalRevenue={totalRevenue} totalAppts={totalAppts} uniqueCustomers={uniqueCustomers} revenue={data.revenue} appointments={data.appointments} />}
            {tab === 'Appointments' && <AppointmentsTab appointments={data.appointments} />}
            {tab === 'Customers' && <CustomersTab appointments={data.appointments} />}
            {tab === 'Marketing' && <MarketingTab contacts={data.contacts} />}
            {tab === 'Barbers' && <BarbersTab appointments={data.appointments} />}
          </>
        )}
      </main>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ today, totalRevenue, totalAppts, uniqueCustomers, revenue, appointments }) {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Calendar, label: "Today's bookings", value: today.length, sub: `${today.filter(a => a.status === 'confirmed').length} confirmed` },
          { icon: DollarSign, label: 'Deposits collected', value: `$${totalRevenue}`, sub: `${totalAppts} appointments` },
          { icon: Users, label: 'Unique customers', value: uniqueCustomers },
          { icon: TrendingUp, label: 'Completion rate', value: totalAppts ? `${Math.round((appointments.filter(a => a.status === 'completed').length / totalAppts) * 100)}%` : '—' },
        ].map((k) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-bone/40">{k.label}</p>
              <k.icon size={15} className="text-gold-300/60" />
            </div>
            <p className="mt-2 font-display text-2xl text-bone">{k.value}</p>
            {k.sub && <p className="mt-1 text-xs text-bone/40">{k.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card p-6">
        <p className="mb-4 text-sm font-semibold text-bone">Deposit revenue — last 14 days</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c79a3a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c79a3a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#9a958c', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9a958c', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#1c1c21', border: '1px solid rgba(199,154,58,0.2)', borderRadius: 8, color: '#f4efe6' }} formatter={(v) => [`$${v}`, 'Revenue']} />
            <Area type="monotone" dataKey="amount" stroke="#c79a3a" strokeWidth={2} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Today's appointments */}
      <div>
        <p className="mb-3 eyebrow text-[0.6rem]">Today's chair</p>
        {today.length === 0 ? (
          <p className="text-sm text-bone/40">No bookings today.</p>
        ) : (
          <div className="space-y-2">
            {today.map((a) => <FullApptRow key={a.id} a={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appointments ─────────────────────────────────────────────────────────────
function AppointmentsTab({ appointments }) {
  const [q, setQ] = useState('')
  const filtered = appointments.filter((a) =>
    !q || a.customer_name.toLowerCase().includes(q.toLowerCase()) ||
    a.customer_email?.toLowerCase().includes(q.toLowerCase()) ||
    a.service_name.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone/40" />
          <input className="input pl-9" placeholder="Search by name, email, service…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((a) => <FullApptRow key={a.id} a={a} />)}
        {!filtered.length && <p className="py-12 text-center text-sm text-bone/30">No appointments found.</p>}
      </div>
    </div>
  )
}

function FullApptRow({ a }) {
  function to12h(t) {
    if (!t) return ''
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const statusColor = { confirmed: 'text-green-400', pending: 'text-gold-300', completed: 'text-bone/40', cancelled: 'text-red-400', no_show: 'text-red-300' }

  return (
    <div className="card grid grid-cols-1 gap-2 p-4 text-sm sm:grid-cols-[1fr_1fr_auto_auto_auto]">
      <div>
        <p className="font-medium text-bone">{a.customer_name}</p>
        <p className="text-xs text-bone/50">{a.service_name}</p>
      </div>
      <div>
        <div className="flex items-center gap-1 text-bone/60"><Mail size={12} /> <span className="truncate text-xs">{a.customer_email}</span></div>
        <div className="flex items-center gap-1 text-bone/60"><Phone size={12} /> <span className="text-xs">{a.customer_phone}</span></div>
      </div>
      <div className="text-right">
        <p className="text-bone">{format(parseISO(a.appointment_date), 'MMM d')}</p>
        <p className="text-xs text-bone/50">{to12h(a.appointment_time)}</p>
      </div>
      <div className="text-right">
        <p className="text-gold-300">${a.service_price}</p>
        <p className="text-xs text-bone/50">{a.deposit_paid ? '$11 paid' : 'deposit pending'}</p>
      </div>
      <span className={`self-center text-[0.6rem] font-semibold uppercase tracking-widest ${statusColor[a.status] || 'text-bone/40'}`}>
        {a.status}
      </span>
    </div>
  )
}

// ─── Customers ────────────────────────────────────────────────────────────────
function CustomersTab({ appointments }) {
  // Group by email
  const map = {}
  appointments.forEach((a) => {
    if (!map[a.customer_email]) {
      map[a.customer_email] = { name: a.customer_name, email: a.customer_email, phone: a.customer_phone, visits: 0, spent: 0, last: a.appointment_date }
    }
    map[a.customer_email].visits++
    map[a.customer_email].spent += a.service_price || 0
    if (a.appointment_date > map[a.customer_email].last) map[a.customer_email].last = a.appointment_date
  })
  const customers = Object.values(map).sort((a, b) => b.visits - a.visits)

  return (
    <div className="space-y-2">
      <p className="text-sm text-bone/50">{customers.length} unique customers</p>
      {customers.map((c) => (
        <div key={c.email} className="card grid grid-cols-1 gap-2 p-4 text-sm sm:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <p className="font-medium text-bone">{c.name}</p>
            <div className="flex items-center gap-1 text-bone/50"><Mail size={11} /> <span className="text-xs">{c.email}</span></div>
          </div>
          <div className="flex items-center gap-1 text-bone/60"><Phone size={11} /> <span className="text-xs">{c.phone}</span></div>
          <div className="text-right">
            <p className="text-gold-300">${c.spent}</p>
            <p className="text-xs text-bone/50">lifetime</p>
          </div>
          <div className="text-right">
            <p className="text-bone">{c.visits} visit{c.visits !== 1 ? 's' : ''}</p>
            <p className="text-xs text-bone/50">last {c.last ? format(parseISO(c.last), 'MMM d') : '—'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Marketing ────────────────────────────────────────────────────────────────
function MarketingTab({ contacts }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('email')
  const [busy, setBusy] = useState(false)

  const send = async () => {
    if (!subject || !message) { toast.error('Subject and message required'); return }
    setBusy(true)
    try {
      await fetch('/.netlify/functions/send-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, type }),
      })
      toast.success(`${type === 'email' ? 'Email' : 'SMS'} campaign sent!`)
      setSubject(''); setMessage('')
    } catch { toast.error('Send failed') }
    setBusy(false)
  }

  const emailContacts = contacts.filter((c) => c.opted_in_email)
  const smsContacts = contacts.filter((c) => c.opted_in_sms)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <p className="eyebrow text-[0.6rem]">Send Campaign</p>
        <div className="flex gap-2">
          {['email', 'sms'].map((t) => (
            <button key={t} onClick={() => setType(t)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${type === t ? 'border-gold-300 bg-gold-300/15 text-gold-200' : 'border-white/10 text-bone/60'}`}>
              {t === 'email' ? `Email (${emailContacts.length})` : `SMS (${smsContacts.length})`}
            </button>
          ))}
        </div>
        {type === 'email' && (
          <input className="input" placeholder="Subject line" value={subject} onChange={(e) => setSubject(e.target.value)} />
        )}
        <textarea
          className="input resize-none"
          rows={5}
          placeholder={type === 'email' ? 'Email body (HTML supported)…' : 'SMS message (160 chars)…'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={type === 'sms' ? 160 : 5000}
        />
        <button onClick={send} disabled={busy} className="btn-gold w-full">
          <Send size={14} /> {busy ? 'Sending…' : `Send to ${type === 'email' ? emailContacts.length : smsContacts.length} ${type === 'email' ? 'subscribers' : 'SMS contacts'}`}
        </button>
      </div>

      <div>
        <p className="eyebrow mb-4 text-[0.6rem]">Subscribers</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email', count: emailContacts.length, icon: Mail },
            { label: 'SMS', count: smsContacts.length, icon: Phone },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <s.icon size={18} className="text-gold-300" />
              <p className="mt-2 font-display text-3xl text-bone">{s.count}</p>
              <p className="text-xs text-bone/50">{s.label} subscribers</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
          {contacts.slice(0, 50).map((c) => (
            <div key={c.id} className="card flex items-center justify-between p-3 text-xs">
              <span className="text-bone/70 truncate">{c.email || c.phone}</span>
              <span className="ml-3 shrink-0 text-bone/40">{format(parseISO(c.created_at), 'MMM d')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Barbers tab ──────────────────────────────────────────────────────────────
function BarbersTab({ appointments }) {
  const byBarber = {}
  appointments.forEach((a) => {
    if (!byBarber[a.barber_id]) byBarber[a.barber_id] = { cuts: 0, revenue: 0, completed: 0 }
    byBarber[a.barber_id].cuts++
    byBarber[a.barber_id].revenue += a.service_price || 0
    if (a.status === 'completed') byBarber[a.barber_id].completed++
  })

  const chartData = Object.entries(byBarber).map(([id, stats]) => ({
    name: id.slice(0, 6),
    cuts: stats.cuts,
    revenue: stats.revenue,
  }))

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="mb-4 text-sm font-semibold text-bone">Cuts per barber</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#9a958c', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9a958c', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1c1c21', border: '1px solid rgba(199,154,58,0.2)', borderRadius: 8, color: '#f4efe6' }} />
            <Bar dataKey="cuts" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#c79a3a' : i === 1 ? '#9c6f20' : '#34343d'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(byBarber).map(([id, s]) => (
          <div key={id} className="card p-5">
            <p className="text-xs text-bone/40">Barber ID: {id.slice(0, 8)}</p>
            <p className="mt-2 font-display text-2xl text-gold-300">{s.cuts}</p>
            <p className="text-xs text-bone/50">total cuts · ${s.revenue} earned</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Spinner() {
  return <div className="flex min-h-screen items-center justify-center bg-onyx-950"><Sparkle className="h-8 w-8 animate-pulse text-gold-300" /></div>
}
