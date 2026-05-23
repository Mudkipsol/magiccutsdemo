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
import { ArrowLeft } from 'lucide-react'
import { Sparkle } from '../components/Icons'

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

  const stripeOptions = {
    appearance: {
      theme: 'night',
      variables: { colorPrimary: '#c79a3a', colorBackground: '#16161a', colorText: '#f4efe6', borderRadius: '12px' },
    },
  }

  return (
    <div className="min-h-screen bg-onyx-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="shell flex h-[64px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-bone/60 hover:text-bone">
            <ArrowLeft size={16} /> Back to site
          </Link>
          <span className="flex items-center gap-2 font-display text-lg text-bone">
            <Sparkle className="h-4 w-4 text-gold-300" /> Magic Cuts
          </span>
          <span className="text-sm text-bone/40">Step {step} of 6</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-[3px] bg-onyx-800">
        <div
          className="h-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-500"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="shell mt-6 hidden items-center justify-center gap-0 sm:flex">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={label} className="flex items-center">
              <button
                onClick={() => done && setStep(n)}
                disabled={!done}
                className={`flex flex-col items-center gap-1 px-3 transition-opacity ${done ? 'cursor-pointer' : 'cursor-default'} ${active || done ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-gold-300 text-onyx-950' : done ? 'bg-gold-300/20 text-gold-300' : 'bg-white/10 text-bone/50'}`}>
                  {done ? '✓' : n}
                </span>
                <span className={`text-[0.65rem] uppercase tracking-wide ${active ? 'text-gold-300' : 'text-bone/40'}`}>{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`mx-1 h-px w-8 ${done ? 'bg-gold-300/40' : 'bg-white/10'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <main className="shell max-w-3xl pb-24 pt-10">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {STEP_LABELS[step - 1]} — step {step} of 6
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
