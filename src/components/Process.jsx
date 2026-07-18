import { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import { process } from '../data'

// The sequence is carried by a single gold line that draws itself down the
// ritual as you scroll, the way a razor pulls one continuous edge.
export default function Process() {
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.72', 'end 0.5'],
  })

  return (
    <section id="process" className="relative border-y border-white/10 py-24 sm:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24 lg:items-start">
          {/* Left: heading column */}
          <div className="lg:sticky lg:top-32">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-bone text-balance"
            >
              Same routine.<br />Every visit.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 text-base leading-relaxed text-bone/55"
            >
              Whether it's your first visit or your fortieth, the routine does
              not change. Consistency is what makes the cut repeatable.
            </motion.p>
          </div>

          {/* Right: the ritual, strung on one drawn line */}
          <div ref={listRef} className="relative pl-10">
            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-px bg-white/[0.08]" />
            <motion.span
              aria-hidden="true"
              style={{ scaleY: scrollYProgress }}
              className="absolute inset-y-2 left-0 w-px origin-top bg-gold-300/70"
            />

            {process.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="border-b border-white/[0.07] py-9 last:border-b-0"
              >
                <h3 className="font-display text-2xl text-bone">{p.title}</h3>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-bone/55">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
