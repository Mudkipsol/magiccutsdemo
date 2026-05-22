import { motion } from 'framer-motion'
import { process } from '../data'
import SectionHead from './SectionHead'

export default function Process() {
  return (
    <section id="process" className="relative border-y border-white/10 bg-onyx-900/40 py-24 sm:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="The Chair Experience"
          title="Four steps, every"
          accent="single time."
          intro="Whether it’s your first visit or your fortieth, the routine doesn’t change — because that’s what consistency looks like."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="card group relative overflow-hidden p-7"
            >
              <span className="font-display text-5xl font-bold text-white/[0.06] transition-colors duration-300 group-hover:text-gold-300/20">
                {p.step}
              </span>
              <h3 className="mt-3 font-display text-xl text-bone">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bone/55">{p.text}</p>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gold-300 to-transparent transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
