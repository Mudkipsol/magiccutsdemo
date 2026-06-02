import { motion } from 'framer-motion'
import { stats, shop } from '../data'
import Reveal from './Reveal'

function Figure({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="border-t border-paper-ink/15 pt-4"
    >
      <p className="font-display text-3xl leading-none tracking-tight text-paper-ink tnum">{value}</p>
      <p className="mt-2 text-xs leading-snug text-paper-ash">{label}</p>
    </motion.div>
  )
}

// The light "paper" spread — a full-bleed editorial inset that breaks the dark
// rhythm. Ink-on-bone, the system's signature contrast moment.
export default function Experience() {
  return (
    <section id="experience" className="relative bg-paper text-paper-ink">
      <div className="shell grid grid-cols-1 items-center gap-12 py-24 sm:py-32 lg:grid-cols-12 lg:gap-16">
        {/* Photographic plate */}
        <Reveal className="order-2 lg:order-1 lg:col-span-5">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-paper-ink/5">
              <img
                src="/shop-group.jpg"
                alt="The Magic Cuts team inside the shop"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
                onError={(e) => { e.target.style.opacity = 0 }}
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-paper-ash">
              <span>The house · Est. {shop.established}</span>
              <span>Nº 03</span>
            </figcaption>
          </figure>
        </Reveal>

        {/* Editorial copy */}
        <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-7">
          <Reveal y={16}>
            <div className="flex items-center gap-4">
              <span className="font-display text-sm italic text-paper-ink/50">Nº 03</span>
              <span className="h-px w-10 bg-paper-ink/20" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-paper-ash">The Shop</span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[clamp(2.3rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-balance">
              We read the hair <span className="italic font-normal">before</span> we touch it.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 max-w-xl space-y-4 text-[1.0625rem] leading-relaxed text-paper-ink/75">
              <p>
                Magic Cuts opened in {shop.established} to bring real barbering back
                to {shop.city} — the kind where the line is straight because a
                steady hand made it that way, not because a guard did.
              </p>
              <p>
                Scissor-over-comb, straight-razor detail, the hot towel — finished
                for how you actually live. You sit down a regular. You leave looking
                like the photo you meant to bring in.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Figure key={s.label} value={s.value} label={s.label} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
