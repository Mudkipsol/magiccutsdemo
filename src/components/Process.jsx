import { motion } from 'framer-motion'
import { process } from '../data'
import Reveal from './Reveal'

export default function Process() {
  return (
    <section id="process" className="relative border-y border-white/10 py-24 sm:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24 lg:items-start">
          {/* Left: heading column */}
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow">
                <span className="h-px w-8 bg-gold-300/60" />
                The Chair Experience
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-bone text-balance">
                Same routine.<br />Every visit.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-base leading-relaxed text-bone/55">
                Whether it's your first visit or your fortieth, the routine
                doesn't change — consistency is what makes the cut repeatable.
              </p>
            </Reveal>
          </div>

          {/* Right: step list */}
          <div className="divide-y divide-white/[0.07]">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-8 py-9"
              >
                <span className="w-10 shrink-0 pt-1 font-display text-sm font-bold text-gold-300/40">
                  {p.step}
                </span>
                <div>
                  <h3 className="font-display text-2xl text-bone">{p.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-bone/55">{p.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
