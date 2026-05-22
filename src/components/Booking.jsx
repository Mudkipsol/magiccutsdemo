import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Phone, Clock, MapPin, Loader2 } from 'lucide-react'
import { services, shop } from '../data'
import Reveal from './Reveal'

const times = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
]

// Optional: set VITE_BOOKING_ENDPOINT to POST submissions to your own API.
const ENDPOINT = import.meta.env.VITE_BOOKING_ENDPOINT

const empty = { service: services[0].name, date: '', time: '', name: '', phone: '', email: '', notes: '' }

export default function Booking() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Tell us your name'
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10)
      e.phone = 'A reachable phone number'
    if (!form.date) e.date = 'Pick a day'
    if (!form.time) e.time = 'Pick a time'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setStatus('sending')

    const payload = { ...form, shop: shop.full, submittedAt: new Date().toISOString() }

    try {
      if (ENDPOINT) {
        await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // No backend configured — hand off to the shop's inbox.
        const body = encodeURIComponent(
          `New chair request\n\nService: ${form.service}\nDate: ${form.date}\nTime: ${form.time}\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nNotes: ${form.notes}`
        )
        const subject = encodeURIComponent(`Chair request — ${form.name}`)
        window.open(`mailto:${shop.email}?subject=${subject}&body=${body}`, '_blank')
        await new Promise((r) => setTimeout(r, 700))
      }
      setStatus('done')
    } catch {
      setStatus('done') // mailto fallback already opened
    }
  }

  const reset = () => {
    setForm(empty)
    setStatus('idle')
  }

  return (
    <section id="book" className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 60% at 100% 0%, rgba(199,154,58,0.12), transparent 55%)',
        }}
      />
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: pitch + details */}
        <div>
          <Reveal>
            <p className="eyebrow">
              <span className="h-px w-8 bg-gold-300/60" />
              Reserve a Chair
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-bone text-balance">
              Tell us when. <span className="gold-text italic">We’ll be ready.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-bone/60">
              Send a request and we’ll confirm by text or call — usually within the
              hour during shop hours. Prefer to walk in? You’re always welcome.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-9 space-y-4">
              {[
                { icon: Phone, label: 'Call the shop', value: shop.phone, href: shop.phoneHref },
                { icon: MapPin, label: 'Find us', value: `${shop.address}, ${shop.addressLine2}`, href: shop.mapHref },
                { icon: Clock, label: 'Today', value: 'Open 10:00 AM – 7:00 PM' },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-gold-300">
                    <row.icon size={18} />
                  </span>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-ultra text-bone/40">{row.label}</p>
                    {row.href ? (
                      <a href={row.href} className="text-bone hover:text-gold-300">{row.value}</a>
                    ) : (
                      <p className="text-bone">{row.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Right: the form */}
        <Reveal delay={0.1}>
          <div className="card relative overflow-hidden p-7 sm:p-9 shadow-lift">
            <AnimatePresence mode="wait">
              {status === 'done' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-300/40 bg-gold-300/10 text-gold-300">
                    <Check size={30} />
                  </span>
                  <h3 className="mt-6 font-display text-3xl text-bone">Request sent.</h3>
                  <p className="mt-3 max-w-sm text-bone/60">
                    Thanks, {form.name.split(' ')[0] || 'friend'}. We’ll confirm your{' '}
                    {form.service.toLowerCase()} on {form.date || 'your chosen day'} shortly.
                    For anything urgent, call {shop.phone}.
                  </p>
                  <button onClick={reset} className="btn-ghost mt-8">
                    Book another chair
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  noValidate
                >
                  {/* Service chips */}
                  <Field label="Service">
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => {
                        const active = form.service === s.name
                        return (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => setForm((f) => ({ ...f, service: s.name }))}
                            className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                              active
                                ? 'border-gold-300 bg-gold-300/15 text-gold-100'
                                : 'border-white/10 text-bone/60 hover:border-white/25 hover:text-bone'
                            }`}
                          >
                            {s.name}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Preferred date" error={errors.date}>
                      <input
                        type="date"
                        value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={set('date')}
                        className="input"
                      />
                    </Field>
                    <Field label="Preferred time" error={errors.time}>
                      <select value={form.time} onChange={set('time')} className="input">
                        <option value="">Select a time</option>
                        {times.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Your name"
                        className="input"
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="(614) 000-0000"
                        className="input"
                      />
                    </Field>
                  </div>

                  <Field label="Email (optional)">
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@email.com"
                      className="input"
                    />
                  </Field>

                  <Field label="Anything we should know? (optional)">
                    <textarea
                      value={form.notes}
                      onChange={set('notes')}
                      rows={3}
                      placeholder="Barber preference, style references, first visit…"
                      className="input resize-none"
                    />
                  </Field>

                  <button type="submit" disabled={status === 'sending'} className="btn-gold w-full">
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      'Request My Chair'
                    )}
                  </button>
                  <p className="text-center text-xs text-bone/40">
                    No deposit required. We confirm every request personally.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-ultra text-bone/50">
        {label}
        {error && <span className="font-medium normal-case tracking-normal text-red-400">{error}</span>}
      </span>
      {children}
    </label>
  )
}
