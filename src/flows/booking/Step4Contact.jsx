import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useBookingStore } from '../../store/bookingStore'

function to12h(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function Step4Contact() {
  const { setContact, service, barber, date, time } = useBookingStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = '10-digit number required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const next = () => { if (validate()) setContact(form) }

  const rows = [
    ['Service', service?.name],
    ['Barber', barber?.name || 'Any available'],
    ['Date', date ? format(new Date(date), 'EEE, MMM d') : ''],
    ['Time', to12h(time)],
    ['Price', `$${service?.price} ($11 deposit today)`],
  ]

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase text-bone">Your details</h1>
      <p className="mt-3 text-bone/60">We'll confirm your booking by text and email.</p>

      {/* Booking summary — a ruled ledger, not a box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between border-t border-white/[0.08] py-2.5 last:border-b">
            <span className="font-mono text-xs text-bone/45">{label.toLowerCase()}</span>
            <span className="text-sm text-bone">{value}</span>
          </div>
        ))}
      </motion.div>

      <div className="mt-10 space-y-6">
        <Field label="Full name" error={errors.name}>
          <input className="input" placeholder="John Smith" value={form.name} onChange={set('name')} />
        </Field>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Email address" error={errors.email}>
            <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input className="input" type="tel" placeholder="(614) 000-0000" value={form.phone} onChange={set('phone')} />
          </Field>
        </div>
        <Field label="Anything we should know? (optional)">
          <textarea className="input resize-none" rows={3} placeholder="Style references, first visit, preferences…" value={form.notes} onChange={set('notes')} />
        </Field>
      </div>

      <p className="mt-5 font-mono text-xs text-bone/40">
        Your contact info is used only for your booking confirmation and reminders. We don't spam.
      </p>

      <button onClick={next} className="btn-gold mt-8 w-full">
        Continue to deposit
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between font-mono text-xs text-bone/50">
        {label.toLowerCase()}
        {error && <span className="text-red-400">{error}</span>}
      </span>
      {children}
    </label>
  )
}
