import { motion } from 'framer-motion'
import { services } from '../../data'
import { useBookingStore } from '../../store/bookingStore'
import { serviceIcon } from '../../components/Icons'

export default function Step1Service() {
  const setService = useBookingStore((s) => s.setService)
  const selected = useBookingStore((s) => s.service)

  return (
    <div>
      <h1 className="font-display text-3xl text-bone">Choose your service</h1>
      <p className="mt-2 text-bone/60">Pick one — you'll choose your barber next.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s, i) => {
          const Icon = serviceIcon[s.id]
          const active = selected?.id === s.id
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setService(s)}
              className={`group relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                active
                  ? 'border-gold-300 bg-gold-300/10 shadow-gold'
                  : 'border-white/10 bg-onyx-900/60 hover:border-gold-300/40 hover:bg-onyx-850'
              }`}
            >
              {s.tag && (
                <span className="absolute right-4 top-4 rounded-full border border-gold-300/30 bg-gold-300/10 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-widest text-gold-200">
                  {s.tag}
                </span>
              )}
              <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? 'border-gold-300/50 bg-gold-300/15 text-gold-200' : 'border-white/10 text-gold-300/70 group-hover:border-gold-300/30'}`}>
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-bone">{s.name}</p>
                <p className="mt-0.5 text-sm text-bone/55">{s.blurb}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-display text-xl text-gold-300">${s.price}</span>
                  <span className="text-xs text-bone/40">{s.duration}</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
