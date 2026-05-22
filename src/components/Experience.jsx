import { motion } from 'framer-motion'
import { stats, shop } from '../data'
import Reveal from './Reveal'
import { Scissors } from './Icons'

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden py-24 sm:py-32">
      <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Visual panel (no photo — crafted composition) */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative">
            <div className="card overflow-hidden rounded-3xl p-0">
              <div className="relative aspect-[4/5] w-full">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(90% 70% at 30% 20%, rgba(199,154,58,0.16), transparent 60%), linear-gradient(160deg, #16161a, #0a0a0b)',
                  }}
                />
                {/* concentric arcs */}
                <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 500">
                  {[60, 130, 200, 270, 340].map((r) => (
                    <circle
                      key={r}
                      cx="120"
                      cy="120"
                      r={r}
                      fill="none"
                      stroke="rgba(199,154,58,0.4)"
                      strokeWidth="0.6"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center">
                  <motion.div
                    initial={{ rotate: -12, opacity: 0 }}
                    whileInView={{ rotate: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-gold-300"
                  >
                    <Scissors className="h-16 w-16" />
                  </motion.div>
                  <p className="font-display text-3xl italic text-bone">
                    “Sharp work,<br /> no shortcuts.”
                  </p>
                  <span className="eyebrow">The house rule</span>
                </div>
              </div>
            </div>
            {/* floating est badge */}
            <div className="absolute -right-4 -top-4 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-gold-300/30 bg-onyx-950/90 backdrop-blur">
              <span className="font-display text-2xl text-gold-300">{shop.established}</span>
              <span className="text-[0.55rem] uppercase tracking-ultra text-bone/50">Est.</span>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow">
              <span className="h-px w-8 bg-gold-300/60" />
              The Shop
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-bone text-balance">
              A barbershop built on <span className="gold-text italic">craft</span>, not churn.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-bone/65">
              <p>
                Magic Cuts opened in {shop.established} with one idea: bring real
                barbering back to {shop.city}. The kind where someone reads your
                hair before they touch it, where the line is straight because a
                steady hand made it that way.
              </p>
              <p>
                We blend traditional technique — scissor-over-comb, straight-razor
                detail, the hot towel — with a finish that fits how you actually
                live. You sit down a regular. You leave looking like the photo you
                meant to bring in.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-onyx-900 p-5"
              >
                <p className="font-display text-2xl leading-none text-gold-300">{s.value}</p>
                <p className="mt-2 text-xs leading-snug text-bone/50">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
