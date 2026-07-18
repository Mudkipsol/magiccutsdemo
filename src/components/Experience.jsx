import { motion } from 'framer-motion'
import { shop } from '../data'

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32">
      <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        {/* Visual panel — shop group photo, revealed like a curtain pull */}
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <div className="relative overflow-hidden rounded-[2px] bg-onyx-950 aspect-[4/5]">
            <img
              src="/shop-group.jpg"
              alt="The Magic Cuts team inside the shop"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx-950/60 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,5vw,5.5rem)] font-bold uppercase leading-[0.92] text-bone"
          >
            Built on <span className="gold-text">craft,</span> not churn.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-2xl space-y-4 text-lg leading-relaxed text-bone/65"
          >
            <p>
              Magic Cuts opened with one idea: bring real barbering back to{' '}
              {shop.city}. The kind where someone reads your hair before they
              touch it, where the line is straight because a steady hand made
              it that way.
            </p>
            <p>
              The technique is traditional: scissor-over-comb, straight-razor
              detail, the hot towel. The finish fits how you actually live.
              You sit down a regular. You leave looking like the photo you
              meant to bring in.
            </p>
          </motion.div>

          {/* One number, given real weight. Not a stat grid. */}
          <div className="mt-14 border-t border-white/[0.08] pt-8">
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: '105%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="gold-text block font-display text-[clamp(6rem,13vw,12rem)] font-bold leading-[0.85]"
              >
                2023
              </motion.span>
            </span>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-md text-base leading-relaxed text-bone/55"
            >
              The year Dublin got a proper barbershop back. Eight services on
              the menu, six days a week, and walk-ins welcome since the day
              the pole first turned.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}
