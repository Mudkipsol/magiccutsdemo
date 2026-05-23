import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { format } from 'date-fns'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useBookingStore } from '../../store/bookingStore'
import { hasStripe } from '../../lib/stripe'
import toast from 'react-hot-toast'

function to12h(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function Step5Payment() {
  const stripe = useStripe()
  const elements = useElements()
  const { service, barber, date, time, contact, setPaymentIntent, setAppointmentId } = useBookingStore()
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Create a PaymentIntent when the component mounts
  useEffect(() => {
    if (!hasStripe) { setFetching(false); return }
    fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1100, // $11 in cents
        metadata: {
          service: service?.name,
          barber: barber?.name || 'any',
          date,
          time,
          customer_name: contact?.name,
          customer_email: contact?.email,
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => { setClientSecret(d.clientSecret); setFetching(false) })
      .catch(() => { setFetching(false) })
  }, [])

  const pay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      setPaymentIntent(paymentIntent.id)
      // Create appointment record
      try {
        const res = await fetch('/.netlify/functions/create-appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barber_id: barber?.id,
            service_name: service?.name,
            service_price: service?.price,
            customer_name: contact?.name,
            customer_email: contact?.email,
            customer_phone: contact?.phone,
            appointment_date: date,
            appointment_time: time,
            notes: contact?.notes,
            stripe_payment_intent_id: paymentIntent.id,
          }),
        })
        const { appointmentId } = await res.json()
        setAppointmentId(appointmentId)
      } catch {
        setAppointmentId('demo-' + Date.now())
      }
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-bone">Secure your chair</h1>
      <p className="mt-2 text-bone/60">
        A <span className="text-gold-300 font-semibold">$11 deposit</span> reserves your spot and applies to your service price.
      </p>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-white/10 bg-onyx-900 p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-bone">{service?.name}</p>
            <p className="text-sm text-bone/55">
              {barber?.name || 'Any barber'} · {date ? format(new Date(date), 'MMM d') : ''} · {to12h(time)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-bone/40">Due today</p>
            <p className="font-display text-2xl text-gold-300">$11</p>
            <p className="text-xs text-bone/40">Balance ${(service?.price || 0) - 11} at the shop</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-7">
        {!hasStripe ? (
          <div className="rounded-2xl border border-dashed border-yellow-500/30 bg-yellow-500/5 p-6 text-center">
            <p className="text-sm text-yellow-300">
              Stripe not configured. Add <code className="rounded bg-white/10 px-1">VITE_STRIPE_PUBLISHABLE_KEY</code> to .env.local
            </p>
            <button
              onClick={() => setAppointmentId('demo-' + Date.now())}
              className="btn-gold mt-4 text-xs"
            >
              Demo: Skip payment →
            </button>
          </div>
        ) : fetching ? (
          <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gold-300" /></div>
        ) : (
          <form onSubmit={pay}>
            {clientSecret && (
              <PaymentElement
                options={{ layout: 'tabs' }}
                className="mb-5"
              />
            )}
            <button
              type="submit"
              disabled={loading || !stripe}
              className="btn-gold w-full"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <><Lock size={15} /> Pay $11 deposit</>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-bone/35">
        <ShieldCheck size={14} />
        Secured by Stripe. Your card data never touches our servers.
      </div>
    </div>
  )
}
