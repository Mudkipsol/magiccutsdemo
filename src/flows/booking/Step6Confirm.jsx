import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Check, Calendar, Clock, Scissors, MapPin, CalendarPlus, Phone } from 'lucide-react'
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

function buildGoogleCalUrl(service, date, time) {
  if (!service || !date || !time) return '#'
  const [year, month, day] = date.split('-').map(Number)
  const [h, m] = time.split(':').map(Number)
  const durationMin = parseInt(service.duration) || 45
  const start = new Date(year, month - 1, day, h, m)
  const end = new Date(start.getTime() + durationMin * 60000)
  const fmt = (d) => d.toISOString().replace(/[^0-9TZ]/g, '').slice(0, 15)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Magic Cuts — ${service.name}`,
    dates: `${fmt(start)}Z/${fmt(end)}Z`,
    details: `${service.name} at Magic Cuts Salon. Deposit paid: $11. Need to reschedule? Call (614) 376-0074.`,
    location: '2779 Martin Rd, Dublin, OH 43017',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function downloadICS(service, date, time) {
  if (!service || !date || !time) return
  const [year, month, day] = date.split('-').map(Number)
  const [h, m] = time.split(':').map(Number)
  const durationMin = parseInt(service.duration) || 45
  const start = new Date(year, month - 1, day, h, m)
  const end = new Date(start.getTime() + durationMin * 60000)
  const fmt = (d) => d.toISOString().replace(/[^0-9TZ]/g, '').slice(0, 15) + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Magic Cuts Salon//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@magicutsalon.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Magic Cuts — ${service.name}`,
    `DESCRIPTION:${service.name} at Magic Cuts Salon.\\nDeposit paid: $11.\\nNeed to reschedule? Call (614) 376-0074.`,
    'LOCATION:2779 Martin Rd\\, Dublin\\, OH 43017',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'magic-cuts-appointment.ics'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Step6Confirm() {
  const { service, barber, date, time, contact, reset } = useBookingStore()

  useEffect(() => {
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
            { icon: Calendar, label: date ? format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d, yyyy') : '' },
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

      {/* Add to calendar */}
      <div className="mt-5 flex gap-2">
        <a
          href={buildGoogleCalUrl(service, date, time)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-bone/70 transition-colors hover:border-gold-300/30 hover:text-bone"
        >
          <CalendarPlus size={15} className="text-gold-300" />
          Google Calendar
        </a>
        <button
          onClick={() => downloadICS(service, date, time)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-bone/70 transition-colors hover:border-gold-300/30 hover:text-bone"
        >
          <CalendarPlus size={15} className="text-gold-300" />
          Apple / iCal
        </button>
      </div>

      <p className="mt-5 text-sm text-bone/50">
        Need to reschedule?{' '}
        <a href={shop.phoneHref} className="text-gold-300 hover:underline">
          <Phone size={12} className="inline mb-0.5" /> {shop.phone}
        </a>
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
