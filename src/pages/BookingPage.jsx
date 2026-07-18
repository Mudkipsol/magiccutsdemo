import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../lib/stripe'
import { useBookingStore } from '../store/bookingStore'
import { barbers } from '../data'
import Step1Service from '../flows/booking/Step1Service'
import Step2Barber from '../flows/booking/Step2Barber'
import Step3Calendar from '../flows/booking/Step3Calendar'
import Step4Contact from '../flows/booking/Step4Contact'
import Step5Payment from '../flows/booking/Step5Payment'
import Step6Confirm from '../flows/booking/Step6Confirm'

const STEP_LABELS = ['Service', 'Barber', 'Date & Time', 'Your Info', 'Deposit', 'Confirmed']

export default function BookingPage() {
  const [params] = useSearchParams()
  const { step, setStep, setBarber, reset } = useBookingStore()

  // pre-select barber if coming from team section
  useEffect(() => {
    const bid = params.get('barber')
    if (bid) {
      const found = barbers.find((b) => b.id === bid)
      if (found) { reset(); setBarber(found) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the browser back gesture inside the wizard: mid-flow, "back" steps
  // backward instead of abandoning the page (and any in-progress payment).
  useEffect(() => {
    if (step <= 1 || step >= 6) return
    window.history.pushState({ wizardStep: step }, '')
    const onPop = () => setStep(step - 1)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [step, setStep])

  const stripeOptions = {
    appearance: {
      theme: 'night',
      variables: { colorPrimary: '#c79a3a', colorBackground: '#16161a', colorText: '#f4efe6', borderRadius: '2px' },
    },
  }

  return (
    <div className="min-h-screen bg-onyx-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="shell flex h-16 items-center justify-between">
          <Link to="/" className="font-mono text-sm text-bone/60 transition-colors hover:text-bone">
            ← Back to site
          </Link>
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="pole h-6 w-2 rounded-full" />
            <span className="font-display text-xl font-bold uppercase text-bone">Magic Cuts</span>
          </span>
          <span className="font-mono text-xs text-bone/40">Step {step} of 6</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-[2px] bg-onyx-800">
        <div
          className="h-full bg-gold-400 transition-all duration-500"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
      </div>

      {/* Step labels — a flat ruled line of type, no circles */}
      <div className="border-b border-white/[0.07]">
        <div className="shell hidden h-12 items-center gap-8 sm:flex">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <button
                key={label}
                onClick={() => done && setStep(n)}
                disabled={!done}
                className={`relative h-full font-display text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
                  active ? 'text-bone' : done ? 'cursor-pointer text-gold-300/80 hover:text-gold-200' : 'cursor-default text-bone/25'
                }`}
              >
                {label}
                {active && <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-gold-400" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <main className="shell max-w-4xl pb-24 pt-12">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {STEP_LABELS[step - 1]}, step {step} of 6
        </div>
        <Elements stripe={stripePromise} options={stripeOptions}>
          {step === 1 && <Step1Service />}
          {step === 2 && <Step2Barber />}
          {step === 3 && <Step3Calendar />}
          {step === 4 && <Step4Contact />}
          {step === 5 && <Step5Payment />}
          {step === 6 && <Step6Confirm />}
        </Elements>
      </main>
    </div>
  )
}
