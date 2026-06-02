import { motion } from 'framer-motion'
import { process } from '../data'
import Reveal from './Reveal'

export default function Process() {
  return (
    <section id="process" className="relative border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:items-start">
          {/* Sticky header column */}
          <div className="lg:sticky lg:top-28">
            <Reveal y={16}>
              <div className="flex items-center gap-4">
                <span className="font-display text-sm italic text-gold-400">Nº 04</span>
                <span className="h-px w-10 bg-[var(--rule-strong)]" />
                <span className="kicker">The Method</span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-display text-[clamp(2.3rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-bone text-balance">
                Same routine.<br />Every visit.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-bone/55">
                First visit or fortieth, the sequence doesn't change. Consistency is
                what makes a cut repeatable.
              </p>
            </Reveal>
          </div>

          {/* Ruled step list */}
          <div className="border-t border-[var(--rule-strong)]">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-[var(--rule)] py-8 sm:gap-x-10"
              >
                <span className="font-display text-4xl italic leading-none tabular-nums text-gold-400/30 sm:text-5xl">
                  {p.step}
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-2xl text-bone">{p.title}</h3>
                  <p className="mt-2.5 max-w-lg text-[1.0625rem] leading-relaxed text-bone/60">{p.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
