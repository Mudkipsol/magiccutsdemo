import { motion } from 'framer-motion'
import { services } from '../../data'
import { useBookingStore } from '../../store/bookingStore'

export default function Step1Service() {
  const setService = useBookingStore((s) => s.setService)

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase text-bone">Choose your service</h1>
      <p className="mt-3 text-bone/60">Pick one. You'll choose your barber next.</p>

      <div className="mt-10">
        {services.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            onClick={() => setService(s)}
            className="group block w-full border-b border-white/[0.08] py-5 text-left transition-colors first:border-t hover:bg-onyx-900/50"
          >
            <span className="flex items-baseline gap-4">
              <span className="font-display text-2xl font-bold uppercase text-bone transition-colors duration-150 group-hover:text-gold-200 sm:text-3xl">
                {s.name}
              </span>
              {s.tag && (
                <span className="hidden font-mono text-xs text-gold-300/70 sm:inline">
                  {s.tag.toLowerCase()}
                </span>
              )}
              <span aria-hidden="true" className="leader" />
              <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-gold-300 sm:text-3xl">
                ${s.price}
              </span>
            </span>
            <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-bone/50">
              {s.blurb} About {s.duration.replace('min', 'minutes')} in the chair.
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
