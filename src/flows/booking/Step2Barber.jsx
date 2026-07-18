import { motion } from 'framer-motion'
import { barbers } from '../../data'
import { useBookingStore } from '../../store/bookingStore'

export default function Step2Barber() {
  const { setBarber, setNoBarber, service } = useBookingStore()

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase text-bone">Pick your barber</h1>
      <p className="mt-3 text-bone/60">
        Your <span className="text-gold-300">{service?.name}</span>. Now choose who's behind the chair.
      </p>

      <div className="mt-10">
        {barbers.map((b, i) => (
          <motion.button
            key={b.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            onClick={() => setBarber(b)}
            className="group flex w-full items-center gap-6 border-b border-white/[0.08] py-5 text-left transition-colors first:border-t hover:bg-onyx-900/50"
          >
            <span className="h-24 w-20 shrink-0 overflow-hidden rounded-[2px] bg-onyx-800">
              <img
                src={b.photo}
                alt={b.name}
                loading="lazy"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-4">
                <span className="font-display text-3xl font-bold uppercase text-bone transition-colors duration-150 group-hover:text-gold-200">
                  {b.name}
                </span>
                <span className="font-mono text-xs text-gold-300/70">{b.title.toLowerCase()}</span>
              </span>
              <span className="mt-1 block max-w-xl text-sm leading-relaxed text-bone/50">
                {b.bio}
              </span>
            </span>
            <span aria-hidden="true" className="hidden shrink-0 font-display text-2xl text-bone/25 transition-all duration-150 group-hover:translate-x-1 group-hover:text-gold-300 sm:block">
              →
            </span>
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => setNoBarber()}
        className="mt-8 w-full border border-white/15 py-4 font-display text-base font-bold uppercase tracking-[0.1em] text-bone/50 transition-colors hover:border-gold-300/50 hover:text-bone rounded-[2px]"
      >
        No preference, surprise me
      </button>
    </div>
  )
}
