import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Scissors } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'mc_popup_dismissed'

export default function EmailSmsPopup() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', phone: '' })
  const [optEmail, setOptEmail] = useState(true)
  const [optSms, setOptSms] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [errors, setErrors] = useState({})
  const dialogRef = useRef(null)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return
    const t = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }, [])

  // Focus trap
  useEffect(() => {
    if (!show) return
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const trap = (e) => {
      if (e.key === 'Escape') { dismiss(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', trap)
    setTimeout(() => first.focus(), 50)
    return () => document.removeEventListener('keydown', trap)
  }, [show, dismiss])

  const validate = () => {
    const e = {}
    if (!form.email && !form.phone) e.all = 'Enter an email or phone number'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit number'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      if (supabase) {
        await supabase.from('marketing_contacts').upsert(
          { email: form.email || null, phone: form.phone || null, opted_in_email: optEmail && !!form.email, opted_in_sms: optSms && !!form.phone, source: 'popup' },
          { onConflict: 'email' }
        )
      } else {
        await fetch('/api/subscribe-marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, phone: form.phone, optEmail, optSms }),
        })
      }
    } catch {/* fire and forget */}
    setStatus('done')
    setTimeout(dismiss, 2500)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-[81] mx-auto max-w-md sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            ref={dialogRef}
          >
            <div className="relative rounded-t-3xl sm:rounded-3xl border border-white/10 bg-onyx-900 p-7 shadow-lift">
              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-bone/50 hover:text-bone"
              >
                <X size={15} />
              </button>

              {status === 'done' ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-300/15 text-gold-300">
                    <Check size={22} />
                  </span>
                  <p id="popup-title" className="font-display text-xl text-bone">You're on the list.</p>
                  <p className="text-sm text-bone/60">Deals, new products, and exclusive drops — straight to you.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-300/30 text-gold-300">
                      <Scissors className="h-5 w-5" />
                    </span>
                    <div>
                      <p id="popup-title" className="font-display text-lg text-bone">Stay in the know.</p>
                      <p className="text-xs text-bone/50">Deals, product drops, and member perks.</p>
                    </div>
                  </div>

                  <form onSubmit={submit} className="mt-5 space-y-3">
                    {errors.all && <p className="text-xs text-red-400" role="alert">{errors.all}</p>}
                    <div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="input text-sm"
                        aria-label="Email address"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone (for SMS deals)"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="input text-sm"
                        aria-label="Phone number"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-400" role="alert">{errors.phone}</p>}
                    </div>
                    <div className="flex gap-4">
                      <Checkbox checked={optEmail} onChange={setOptEmail} label="Email updates" />
                      <Checkbox checked={optSms} onChange={setOptSms} label="SMS deals" />
                    </div>
                    <button type="submit" className="btn-gold w-full text-sm">
                      {status === 'sending' ? 'Saving…' : 'Get the perks'}
                    </button>
                    <p className="text-center text-xs text-bone/30">
                      No spam. <a href="/unsubscribe" className="hover:text-bone/60">Unsubscribe</a> anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-bone/60">
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
        className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${checked ? 'border-gold-300 bg-gold-300 text-onyx-950' : 'border-white/20'}`}
      >
        {checked && <Check size={10} />}
      </span>
      {label}
    </label>
  )
}
