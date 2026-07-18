import { motion } from 'framer-motion'
import { format } from 'date-fns'
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
    text: `Magic Cuts: ${service.name}`,
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
    `SUMMARY:Magic Cuts: ${service.name}`,
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

  const rows = [
    ['service', `${service?.name} · $${service?.price} total · $11 deposit paid`],
    ['barber', barber?.name || 'Any available'],
    ['date', date ? format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d, yyyy') : ''],
    ['time', `${to12h(time)} · ${service?.duration}`],
    ['where', `${shop.address}, ${shop.addressLine2}`],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
      <span className="block overflow-hidden">
        <motion.h1
          initial={{ y: '105%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(3.5rem,8vw,7rem)] font-bold uppercase leading-[0.9] text-bone"
        >
          You're <span className="gold-text">booked.</span>
        </motion.h1>
      </span>
      <p className="mt-5 text-lg text-bone/60">
        Check your email and phone for confirmation. We'll see you soon,{' '}
        <span className="text-bone">{contact?.name?.split(' ')[0]}.</span>
      </p>

      <div className="mt-10">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 border-t border-white/[0.08] py-3 last:border-b sm:flex-row sm:items-baseline sm:justify-between">
            <span className="font-mono text-xs text-bone/45">{label}</span>
            <span className="text-sm text-bone sm:text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={buildGoogleCalUrl(service, date, time)}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost flex-1 text-sm"
        >
          Add to Google Calendar
        </a>
        <button onClick={() => downloadICS(service, date, time)} className="btn-ghost flex-1 text-sm">
          Apple / iCal
        </button>
      </div>

      <p className="mt-6 font-mono text-sm text-bone/50">
        Need to reschedule? Call{' '}
        <a href={shop.phoneHref} className="text-gold-300 hover:underline">
          {shop.phone}
        </a>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
