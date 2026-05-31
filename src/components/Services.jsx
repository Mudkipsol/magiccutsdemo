import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { services } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

export default function Services() {
  const navigate = useNavigate()

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            eyebrow="The Menu"
            title="Every service, done"
            accent="properly."
            intro="Pricing is honest and up front. Pick your service, book your chair, come in ready."
          />
          <Reveal delay={0.1}>
            <button onClick={() => navigate('/book')} className="btn-ghost shrink-0">
              Book a Chair →
            </button>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2">
          {services.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => navigate('/book')}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.06 }}
              className="group relative flex items-start justify-between gap-6 border-b border-white/[0.07] px-4 py-7 text-left transition-colors hover:bg-onyx-900/40"
            >
              {/* Gold left accent — grows from top on hover */}
              <span className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 rounded-full bg-gold-400 transition-transform duration-300 ease-out group-hover:scale-y-100" />

              <div className="flex-1 min-w-0 pl-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-display text-xl text-bone">{s.name}</h3>
                  {s.tag && (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-gold-300/60">
                      {s.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-bone/65">{s.blurb}</p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-widest text-bone/30">{s.duration}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-display text-2xl text-gold-300">${s.price}</span>
                <span className="ml-1 translate-x-0 text-xs text-gold-300/0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold-300/60">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-sm text-bone/35">
            Prices start from. Final pricing confirmed in the chair based on length and detail.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
