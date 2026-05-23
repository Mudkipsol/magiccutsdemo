import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, Clock, Scissors, MapPin, Phone, Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { shop, barbers } from '../data'

function to12h(t) {
  if (!t) return ''
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const STATUS_LABEL = {
  confirmed: { text: 'Confirmed', color: 'text-green-400', icon: CheckCircle },
  pending: { text: 'Pending', color: 'text-gold-300', icon: Clock },
  completed: { text: 'Completed', color: 'text-bone/50', icon: CheckCircle },
  cancelled: { text: 'Cancelled', color: 'text-red-400', icon: XCircle },
  no_show: { text: 'Missed', color: 'text-amber-400', icon: XCircle },
}

export default function ManageBookingPage() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const [appt, setAppt] = useState(null)
  const [state, setState] = useState('loading') // loading | found | error

  useEffect(() => {
    if (!id) { setState('error'); return }
    fetch(`/api/get-appointment?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setAppt(d); setState('found') })
      .catch(() => setState('error'))
  }, [id])

  const barber = appt?.barber_id ? barbers.find((b) => b.id === appt.barber_id) : null
  const status = appt ? STATUS_LABEL[appt.status] || STATUS_LABEL.confirmed : null

  return (
    <div className="min-h-screen bg-onyx-950 px-6 py-20">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-10 flex items-center gap-2 text-sm text-bone/40 hover:text-bone">
          <ArrowLeft size={15} /> Magic Cuts
        </Link>

        {state === 'loading' && (
          <p className="text-center text-bone/40 py-20">Loading your booking…</p>
        )}

        {state === 'error' && (
          <div className="text-center">
            <h1 className="font-display text-2xl text-bone">Booking not found</h1>
            <p className="mt-2 text-sm text-bone/50">
              This link may be invalid or expired. Reach us and we'll sort it out.
            </p>
            <a href={shop.phoneHref} className="btn-gold mt-6 inline-flex">
              <Phone size={15} /> {shop.phone}
            </a>
          </div>
        )}

        {state === 'found' && appt && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="eyebrow"><span className="h-px w-8 bg-gold-300/60" /> Your Booking</p>
            <h1 className="mt-4 font-display text-3xl text-bone">Appointment details</h1>

            <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${status.color}`}>
              <status.icon size={16} /> {status.text}
            </div>

            <div className="mt-8 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-6">
              <div className="space-y-3">
                {[
                  { icon: Scissors, label: appt.service_name, sub: `$${appt.service_price} total · $11 deposit paid` },
                  { icon: Calendar, label: format(new Date(appt.appointment_date + 'T12:00:00'), 'EEEE, MMMM d, yyyy') },
                  { icon: Clock, label: to12h(appt.appointment_time) },
                  ...(barber ? [{ icon: Scissors, label: `with ${barber.name}`, sub: barber.title }] : []),
                  { icon: MapPin, label: shop.address, sub: shop.addressLine2 },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div key={i} className="flex items-start gap-3">
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

            {appt.status !== 'cancelled' && appt.status !== 'no_show' && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-onyx-900 p-5">
                <p className="text-sm text-bone/70">Need to reschedule or cancel?</p>
                <p className="mt-1 text-xs text-bone/40">
                  Give us a call or drop an email and we'll take care of it.
                </p>
                <div className="mt-4 flex gap-3">
                  <a href={shop.phoneHref} className="btn-gold flex-1 text-sm">
                    <Phone size={14} /> Call
                  </a>
                  <a href={`mailto:${shop.email}?subject=Reschedule%20booking%20${appt.id}`} className="btn-ghost flex-1 text-sm">
                    <Mail size={14} /> Email
                  </a>
                </div>
              </div>
            )}

            <Link to="/book" className="mt-6 block text-center text-sm text-bone/40 hover:text-gold-300">
              Book another appointment →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
