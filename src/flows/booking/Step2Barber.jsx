import { motion } from 'framer-motion'
import { barbers } from '../../data'
import { useBookingStore } from '../../store/bookingStore'

export default function Step2Barber() {
  const { setBarber, setStep, service } = useBookingStore()
  const selected = useBookingStore((s) => s.barber)

  return (
    <div>
      <h1 className="font-display text-3xl text-bone">Pick your barber</h1>
      <p className="mt-2 text-bone/60">
        Your <span className="text-gold-300">{service?.name}</span> — now choose who's behind the chair.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {barbers.map((b, i) => {
          const active = selected?.id === b.id
          return (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setBarber(b)}
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                active ? 'border-gold-300 ring-1 ring-gold-300/30' : 'border-white/10 hover:border-gold-300/40'
              }`}
            >
              {/* photo */}
              <div className="relative aspect-[4/5] w-full bg-onyx-800">
                <img src={b.photo} alt={b.name} className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/40 to-transparent" />
                {active && (
                  <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gold-300 text-onyx-950">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="eyebrow text-[0.55rem]">{b.title}</p>
                <p className="mt-1 font-display text-xl text-bone">{b.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.specialties.slice(0, 2).map((sp) => (
                    <span key={sp} className="rounded-full border border-white/10 px-2 py-0.5 text-[0.58rem] text-bone/50">{sp}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setStep(3)}
          className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-bone/40 transition-colors hover:border-white/25 hover:text-bone/60"
        >
          No preference — surprise me
        </button>
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <button onClick={() => setBarber(selected)} className="btn-gold w-full">
            Continue with {selected.name.split(' ')[0]} →
          </button>
        </motion.div>
      )}
    </div>
  )
}
