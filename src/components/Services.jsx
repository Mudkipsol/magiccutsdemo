import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { services } from '../data'

// A real price list: name, dotted leader, price. The leader draws itself in
// as each row enters, the way a steady hand pulls a straight line.
export default function Services() {
  const navigate = useNavigate()

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone text-balance">
              Every service, done <span className="gold-text italic">properly.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-bone/60">
              Pricing is honest and up front. Pick your service, book your
              chair, come in ready.
            </p>
          </div>
          <button onClick={() => navigate('/book')} className="text-link shrink-0 text-sm">
            Book any service →
          </button>
        </div>

        <div className="mt-14 mx-auto max-w-3xl">
          {services.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => navigate('/book')}
              initial="rest"
              whileInView="drawn"
              whileHover="hover"
              viewport={{ once: true, margin: '-60px' }}
              className="group block w-full border-b border-white/[0.07] py-6 text-left"
            >
              <span className="flex items-baseline gap-4">
                <motion.span
                  variants={{
                    rest: { opacity: 0, y: 10 },
                    drawn: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05 } },
                  }}
                  className="font-display text-xl text-bone transition-colors duration-150 group-hover:text-gold-200 sm:text-2xl"
                >
                  {s.name}
                  {s.note && (
                    <em className="ml-3 hidden font-display text-sm font-normal text-gold-300/70 sm:inline">
                      {s.note}
                    </em>
                  )}
                </motion.span>

                <motion.span
                  aria-hidden="true"
                  variants={{
                    rest: { scaleX: 0 },
                    drawn: { scaleX: 1, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="leader origin-left"
                />

                <motion.span
                  variants={{
                    rest: { opacity: 0 },
                    drawn: { opacity: 1, transition: { duration: 0.4, delay: 0.75 } },
                  }}
                  className="shrink-0 font-display text-2xl tabular-nums text-gold-300"
                >
                  ${s.price}
                </motion.span>
              </span>

              <span className="mt-1.5 block max-w-xl pr-10 text-sm leading-relaxed text-bone/50">
                {s.blurb} About {s.duration.replace('min', 'minutes')} in the chair.
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-sm text-bone/35">
          Prices start from. Final pricing confirmed in the chair based on
          length and detail.
        </p>
      </div>
    </section>
  )
}
