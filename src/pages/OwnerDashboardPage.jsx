import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, parseISO } from 'date-fns'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  LogOut, Users, DollarSign, Calendar, TrendingUp, Scissors, Phone, Mail,
  Search, Download, Send, BarChart2, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Save, Settings, UserPlus, KeyRound,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkle } from '../components/Icons'
import { Link } from 'react-router-dom'
import { barbers as staticBarbers, hours as staticHours, services as staticServices } from '../data'

const TABS = ['Overview', 'Appointments', 'Customers', 'Marketing', 'Barbers', 'Settings']

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
              {t === 'Settings' ? <span className="flex items-center gap-1"><Settings size={13} />{t}</span> : t}
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

  // Try to load from Supabase
  useEffect(() => {
    if (!supabase) return
    supabase.from('barbers').select('*').order('display_order').then(({ data }) => {
      if (data && data.length) {
        // Map Supabase barbers to match UI shape
        setBarbers(data.map((b) => ({
          id: b.id,
          name: b.name,
          title: b.title,
          bio: b.bio || '',
          specialties: b.specialties || [],
          photo: b.photo_url || `/barbers/${b.id}.jpg`,
        })))
      }
    })
  }, [])

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
      const { error } = await supabase
        .from('barbers')
        .update({ name: updates.name, title: updates.title, bio: updates.bio, specialties: updates.specialties })
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
  const [form, setForm] = useState({ name: barber.name, title: barber.title, bio: barber.bio, specialties: barber.specialties?.join(', ') || '' })

  if (isEditing) {
    return (
      <div className="card p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-bone/40">Editing {barber.name.split(' ')[0]}</p>
        <input className="input text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" />
        <input className="input text-sm" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" />
        <textarea className="input resize-none text-sm" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Bio" />
        <input className="input text-sm" value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="Specialties (comma separated)" />
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1 text-xs py-2">Cancel</button>
          <button
            disabled={saving}
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
        <div>
          <p className="font-display text-lg text-bone">{barber.name}</p>
          <p className="text-xs text-bone/50">{barber.title}</p>
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

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx-950">
      <Sparkle className="h-8 w-8 animate-pulse text-gold-300" />
    </div>
  )
}
