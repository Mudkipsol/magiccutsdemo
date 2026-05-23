import { useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { stats, shop } from '../data'
import Reveal from './Reveal'

function AnimatedStat({ value, label, delay = 0 }) {
  const numMatch = value.match(/\d+/)
  const entered = useRef(false)
  const spanRef = useRef(null)

  const handleEnter = () => {
    if (!numMatch || entered.current) return
    entered.current = true
    const num = parseInt(numMatch[0])
    const parts = value.split(numMatch[0])
    const prefix = parts[0] || ''
    const suffix = parts[1] || ''
    animate(0, num, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (spanRef.current) spanRef.current.textContent = `${prefix}${Math.round(v)}${suffix}`
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      onViewportEnter={handleEnter}
      className="bg-onyx-900 p-5"
    >
      <p className="font-display text-2xl leading-none text-gold-300">
        <span ref={spanRef}>{numMatch ? value.replace(numMatch[0], '0') : value}</span>
      </p>
      <p className="mt-2 text-xs leading-snug text-bone/50">{label}</p>
    </motion.div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden py-24 sm:py-32">
      <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Visual panel — shop group photo */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-3xl bg-onyx-950 aspect-[4/5]">
            <img
              src="/shop-group.jpg"
              alt="The Magic Cuts team inside the shop"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            {/* Fallback editorial panel */}
            <div className="absolute inset-0 hidden flex-col justify-between" style={{ display: 'none' }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(48deg, #c79a3a 0 2px, transparent 2px 38px)' }} />
              <div className="absolute inset-0 flex flex-col items-start justify-center px-10">
                <p className="font-display text-4xl font-semibold leading-snug text-bone">"Sharp work,<br />no shortcuts."</p>
                <p className="mt-4 text-sm text-bone/40">The house standard</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 px-10 py-6">
                <p className="font-display text-lg text-bone">{shop.address}</p>
                <p className="text-xs uppercase tracking-ultra text-bone/40">{shop.addressLine2}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx-950/60 to-transparent pointer-events-none" />
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
              <AnimatedStat key={s.label} value={s.value} label={s.label} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
