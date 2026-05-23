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

  return (
    <div>
      <h1 className="font-display text-3xl text-bone">Your details</h1>
      <p className="mt-2 text-bone/60">We'll confirm your booking by text and email.</p>

      {/* Booking summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-5"
      >
        <p className="text-xs uppercase tracking-ultra text-gold-300/70">Your booking</p>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-bone/50">Service</span>
          <span className="text-bone">{service?.name}</span>
          <span className="text-bone/50">Barber</span>
          <span className="text-bone">{barber?.name || 'Any available'}</span>
          <span className="text-bone/50">Date</span>
          <span className="text-bone">{date ? format(new Date(date), 'EEE, MMM d') : '—'}</span>
          <span className="text-bone/50">Time</span>
          <span className="text-bone">{to12h(time)}</span>
          <span className="text-bone/50">Price</span>
          <span className="text-bone">
            ${service?.price}{' '}
            <span className="text-bone/50 text-xs">(${11} deposit today)</span>
          </span>
        </div>
      </motion.div>

      <div className="mt-8 space-y-5">
        <Field label="Full name" error={errors.name}>
          <input className="input" placeholder="John Smith" value={form.name} onChange={set('name')} />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

      <p className="mt-4 text-xs text-bone/40">
        Your contact info is used only for your booking confirmation and reminders. We don't spam.
      </p>

      <button onClick={next} className="btn-gold mt-6 w-full">
        Continue to deposit →
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-ultra text-bone/50">
        {label}
        {error && <span className="font-normal normal-case tracking-normal text-red-400">{error}</span>}
      </span>
      {children}
    </label>
  )
}
