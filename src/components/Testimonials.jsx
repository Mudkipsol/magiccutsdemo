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
          <h2 className="font-display text-[clamp(2.8rem,5.5vw,6rem)] font-bold uppercase leading-[0.92] text-bone">
            Dublin keeps <span className="gold-text">coming back.</span>
          </h2>
          <a
            href={shop.instagram}
            target="_blank"
            rel="noreferrer"
            className="text-link shrink-0 font-mono text-sm"
          >
            {shop.instagramHandle} →
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr] lg:gap-24">
          <div className="min-h-[14rem]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="text-[clamp(1.4rem,2.6vw,2.3rem)] font-medium leading-snug text-bone/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-7 font-mono text-sm text-bone/50">
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

          <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 border-t border-white/[0.07] pt-6 lg:flex-col lg:gap-y-3 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {testimonials.map((item, i) => (
              <button
                key={item.name}
                onClick={() => select(i)}
                className={`relative w-fit pb-1 text-left font-display text-2xl font-bold uppercase transition-all duration-200 lg:text-3xl ${
                  active === i ? 'translate-x-2 text-bone lg:translate-x-3' : 'text-bone/30 hover:text-bone/60'
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
      </div>
    </section>
  )
}
