import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, parseISO } from 'date-fns'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  LogOut, Users, DollarSign, Calendar, TrendingUp, Scissors, Phone, Mail,
  Search, Download, Send, BarChart2, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Save, Settings, UserPlus, KeyRound, Plus, Upload,
  Bot, MessageSquare, Zap, Activity, SlidersHorizontal, ThumbsUp, ThumbsDown,
  Power, Inbox, Clock,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkle } from '../components/Icons'
import { Link } from 'react-router-dom'
import { barbers as staticBarbers, hours as staticHours, services as staticServices } from '../data'

const TABS = ['Overview', 'Appointments', 'Customers', 'Marketing', 'Barbers', 'Growth', 'Settings']

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
    if (err) toast.error(err.message || 'Invalid credentials')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950 px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <img src="/logo-full.png" alt="Magic Cuts Barbershop" className="mx-auto w-44 select-none" />
        <h1 className="mt-10 text-center font-display text-4xl font-bold uppercase text-bone">Command Station</h1>
        <p className="mt-2 text-center font-mono text-xs text-bone/45">owner access</p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block">
            <span className="mb-2 block font-mono text-xs text-bone/50">email</span>
            <input className="input" type="email" placeholder="owner@magicutsalon.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs text-bone/50">password</span>
            <input className="input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </label>
          <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Access Dashboard'}</button>
        </form>
        <Link to="/" className="mt-8 block text-center font-mono text-xs text-bone/40 transition-colors hover:text-bone">← Back to site</Link>
      </motion.div>
    </div>
  )
}

// ─── Command Station ──────────────────────────────────────────────────────────
function CommandStation({ signOut }) {
  const [tab, setTab] = useState('Overview')
  const [appointments, setAppointments] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(14)
  const [realtimeActive, setRealtimeActive] = useState(false)

  const buildRevenue = useCallback((appts, numDays) => {
    const map = {}
    for (let i = numDays - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'MM/dd')
      map[d] = 0
    }
    appts.forEach((a) => {
      if (!a.deposit_paid) return
      const d = format(parseISO(a.appointment_date), 'MM/dd')
      if (map[d] !== undefined) map[d] += (a.deposit_amount || 0) / 100
    })
    return Object.entries(map).map(([date, amount]) => ({ date, amount }))
  }, [])

  const loadData = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    const [appts, conts] = await Promise.all([
      supabase.from('appointments').select('*').order('appointment_date', { ascending: false }).limit(500),
      supabase.from('marketing_contacts').select('id, email, phone, opted_in_email, opted_in_sms, created_at').limit(500),
    ])
    setAppointments(appts.data || [])
    setContacts(conts.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Real-time subscription
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadData()
      })
      .subscribe((status) => {
        setRealtimeActive(status === 'SUBSCRIBED')
      })
    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  const revenue = buildRevenue(appointments, days)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayAppts = appointments.filter((a) => a.appointment_date === todayStr)
  const totalRevenue = appointments.filter((a) => a.deposit_paid).length * 11
  const uniqueCustomers = new Set(appointments.map((a) => a.customer_email)).size

  return (
    <div className="min-h-screen bg-onyx-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-onyx-950/90 backdrop-blur">
        <div className="shell flex h-[60px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkle className="h-5 w-5 text-gold-300" />
            <span className="font-display text-lg text-bone">Magic Cuts Command Station</span>
            {realtimeActive && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-400" title="Live updates active" />
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-bone/40 sm:block">{format(new Date(), 'EEEE, MMM d')}</span>
            <button onClick={() => loadData()} className="flex items-center gap-1 text-xs text-bone/40 hover:text-bone" title="Refresh">
              <RefreshCw size={13} />
            </button>
            <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-bone/50 hover:text-bone">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
        <div className="shell flex gap-1 overflow-x-auto pb-px">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-gold-300 text-gold-300' : 'text-bone/50 hover:text-bone'}`}
            >
              {t === 'Settings' ? <span className="flex items-center gap-1"><Settings size={13} />{t}</span>
                : t === 'Growth' ? <span className="flex items-center gap-1"><Bot size={13} />{t}</span>
                : t}
            </button>
          ))}
        </div>
      </header>

      <main className="shell py-8">
        {loading ? (
          <p className="text-center text-bone/40 py-20">Loading data…</p>
        ) : (
          <>
            {tab === 'Overview' && (
              <Overview
                today={todayAppts}
                totalRevenue={totalRevenue}
                totalAppts={appointments.length}
                uniqueCustomers={uniqueCustomers}
                revenue={revenue}
                appointments={appointments}
                days={days}
                setDays={setDays}
                onUpdate={loadData}
              />
            )}
            {tab === 'Appointments' && <AppointmentsTab appointments={appointments} onUpdate={loadData} />}
            {tab === 'Customers' && <CustomersTab appointments={appointments} />}
            {tab === 'Marketing' && <MarketingTab contacts={contacts} />}
            {tab === 'Barbers' && <BarbersTab appointments={appointments} />}
            {tab === 'Growth' && <GrowthTab />}
            {tab === 'Settings' && <SettingsTab />}
          </>
        )}
      </main>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ today, totalRevenue, totalAppts, uniqueCustomers, revenue, appointments, days, setDays, onUpdate }) {
  return (
    <div className="space-y-8">
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

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-bone">Deposit revenue</p>
          <div className="flex gap-1">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${days === d ? 'bg-gold-300/20 text-gold-300 border border-gold-300/30' : 'text-bone/40 hover:text-bone/70'}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
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

      <div>
        <p className="mb-3 eyebrow text-[0.6rem]">Today's chair</p>
        {today.length === 0 ? (
          <p className="text-sm text-bone/40">No bookings today.</p>
        ) : (
          <div className="space-y-2">
            {today.map((a) => <FullApptRow key={a.id} a={a} onUpdate={onUpdate} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appointments ─────────────────────────────────────────────────────────────
function AppointmentsTab({ appointments, onUpdate }) {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (!q) return true
    const ql = q.toLowerCase()
    return (
      a.customer_name.toLowerCase().includes(ql) ||
      a.customer_email?.toLowerCase().includes(ql) ||
      a.service_name.toLowerCase().includes(ql)
    )
  })

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Price ($)', 'Status', 'Deposit Paid']
    const rows = filtered.map((a) => [
      a.customer_name, a.customer_email, a.customer_phone,
      a.service_name, a.appointment_date, a.appointment_time,
      a.service_price, a.status, a.deposit_paid ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `magic-cuts-appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filtered.length} appointments`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone/40" />
          <input className="input pl-9" placeholder="Search by name, email, service…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['all', 'confirmed', 'completed', 'no_show', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === s ? 'bg-gold-300/20 text-gold-300 border border-gold-300/30' : 'border border-white/10 text-bone/50 hover:text-bone'}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-bone/60 transition-colors hover:border-gold-300/30 hover:text-bone">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <p className="text-xs text-bone/40">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
      <div className="space-y-2">
        {filtered.map((a) => <FullApptRow key={a.id} a={a} onUpdate={onUpdate} />)}
        {!filtered.length && <p className="py-12 text-center text-sm text-bone/30">No appointments found.</p>}
      </div>
    </div>
  )
}

function FullApptRow({ a, onUpdate }) {
  const [updating, setUpdating] = useState(false)

  function to12h(t) {
    if (!t) return ''
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const statusColor = {
    confirmed: 'text-green-400',
    pending: 'text-gold-300',
    completed: 'text-bone/40',
    cancelled: 'text-red-400',
    no_show: 'text-amber-400',
  }

  const setStatus = async (newStatus) => {
    if (!supabase || updating) return
    setUpdating(true)
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', a.id)
    setUpdating(false)
    if (error) { toast.error('Update failed'); return }
    toast.success(`Marked as ${newStatus.replace('_', ' ')}`)
    onUpdate?.()
  }

  const canAct = a.status === 'confirmed' || a.status === 'pending'

  return (
    <div className="card p-4 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
        <div>
          <p className="font-medium text-bone">{a.customer_name}</p>
          <p className="text-xs text-bone/50">{a.service_name}</p>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-bone/60"><Mail size={11} /> <span className="truncate text-xs">{a.customer_email}</span></div>
          <div className="flex items-center gap-1 text-bone/60"><Phone size={11} /> <span className="text-xs">{a.customer_phone}</span></div>
        </div>
        <div className="text-right">
          <p className="text-bone">{format(parseISO(a.appointment_date), 'MMM d')}</p>
          <p className="text-xs text-bone/50">{to12h(a.appointment_time)}</p>
        </div>
        <div className="text-right">
          <p className="text-gold-300">${a.service_price}</p>
          <p className="text-xs text-bone/50">{a.deposit_paid ? '$11 paid' : 'deposit pending'}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[0.6rem] font-semibold uppercase tracking-widest ${statusColor[a.status] || 'text-bone/40'}`}>
            {a.status?.replace('_', '-')}
          </span>
          {canAct && !updating && (
            <div className="flex gap-1">
              <button
                onClick={() => setStatus('completed')}
                title="Mark completed"
                className="flex items-center gap-0.5 rounded border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[0.6rem] text-green-400 hover:bg-green-500/20"
              >
                <CheckCircle size={10} /> Done
              </button>
              <button
                onClick={() => setStatus('no_show')}
                title="Mark no-show"
                className="flex items-center gap-0.5 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[0.6rem] text-amber-400 hover:bg-amber-500/20"
              >
                <AlertCircle size={10} /> N/S
              </button>
              <button
                onClick={() => setStatus('cancelled')}
                title="Cancel"
                className="flex items-center gap-0.5 rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[0.6rem] text-red-400 hover:bg-red-500/20"
              >
                <XCircle size={10} /> Cancel
              </button>
            </div>
          )}
          {updating && <p className="text-[0.6rem] text-bone/40">Saving…</p>}
        </div>
      </div>
      {a.notes && (
        <p className="mt-2 border-t border-white/[0.05] pt-2 text-xs text-bone/40">
          <span className="text-bone/30">Notes: </span>{a.notes}
        </p>
      )}
    </div>
  )
}

// ─── Customers ────────────────────────────────────────────────────────────────
function CustomersTab({ appointments }) {
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

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Visits', 'Lifetime Spend ($)', 'Last Visit']
    const rows = customers.map((c) => [c.name, c.email, c.phone, c.visits, c.spent, c.last])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `magic-cuts-customers-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${customers.length} customers`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone/50">{customers.length} unique customers</p>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-bone/60 hover:border-gold-300/30 hover:text-bone">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div className="space-y-2">
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')
      const res = await fetch('/.netlify/functions/send-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subject, message, type }),
      })
      if (!res.ok) throw new Error('Send failed')
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
        {type === 'sms' && <p className="text-xs text-bone/40">{message.length}/160</p>}
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
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {contacts.slice(0, 50).map((c) => (
            <div key={c.id} className="card flex items-center justify-between p-3 text-xs">
              <span className="truncate text-bone/70">{c.email || c.phone}</span>
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
  const [barbers, setBarbers] = useState(staticBarbers)
  const [editing, setEditing] = useState(null) // barber id being edited
  const [saving, setSaving] = useState(false)

  const mapRow = (b) => ({
    id: b.id,
    name: b.name,
    title: b.title,
    bio: b.bio || '',
    specialties: b.specialties || [],
    photo: b.photo_url || `/barbers/${b.id}.jpg`,
  })

  // Try to load from Supabase
  const loadBarbers = useCallback(() => {
    if (!supabase) return
    supabase.from('barbers').select('*').order('display_order').then(({ data }) => {
      if (data && data.length) setBarbers(data.map(mapRow))
    })
  }, [])

  useEffect(() => { loadBarbers() }, [loadBarbers])

  const addBarber = async () => {
    if (!supabase) { toast.error('Connect Supabase to add barbers'); return }
    const order = barbers.length + 1
    const { data, error } = await supabase
      .from('barbers')
      .insert({ name: 'New Barber', title: 'Barber', display_order: order })
      .select()
      .single()
    if (error || !data) { toast.error('Could not add barber'); return }
    setBarbers((prev) => [...prev, mapRow(data)])
    setEditing(data.id)
    toast.success('Barber added — edit their details')
  }

  const byBarber = {}
  appointments.forEach((a) => {
    if (!byBarber[a.barber_id]) byBarber[a.barber_id] = { cuts: 0, revenue: 0, completed: 0 }
    byBarber[a.barber_id].cuts++
    byBarber[a.barber_id].revenue += a.service_price || 0
    if (a.status === 'completed') byBarber[a.barber_id].completed++
  })

  const chartData = barbers.map((b) => ({
    name: b.name.split(' ')[0],
    cuts: byBarber[b.id]?.cuts || 0,
    revenue: byBarber[b.id]?.revenue || 0,
  }))

  const saveBarber = async (barber, updates) => {
    setSaving(true)
    if (supabase) {
      const row = { name: updates.name, title: updates.title, bio: updates.bio, specialties: updates.specialties }
      if (updates.photo) row.photo_url = updates.photo
      const { error } = await supabase
        .from('barbers')
        .update(row)
        .eq('id', barber.id)
      if (error) { toast.error('Save failed'); setSaving(false); return }
    }
    setBarbers((prev) => prev.map((b) => b.id === barber.id ? { ...b, ...updates } : b))
    toast.success('Barber profile updated')
    setEditing(null)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="mb-4 text-sm font-semibold text-bone">Cuts per barber</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#9a958c', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9a958c', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1c1c21', border: '1px solid rgba(199,154,58,0.2)', borderRadius: 8, color: '#f4efe6' }} />
            <Bar dataKey="cuts" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#c79a3a' : i === 1 ? '#9c6f20' : '#34343d'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-bone">Roster</p>
        <button onClick={addBarber} className="btn-ghost py-2 text-xs">
          <Plus size={13} /> Add barber
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {barbers.map((b) => (
          <BarberCard
            key={b.id}
            barber={b}
            stats={byBarber[b.id]}
            isEditing={editing === b.id}
            saving={saving}
            onEdit={() => setEditing(b.id)}
            onCancel={() => setEditing(null)}
            onSave={(updates) => saveBarber(b, updates)}
          />
        ))}
      </div>
    </div>
  )
}

function BarberCard({ barber, stats, isEditing, saving, onEdit, onCancel, onSave }) {
  const [form, setForm] = useState({ name: barber.name, title: barber.title, bio: barber.bio, specialties: barber.specialties?.join(', ') || '', photo: barber.photo })
  const [uploading, setUploading] = useState(false)

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!supabase) { toast.error('Connect Supabase to upload photos'); return }
    setUploading(true)
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${barber.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('barber-photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) { toast.error('Upload failed'); setUploading(false); return }
    const { data } = supabase.storage.from('barber-photos').getPublicUrl(path)
    setForm((f) => ({ ...f, photo: data.publicUrl }))
    setUploading(false)
    toast.success('Photo uploaded — save to apply')
  }

  if (isEditing) {
    return (
      <div className="card p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-bone/40">Editing {barber.name.split(' ')[0]}</p>
        <div className="flex items-center gap-3">
          <img src={form.photo} alt="" className="h-14 w-14 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
          <label className="btn-ghost cursor-pointer py-2 text-xs">
            <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
          </label>
        </div>
        <input className="input text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" />
        <input className="input text-sm" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" />
        <textarea className="input resize-none text-sm" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Bio" />
        <input className="input text-sm" value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="Specialties (comma separated)" />
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1 text-xs py-2">Cancel</button>
          <button
            disabled={saving || uploading}
            onClick={() => onSave({ ...form, specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean) })}
            className="btn-gold flex-1 text-xs py-2"
          >
            <Save size={12} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src={barber.photo} alt="" className="h-11 w-11 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
          <div>
            <p className="font-display text-lg text-bone">{barber.name}</p>
            <p className="text-xs text-bone/50">{barber.title}</p>
          </div>
        </div>
        <button onClick={onEdit} className="text-xs text-bone/30 hover:text-bone">Edit</button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Cuts', val: stats?.cuts || 0 },
          { label: 'Revenue', val: `$${stats?.revenue || 0}` },
          { label: 'Completed', val: stats?.completed || 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-onyx-800/60 p-2">
            <p className="font-display text-lg text-gold-300">{s.val}</p>
            <p className="text-[0.58rem] text-bone/40">{s.label}</p>
          </div>
        ))}
      </div>
      {barber.bio && <p className="mt-3 text-xs leading-relaxed text-bone/50">{barber.bio}</p>}
      <BarberLoginCreator barber={barber} />
    </div>
  )
}

// Owner generates the barber's portal login here — barbers never self-register.
function BarberLoginCreator({ barber }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const create = async () => {
    if (!email || pw.length < 8) { toast.error('Email and an 8+ char password required'); return }
    if (!supabase) { toast.error('Connect Supabase to create logins'); return }
    setBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')
      const res = await fetch('/api/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ email, password: pw, barber_id: barber.id, role: 'barber' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not create login')
      toast.success(`Login created for ${barber.name.split(' ')[0]}`)
      setDone(true)
      setOpen(false)
      setEmail(''); setPw('')
    } catch (e) { toast.error(e.message) }
    setBusy(false)
  }

  if (done) {
    return (
      <p className="mt-4 flex items-center gap-1.5 border-t border-white/[0.06] pt-3 text-xs text-green-400">
        <CheckCircle size={12} /> Portal login created — share the credentials securely.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] pt-3 text-xs text-bone/40 hover:text-gold-300"
      >
        <UserPlus size={12} /> Create portal login
      </button>
    )
  }

  return (
    <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
      <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wide text-bone/40">
        <KeyRound size={11} /> New barber login
      </p>
      <input className="input text-sm" type="email" placeholder="barber@magicutsalon.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input text-sm" type="text" placeholder="Temporary password (8+ chars)" value={pw} onChange={(e) => setPw(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={() => { setOpen(false); setEmail(''); setPw('') }} className="btn-ghost flex-1 py-2 text-xs">Cancel</button>
        <button onClick={create} disabled={busy} className="btn-gold flex-1 py-2 text-xs">{busy ? 'Creating…' : 'Create'}</button>
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [hours, setHours] = useState(staticHours)
  const [services, setServices] = useState(staticServices)
  const [savingHours, setSavingHours] = useState(false)
  const [savingServices, setSavingServices] = useState(false)
  const [hoursLoaded, setHoursLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('shop_settings').select('key, value').in('key', ['hours', 'services']).then(({ data }) => {
      if (!data) return
      data.forEach((row) => {
        if (row.key === 'hours') { setHours(row.value); setHoursLoaded(true) }
        if (row.key === 'services') setServices(row.value)
      })
    })
  }, [])

  const saveHours = async () => {
    setSavingHours(true)
    if (supabase) {
      const { error } = await supabase.from('shop_settings').upsert({ key: 'hours', value: hours, updated_at: new Date().toISOString() })
      if (error) { toast.error('Save failed'); setSavingHours(false); return }
    }
    toast.success('Hours saved')
    setSavingHours(false)
  }

  const saveServices = async () => {
    setSavingServices(true)
    if (supabase) {
      const { error } = await supabase.from('shop_settings').upsert({ key: 'services', value: services, updated_at: new Date().toISOString() })
      if (error) { toast.error('Save failed'); setSavingServices(false); return }
    }
    toast.success('Services saved')
    setSavingServices(false)
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Hours editor */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="eyebrow text-[0.6rem]">Shop Hours</p>
          <button onClick={saveHours} disabled={savingHours} className="btn-gold text-xs py-2">
            <Save size={13} /> {savingHours ? 'Saving…' : 'Save Hours'}
          </button>
        </div>
        <div className="card divide-y divide-white/[0.06]">
          {hours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-4 px-5 py-3">
              <span className="w-24 text-sm text-bone/70">{h.day}</span>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  value={h.open === 'Closed' ? '' : h.open}
                  onChange={(e) => {
                    const val = e.target.value || 'Closed'
                    setHours((prev) => prev.map((row, idx) => idx === i ? { ...row, open: val } : row))
                  }}
                  disabled={h.open === 'Closed'}
                  className="input py-1.5 text-sm w-28"
                />
                <span className="text-bone/30 text-xs">to</span>
                <input
                  type="time"
                  value={h.close}
                  onChange={(e) => setHours((prev) => prev.map((row, idx) => idx === i ? { ...row, close: e.target.value } : row))}
                  disabled={h.open === 'Closed'}
                  className="input py-1.5 text-sm w-28"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-bone/50">
                <input
                  type="checkbox"
                  checked={h.open === 'Closed'}
                  onChange={(e) => setHours((prev) => prev.map((row, idx) => idx === i ? { ...row, open: e.target.checked ? 'Closed' : '10:00', close: e.target.checked ? '' : '19:00' } : row))}
                  className="accent-gold-300"
                />
                Closed
              </label>
            </div>
          ))}
        </div>
        {!hoursLoaded && supabase && (
          <p className="mt-2 text-xs text-bone/30">⚠ Run migration 002 to enable saving hours to Supabase.</p>
        )}
      </div>

      {/* Service pricing editor */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="eyebrow text-[0.6rem]">Service Pricing</p>
          <button onClick={saveServices} disabled={savingServices} className="btn-gold text-xs py-2">
            <Save size={13} /> {savingServices ? 'Saving…' : 'Save Prices'}
          </button>
        </div>
        <div className="card divide-y divide-white/[0.06]">
          {services.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3">
              <span className="flex-1 text-sm text-bone/70">{s.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-bone/40 text-sm">$</span>
                <input
                  type="number"
                  min={1}
                  value={s.price}
                  onChange={(e) => setServices((prev) => prev.map((row, idx) => idx === i ? { ...row, price: parseInt(e.target.value) || row.price } : row))}
                  className="input w-20 py-1.5 text-sm text-right"
                />
              </div>
              <span className="w-16 text-right text-xs text-bone/40">{s.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Growth Tab (AI Growth Engine) ───────────────────────────────────────────
function GrowthTab() {
  const [sub, setSub] = useState('queue')
  const SUBS = [
    { id: 'queue', label: 'Approval Queue', icon: Inbox },
    { id: 'inbox', label: 'Conversations', icon: MessageSquare },
    { id: 'log', label: 'Agent Log', icon: Activity },
    { id: 'settings', label: 'AI Settings', icon: SlidersHorizontal },
  ]
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-300/10">
          <Bot size={18} className="text-gold-300" />
        </div>
        <div>
          <p className="font-display text-xl text-bone">AI Growth Engine</p>
          <p className="text-xs text-bone/40">Automated rebooking, reminders, and receptionist</p>
        </div>
      </div>
      <div className="mb-6 flex gap-1 border-b border-white/10 pb-px">
        {SUBS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSub(id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${sub === id ? 'border-b-2 border-gold-300 text-gold-300' : 'text-bone/50 hover:text-bone'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>
      {sub === 'queue' && <ApprovalQueue />}
      {sub === 'inbox' && <ConversationInbox />}
      {sub === 'log' && <AgentLog />}
      {sub === 'settings' && <AgentSettings />}
    </div>
  )
}

function ApprovalQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const { session } = useAuthStore()

  const load = async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('agent_actions')
      .select('id, agent, action, payload, created_at, customer_id, customers(name, phone, email)')
      .eq('status', 'queued')
      .order('created_at', { ascending: false })
      .limit(50)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const decide = async (id, decision) => {
    if (!session) return
    setBusy(id)
    try {
      const res = await fetch('/api/approve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action_id: id, decision }),
      })
      const json = await res.json()
      if (json.ok || decision === 'skip') {
        toast.success(decision === 'approve' ? 'Message sent!' : 'Skipped')
        setItems((prev) => prev.filter((a) => a.id !== id))
      } else {
        toast.error(json.error || 'Failed')
      }
    } catch {
      toast.error('Network error')
    }
    setBusy(null)
  }

  if (loading) return <p className="py-12 text-center text-bone/40">Loading…</p>
  if (!items.length) return (
    <div className="py-16 text-center">
      <CheckCircle size={32} className="mx-auto mb-3 text-green-400/50" />
      <p className="text-bone/40">Queue is clear — no pending messages.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone/50">{items.length} message{items.length !== 1 ? 's' : ''} awaiting approval</p>
        <button
          onClick={async () => {
            if (!confirm(`Send all ${items.length} queued messages?`)) return
            for (const item of items) await decide(item.id, 'approve')
          }}
          className="btn-gold text-xs py-2"
        >
          <Zap size={12} /> Approve All
        </button>
      </div>
      {items.map((item) => {
        const cust = item.customers
        const ch = item.payload?.channel || 'sms'
        return (
          <div key={item.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-gold-300/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gold-300">{item.agent}</span>
                  <span className="text-[0.65rem] text-bone/30">{ch.toUpperCase()}</span>
                </div>
                <p className="text-sm text-bone/80 font-medium">{cust?.name || 'Unknown customer'}</p>
                <p className="text-xs text-bone/40">{ch === 'sms' ? cust?.phone : cust?.email}</p>
                <p className="mt-2 rounded-lg bg-onyx-800/60 p-3 text-sm text-bone/70 whitespace-pre-wrap">{item.payload?.body || '—'}</p>
                <p className="mt-1.5 text-[0.65rem] text-bone/25">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  disabled={busy === item.id}
                  onClick={() => decide(item.id, 'approve')}
                  className="flex items-center gap-1 rounded-xl bg-green-500/15 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/25 disabled:opacity-40"
                >
                  <ThumbsUp size={12} /> Send
                </button>
                <button
                  disabled={busy === item.id}
                  onClick={() => decide(item.id, 'skip')}
                  className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-bone/40 hover:text-bone disabled:opacity-40"
                >
                  <ThumbsDown size={12} /> Skip
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConversationInbox() {
  const [convos, setConvos] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('conversations')
      .select('id, channel, status, created_at, customers(name, phone, email)')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { setConvos(data || []); setLoading(false) })
  }, [])

  const openThread = async (convo) => {
    setSelected(convo)
    const { data } = await supabase
      .from('messages')
      .select('direction, body, sender, created_at')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true })
      .limit(50)
    setMessages(data || [])
  }

  if (loading) return <p className="py-12 text-center text-bone/40">Loading…</p>

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 text-xs text-bone/40 hover:text-bone">← All conversations</button>
        <p className="mb-1 font-display text-lg text-bone">{selected.customers?.name || selected.customers?.phone || 'Unknown'}</p>
        <p className="mb-5 text-xs text-bone/40">{selected.channel.toUpperCase()} · {selected.status}</p>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.direction === 'out' ? 'bg-gold-300/15 text-bone' : 'bg-onyx-800 text-bone/80'}`}>
                {m.body}
                <p className="mt-1 text-[0.6rem] text-bone/30">{m.sender} · {new Date(m.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {!messages.length && <p className="text-center text-bone/30 py-8">No messages yet</p>}
        </div>
      </div>
    )
  }

  if (!convos.length) return (
    <div className="py-16 text-center">
      <MessageSquare size={32} className="mx-auto mb-3 text-bone/20" />
      <p className="text-bone/40">No conversations yet. They'll appear here when customers text or chat.</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {convos.map((c) => (
        <button key={c.id} onClick={() => openThread(c)} className="card w-full p-4 text-left hover:border-gold-300/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bone">{c.customers?.name || c.customers?.phone || 'Unknown'}</p>
              <p className="text-xs text-bone/40">{c.channel.toUpperCase()} · {new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${c.status === 'needs_human' ? 'bg-amber-400/15 text-amber-400' : c.status === 'closed' ? 'bg-white/5 text-bone/30' : 'bg-green-400/10 text-green-400'}`}>
              {c.status}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

function AgentLog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('agent_actions')
      .select('id, agent, action, status, reason, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  const statusColor = (s) => ({
    auto_sent: 'text-green-400', sent: 'text-green-400', queued: 'text-gold-300',
    approved: 'text-blue-400', skipped: 'text-bone/30', failed: 'text-red-400',
  }[s] || 'text-bone/40')

  if (loading) return <p className="py-12 text-center text-bone/40">Loading…</p>
  if (!items.length) return <p className="py-12 text-center text-bone/40">No agent activity yet.</p>

  return (
    <div className="card divide-y divide-white/[0.04] overflow-hidden">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 px-5 py-3">
          <span className="shrink-0 rounded-full bg-gold-300/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold-300">{item.agent}</span>
          <span className="flex-1 text-sm text-bone/70">{item.action}{item.customers?.name ? ` → ${item.customers.name}` : ''}</span>
          <span className={`text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span>
          <span className="shrink-0 text-[0.6rem] text-bone/25">{new Date(item.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function AgentSettings() {
  const [settings, setSettings] = useState({
    ai_kill_switch: false,
    ai_autonomy: { transactional: 'auto', marketing: 'approval' },
    ai_quiet_hours: { start: '09:00', end: '20:00', tz: 'America/New_York' },
    ai_frequency_caps: { per_customer_per_week: 2, global_per_day: 200 },
  })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const keys = ['ai_kill_switch', 'ai_autonomy', 'ai_quiet_hours', 'ai_frequency_caps']
    supabase.from('shop_settings').select('key, value').in('key', keys).then(({ data }) => {
      if (!data) return
      const map = Object.fromEntries(data.map((r) => [r.key, r.value]))
      setSettings((s) => ({ ...s, ...map }))
      setLoaded(true)
    })
  }, [])

  const save = async () => {
    if (!supabase) return
    setSaving(true)
    const entries = Object.entries(settings)
    for (const [key, value] of entries) {
      await supabase.from('shop_settings').upsert({ key, value }, { onConflict: 'key' })
    }
    toast.success('AI settings saved')
    setSaving(false)
  }

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }))
  const s = settings

  return (
    <div className="max-w-lg space-y-8">
      {/* Kill switch */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base text-bone">Kill Switch</p>
            <p className="text-xs text-bone/40 mt-0.5">Immediately pause all agent-initiated outbound messages.</p>
          </div>
          <button
            onClick={() => update('ai_kill_switch', !s.ai_kill_switch)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${s.ai_kill_switch ? 'bg-red-500/20 text-red-400' : 'bg-green-500/15 text-green-400'}`}
          >
            <Power size={18} />
          </button>
        </div>
        {s.ai_kill_switch && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            ⚠ Kill switch is ON — all AI outbound is paused.
          </p>
        )}
      </div>

      {/* Autonomy */}
      <div className="card p-5 space-y-4">
        <p className="font-display text-base text-bone">Autonomy Mode</p>
        {[
          { key: 'transactional', label: 'Transactional', hint: 'Reminders, confirmations, review requests' },
          { key: 'marketing', label: 'Marketing', hint: 'Rebooking nudges, win-back, promos' },
        ].map(({ key, label, hint }) => (
          <div key={key}>
            <p className="text-sm text-bone/70">{label}</p>
            <p className="text-xs text-bone/35 mb-1.5">{hint}</p>
            <div className="flex gap-2">
              {['auto', 'approval'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => update('ai_autonomy', { ...s.ai_autonomy, [key]: mode })}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${s.ai_autonomy?.[key] === mode ? 'bg-gold-300 text-onyx-950' : 'border border-white/10 text-bone/50 hover:text-bone'}`}
                >
                  {mode === 'auto' ? 'Auto-send' : 'Needs approval'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div className="card p-5 space-y-3">
        <p className="font-display text-base text-bone">Quiet Hours</p>
        <p className="text-xs text-bone/40">Marketing messages are only sent within these hours.</p>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-bone/40 mb-1">From</p>
            <input type="time" value={s.ai_quiet_hours?.start || '09:00'} onChange={(e) => update('ai_quiet_hours', { ...s.ai_quiet_hours, start: e.target.value })} className="input py-1.5 text-sm w-32" />
          </div>
          <span className="text-bone/30 mt-4">to</span>
          <div>
            <p className="text-xs text-bone/40 mb-1">Until</p>
            <input type="time" value={s.ai_quiet_hours?.end || '20:00'} onChange={(e) => update('ai_quiet_hours', { ...s.ai_quiet_hours, end: e.target.value })} className="input py-1.5 text-sm w-32" />
          </div>
        </div>
      </div>

      {/* Frequency caps */}
      <div className="card p-5 space-y-4">
        <p className="font-display text-base text-bone">Frequency Caps</p>
        <div>
          <p className="text-sm text-bone/70 mb-1">Per customer per week</p>
          <input type="number" min={1} max={10} value={s.ai_frequency_caps?.per_customer_per_week || 2} onChange={(e) => update('ai_frequency_caps', { ...s.ai_frequency_caps, per_customer_per_week: parseInt(e.target.value) || 2 })} className="input w-24 py-1.5 text-sm" />
        </div>
        <div>
          <p className="text-sm text-bone/70 mb-1">Global messages per day</p>
          <input type="number" min={1} max={2000} value={s.ai_frequency_caps?.global_per_day || 200} onChange={(e) => update('ai_frequency_caps', { ...s.ai_frequency_caps, global_per_day: parseInt(e.target.value) || 200 })} className="input w-24 py-1.5 text-sm" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-gold w-full">
        <Save size={14} /> {saving ? 'Saving…' : 'Save AI Settings'}
      </button>

      {!loaded && supabase && (
        <p className="text-xs text-bone/30">⚠ Run migration 005 to enable AI settings persistence.</p>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950">
      <Sparkle className="h-8 w-8 animate-pulse text-gold-300" />
    </div>
  )
}
