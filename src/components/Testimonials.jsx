import { motion } from 'framer-motion'
import { testimonials, shop } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'
import { Star } from './Icons'

// NOTE: the quotes in data.js `testimonials` are placeholder copy. Replace them
// with real customer reviews before launch. Do not re-add a "via Google" /
// verified-review label unless these are genuinely pulled from Google — implying
// verification on invented quotes is a credibility (and trust) liability.
export default function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead eyebrow="From the Chair" title="Dublin keeps coming" accent="back." />
          <Reveal delay={0.1}>
            <a
              href={shop.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost shrink-0"
            >
              See more on Instagram →
            </a>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              className="card flex flex-col p-7"
            >
              <div className="flex items-center gap-0.5 text-gold-300">
                {[...Array(t.stars)].map((_, n) => (
                  <Star key={n} className="h-3.5 w-3.5" />
                ))}
                {t.stars < 5 && (
                  <Star key="empty" className="h-3.5 w-3.5 opacity-20" />
                )}
              </div>
              <blockquote className="mt-5 flex-1 font-display text-lg leading-snug text-bone/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-white/[0.07] pt-4">
                <p className="text-sm font-semibold text-bone">{t.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-bone/40">{t.detail}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
