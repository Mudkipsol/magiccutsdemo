import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Check, Calendar, Clock, Scissors, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBookingStore } from '../../store/bookingStore'
import { shop } from '../../data'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

function to12h(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function Step6Confirm() {
  const { service, barber, date, time, contact, reset } = useBookingStore()

  useEffect(() => {
    // Gold confetti burst
    const end = Date.now() + 2000
    const fire = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#c79a3a', '#f3e6c2', '#9c6f20'] })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#c79a3a', '#f3e6c2', '#9c6f20'] })
      if (Date.now() < end) requestAnimationFrame(fire)
    }
    fire()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-lg text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold-300/40 bg-gold-300/10"
      >
        <Check size={36} className="text-gold-300" />
      </motion.div>

      <h1 className="font-display text-4xl text-bone">You're booked.</h1>
      <p className="mt-3 text-bone/60">
        Check your email and phone for confirmation. We'll see you soon,{' '}
        <span className="text-bone">{contact?.name?.split(' ')[0]}.</span>
      </p>

      <div className="mt-8 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-6 text-left">
        <p className="eyebrow text-[0.6rem] justify-center flex">Appointment Details</p>
        <div className="mt-4 space-y-3">
          {[
            { icon: Scissors, label: service?.name, sub: `$${service?.price} total · $11 deposit paid` },
            { icon: Calendar, label: date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '' },
            { icon: Clock, label: to12h(time), sub: service?.duration },
            { icon: MapPin, label: shop.address, sub: shop.addressLine2 },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gold-300">
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm text-bone">{label}</p>
                {sub && <p className="text-xs text-bone/50">{sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-bone/50">
        Need to reschedule? Call us at{' '}
        <a href={shop.phoneHref} className="text-gold-300 hover:underline">{shop.phone}</a>
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/" onClick={reset} className="btn-ghost flex-1">
          Back to home
        </Link>
        <button onClick={reset} className="btn-gold flex-1">
          Book another appointment
        </button>
      </div>
    </motion.div>
  )
}
