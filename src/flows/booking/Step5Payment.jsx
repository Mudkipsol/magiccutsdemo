import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { format } from 'date-fns'
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
      <h1 className="font-display text-5xl font-bold uppercase text-bone">Secure your chair</h1>
      <p className="mt-3 text-bone/60">
        An <span className="font-semibold text-gold-300">$11 deposit</span> reserves your spot and applies to your service price.
      </p>

      {/* Summary — ruled, not boxed */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 border-y border-white/[0.08] py-5"
      >
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-bold uppercase text-bone">{service?.name}</p>
            <p className="mt-1 font-mono text-xs text-bone/55">
              {barber?.name || 'Any barber'} · {date ? format(new Date(date), 'MMM d') : ''} · {to12h(time)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-bold text-gold-300">$11</p>
            <p className="mt-1 font-mono text-xs text-bone/40">due today · ${(service?.price || 0) - 11} at the shop</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        {!hasStripe ? (
          <div className="rounded-[2px] border border-dashed border-yellow-500/30 p-6 text-center">
            <p className="font-mono text-sm text-yellow-300">
              Stripe not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env.local
            </p>
            <button
              onClick={() => setAppointmentId('demo-' + Date.now())}
              className="btn-gold mt-5 text-sm"
            >
              Demo: skip payment
            </button>
          </div>
        ) : fetching ? (
          <p className="py-10 text-center font-mono text-sm text-bone/40">Loading payment…</p>
        ) : (
          <form onSubmit={pay}>
            {clientSecret && (
              <PaymentElement
                options={{ layout: 'tabs' }}
                className="mb-6"
              />
            )}
            <button
              type="submit"
              disabled={loading || !stripe}
              className="btn-gold w-full disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Pay $11 deposit'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center font-mono text-xs text-bone/35">
        Secured by Stripe. Your card data never touches our servers.
      </p>
    </div>
  )
}
