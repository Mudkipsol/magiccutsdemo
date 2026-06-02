import { motion } from 'framer-motion'
import { testimonials, shop } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'
import { Star } from './Icons'

// NOTE: the quotes in data.js `testimonials` are placeholder copy. Replace them
// with real customer reviews before launch. Do not add a "verified Google"
// label unless they are genuinely pulled from Google.
export default function Testimonials() {
  const [lead, ...rest] = testimonials

  return (
    <section className="relative border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead index="05" eyebrow="Word of Mouth" title="Dublin keeps coming" accent="back." />
          <Reveal delay={0.1}>
            <a href={shop.instagram} target="_blank" rel="noreferrer" className="btn-ghost shrink-0">
              See more on Instagram
            </a>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          {/* Featured quote */}
          {lead && (
            <Reveal>
              <figure className="flex h-full flex-col">
                <div className="flex items-center gap-0.5 text-gold-300">
                  {[...Array(lead.stars)].map((_, n) => (
                    <Star key={n} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-medium leading-[1.18] tracking-[-0.015em] text-bone text-balance">
                  "{lead.quote}"
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 text-sm">
                  <span className="font-semibold text-bone">{lead.name}</span>
                  <span className="h-3 w-px bg-[var(--rule-strong)]" />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ash">{lead.detail}</span>
                </figcaption>
              </figure>
            </Reveal>
          )}

          {/* Supporting quotes — ruled list */}
          <div className="flex flex-col">
            {rest.map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border-b border-[var(--rule)] py-6 first:border-t"
              >
                <div className="flex items-center gap-0.5 text-gold-300/90">
                  {[...Array(t.stars)].map((_, n) => (
                    <Star key={n} className="h-3 w-3" />
                  ))}
                  {t.stars < 5 && <Star className="h-3 w-3 opacity-20" />}
                </div>
                <blockquote className="mt-3 text-[0.95rem] leading-relaxed text-bone/80">"{t.quote}"</blockquote>
                <figcaption className="mt-3 flex items-center gap-2.5 text-xs">
                  <span className="font-semibold text-bone/90">{t.name}</span>
                  <span className="h-2.5 w-px bg-[var(--rule-strong)]" />
                  <span className="font-semibold uppercase tracking-[0.16em] text-ash">{t.detail}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
