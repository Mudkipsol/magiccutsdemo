import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { testimonials, shop } from '../data'

// One voice at a time, set large. A stack of four identical quote cards says
// "template" louder than any of the quotes say "good barber".
export default function Testimonials() {
  const [active, setActive] = useState(0)
  const timer = useRef(null)
  const t = testimonials[active]

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((v) => (v + 1) % testimonials.length)
    }, 7000)
    return () => clearInterval(timer.current)
  }, [])

  const select = (i) => {
    clearInterval(timer.current)
    setActive(i)
  }

  return (
    <section className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone text-balance">
            Dublin keeps coming <span className="gold-text italic">back.</span>
          </h2>
          <a
            href={shop.instagram}
            target="_blank"
            rel="noreferrer"
            className="text-link shrink-0 text-sm"
          >
            See more on Instagram →
          </a>
        </div>

        <div className="mt-14 min-h-[16rem] sm:min-h-[14rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              <blockquote className="font-display text-[clamp(1.5rem,3.2vw,2.4rem)] italic leading-snug text-bone/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 text-base text-bone/55">
                {t.name}, in for a {t.detail.toLowerCase()}, reviewed on{' '}
                <a
                  href={shop.googleReviews}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Google
                </a>
                .
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[0.07] pt-6">
          {testimonials.map((item, i) => (
            <button
              key={item.name}
              onClick={() => select(i)}
              className={`relative pb-1 font-display text-lg transition-colors duration-200 ${
                active === i ? 'italic text-bone' : 'text-bone/35 hover:text-bone/70'
              }`}
            >
              {item.name}
              {active === i && (
                <motion.span
                  layoutId="quote-line"
                  className="absolute bottom-0 left-0 h-px w-full bg-gold-300/70"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
