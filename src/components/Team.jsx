import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { barbers } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

export default function Team() {
  const navigate = useNavigate()

  return (
    <section id="team" className="relative border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            index="02"
            eyebrow="The Chairs"
            title="Pick your"
            accent="barber."
            intro="Every chair has a name and a specialty. Choose before you walk in — and see their real-time availability when you book."
          />
          <Reveal delay={0.1}>
            <button onClick={() => navigate('/book')} className="btn-ghost shrink-0">
              Book a Chair
            </button>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {barbers.map((b, i) => (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/book?barber=${b.id}`)}
              className="group text-left"
            >
              {/* Portrait plate */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] border border-[var(--rule)] bg-onyx-900">
                <img
                  src={b.photo}
                  alt={b.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top grayscale-[0.15] transition-all duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center bg-onyx-800" style={{ display: 'none' }}>
                  <span className="font-display text-6xl text-gold-300/40">{b.name.charAt(0)}</span>
                </div>
                <span className="absolute left-3 top-3 font-display text-xs italic tabular-nums text-bone/70">
                  Nº {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Editorial caption */}
              <div className="mt-4 border-t border-[var(--rule-strong)] pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl text-bone">{b.name}</h3>
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold-400/70">
                    {b.title}
                  </span>
                </div>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-bone/55">{b.bio}</p>
                <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ash">
                  {b.specialties.join(' · ')}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-bone/40 transition-colors group-hover:text-gold-300">
                  Book {b.name.split(' ')[0]} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
