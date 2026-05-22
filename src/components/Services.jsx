import { motion } from 'framer-motion'
import { services } from '../data'
import { serviceIcon } from './Icons'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

export default function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            eyebrow="The Menu"
            title="Every service, done"
            accent="properly."
            intro="No upsells, no rush. Pick your service — pricing is honest and the work speaks for itself."
          />
          <Reveal delay={0.1}>
            <a href="#book" className="btn-ghost shrink-0">
              Book any service →
            </a>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = serviceIcon[s.id]
            return (
              <motion.a
                key={s.id}
                href="#book"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
                className="group relative flex flex-col bg-onyx-900 p-7 transition-colors duration-300 hover:bg-onyx-850"
              >
                {s.tag && (
                  <span className="absolute right-5 top-5 rounded-full border border-gold-300/30 bg-gold-300/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-gold-200">
                    {s.tag}
                  </span>
                )}
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-gold-300 transition-all duration-300 group-hover:border-gold-300/50 group-hover:bg-gold-300/10">
                  {Icon && <Icon className="h-6 w-6" />}
                </span>

                <h3 className="mt-6 font-display text-xl font-medium text-bone">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-bone/55">{s.blurb}</p>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4">
                  <span className="font-display text-2xl text-bone">
                    <span className="text-gold-300">$</span>
                    {s.price}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-bone/40">
                    {s.duration}
                  </span>
                </div>
              </motion.a>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-center text-sm text-bone/40">
            Prices start from. Final pricing confirmed in the chair based on length and detail.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
