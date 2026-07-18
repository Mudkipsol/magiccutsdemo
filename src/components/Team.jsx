import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { barbers } from '../data'

const wipe = {
  enter: { clipPath: 'inset(0 100% 0 0)', scale: 1.04 },
  center: {
    clipPath: 'inset(0 0% 0 0)',
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

function specialtiesSentence(b) {
  const list = b.specialties.map((s) => s.toLowerCase()).join(', ')
  return `Ask for ${list}.`
}

export default function Team() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const barber = barbers[active]

  return (
    <section id="team" className="relative py-24 sm:py-32">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(199,154,58,0.3), transparent)' }}
      />

      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone text-balance">
              Your chair, your <span className="gold-text italic">barber.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-bone/60">
              Pick who you want before you walk in. Every barber here has a
              specialty and a chair with your name on it.
            </p>
          </div>
          <button onClick={() => navigate('/book')} className="btn-gold shrink-0">
            Book Your Barber
          </button>
        </div>

        {/* Desktop roster: names select, portrait answers */}
        <div className="mt-16 hidden gap-16 lg:grid lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center">
            {barbers.map((b, i) => (
              <button
                key={b.id}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => navigate(`/book?barber=${b.id}`)}
                className="group relative border-b border-white/[0.07] py-6 text-left"
              >
                <motion.span
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline justify-between"
                >
                  <span
                    className={`font-display text-[clamp(2.2rem,3.5vw,3.4rem)] leading-none transition-colors duration-200 ${
                      active === i ? 'italic text-bone' : 'text-bone/30 group-hover:text-bone/60'
                    }`}
                  >
                    {b.name}
                  </span>
                  <span
                    className={`font-display text-sm italic transition-colors duration-200 ${
                      active === i ? 'text-gold-300' : 'text-bone/25'
                    }`}
                  >
                    {b.title.toLowerCase()}
                  </span>
                </motion.span>
                {active === i && (
                  <motion.span
                    layoutId="roster-line"
                    className="absolute bottom-[-1px] left-0 h-px w-full bg-gold-300/70"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}

            <div className="relative mt-10 min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={barber.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="max-w-md text-base leading-relaxed text-bone/60">
                    {barber.bio} {specialtiesSentence(barber)}
                  </p>
                  <button
                    onClick={() => navigate(`/book?barber=${barber.id}`)}
                    className="text-link mt-4 text-sm text-gold-300"
                  >
                    Book with {barber.name} →
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-onyx-900"
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={barber.id}
                src={barber.photo}
                alt={barber.name}
                variants={wipe}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-onyx-950/70 to-transparent" />
          </motion.div>
        </div>

        {/* Mobile roster: portraits stacked, no hover dependency */}
        <div className="mt-12 flex flex-col gap-12 lg:hidden">
          {barbers.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="overflow-hidden rounded-2xl bg-onyx-900">
                <img
                  src={b.photo}
                  alt={b.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              </div>
              <p className="mt-5 font-display text-3xl text-bone">
                {b.name}
                <em className="ml-3 text-sm font-normal text-gold-300">{b.title.toLowerCase()}</em>
              </p>
              <p className="mt-2 text-base leading-relaxed text-bone/60">
                {b.bio} {specialtiesSentence(b)}
              </p>
              <button
                onClick={() => navigate(`/book?barber=${b.id}`)}
                className="text-link mt-3 text-sm text-gold-300"
              >
                Book with {b.name} →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
