import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { services } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

export default function Services() {
  const navigate = useNavigate()

  return (
    <section id="services" className="relative border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            index="01"
            eyebrow="The Menu"
            title="Every service, priced"
            accent="in plain sight."
            intro="No packages, no upsell theater. Pick the work, see the price, book the chair."
          />
          <Reveal delay={0.1}>
            <button onClick={() => navigate('/book')} className="btn-ghost shrink-0">
              Book a Chair
            </button>
          </Reveal>
        </div>

        {/* Editorial ledger */}
        <div className="mt-16 border-t border-[var(--rule-strong)]">
          {services.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => navigate('/book')}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.05 }}
              className="group grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-x-5 gap-y-1 border-b border-[var(--rule)] py-6 text-left transition-colors hover:bg-onyx-900/40 sm:gap-x-8 sm:py-7"
            >
              <span className="font-display text-sm italic tabular-nums text-gold-400/50 transition-colors group-hover:text-gold-400">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl text-bone sm:text-2xl">{s.name}</h3>
                  {s.tag && (
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-300/70">
                      {s.tag}
                    </span>
                  )}
                  <span className="ml-auto hidden text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ash sm:block">
                    {s.duration}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone/55">{s.blurb}</p>
              </div>

              <div className="flex items-baseline gap-1 self-center">
                <span className="font-display text-2xl tabular-nums text-bone sm:text-[1.7rem]">${s.price}</span>
                <span className="text-gold-400/0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold-400">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-[0.8rem] text-bone/35">
            Prices start from. Final figure is confirmed in the chair, based on length and detail.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
