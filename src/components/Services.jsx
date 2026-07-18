import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { services } from '../data'

// A real price list: name, dotted leader, price. The leader draws itself in
// as each row enters, the way a steady hand pulls a straight line.
export default function Services() {
  const navigate = useNavigate()

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.9fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(2.8rem,5.5vw,6rem)] font-bold uppercase leading-[0.92] text-bone">
            Every service, done <span className="gold-text">properly.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-bone/60">
            Pricing is honest and up front. Pick your service, book your
            chair, come in ready.
          </p>
          <button onClick={() => navigate('/book')} className="btn-ghost mt-8">
            Book any service
          </button>
        </div>

        <div>
          {services.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => navigate('/book')}
              initial="rest"
              whileInView="drawn"
              viewport={{ once: true, margin: '-60px' }}
              className="group block w-full border-b border-white/[0.07] py-7 text-left first:border-t"
            >
              <span className="flex items-baseline justify-between gap-5">
                <motion.span
                  variants={{
                    rest: { opacity: 0, y: 10 },
                    drawn: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05 } },
                  }}
                  className="font-display text-2xl font-bold uppercase text-bone transition-colors duration-150 group-hover:text-gold-200 sm:text-4xl"
                >
                  {s.name}
                </motion.span>

                {s.note && (
                  <motion.span
                    variants={{
                      rest: { opacity: 0 },
                      drawn: { opacity: 1, transition: { duration: 0.4, delay: 0.3 } },
                    }}
                    className="hidden font-mono text-xs text-gold-300/70 md:inline"
                  >
                    {s.note}
                  </motion.span>
                )}

                <motion.span
                  aria-hidden="true"
                  variants={{
                    rest: { scaleX: 0 },
                    drawn: { scaleX: 1, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="leader hidden origin-left sm:block"
                />

                <motion.span
                  variants={{
                    rest: { opacity: 0 },
                    drawn: { opacity: 1, transition: { duration: 0.4, delay: 0.7 } },
                  }}
                  className="shrink-0 font-display text-2xl font-bold tabular-nums text-gold-300 sm:text-4xl"
                >
                  ${s.price}
                </motion.span>
              </span>

              <span className="mt-2 block max-w-2xl pr-10 text-base leading-relaxed text-bone/50">
                {s.blurb} About {s.duration.replace('min', 'minutes')} in the chair.
              </span>
            </motion.button>
          ))}

          <p className="mt-6 text-sm text-bone/35">
            Prices start from. Final pricing confirmed in the chair based on
            length and detail.
          </p>
        </div>
      </div>
    </section>
  )
}
