import { motion } from 'framer-motion'
import { Phone, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { shop } from '../data'
import BarberPole from './BarberPole'
import { Star } from './Icons'

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  const navigate = useNavigate()
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* layered background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-onyx-950" />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            background:
              'radial-gradient(120% 90% at 80% -10%, rgba(199,154,58,0.18), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(31,95,176,0.10), transparent 60%)',
          }}
        />
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="shell grid min-h-[100svh] grid-cols-1 items-center gap-12 pt-28 pb-16 lg:grid-cols-[1.15fr_0.85fr]">
        {/* left */}
        <div className="max-w-2xl">
          <motion.p variants={rise} initial="hidden" animate="show" className="eyebrow">
            <span className="h-px w-8 bg-gold-300/60" />
            Est. {shop.established} · {shop.city}
          </motion.p>

          <motion.h1
            variants={rise}
            custom={1}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-[clamp(3rem,8vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-bone text-balance"
          >
            The cut that <span className="gold-text italic">earns</span> the
            second look.
          </motion.h1>

          <motion.p
            variants={rise}
            custom={2}
            initial="hidden"
            animate="show"
            className="mt-7 max-w-xl text-lg leading-relaxed text-bone/65"
          >
            Magic Cuts is Dublin’s home for precision haircuts, beard work and
            straight-razor shaves. Old-school craft, a modern finish, and a chair
            that’s always yours.
          </motion.p>

          <motion.div
            variants={rise}
            custom={3}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button onClick={() => navigate('/book')} className="btn-gold">
              Book Your Chair
            </button>
            <a href={shop.phoneHref} className="btn-ghost">
              <Phone size={16} />
              {shop.phone}
            </a>
          </motion.div>

          <motion.div
            variants={rise}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-10 flex items-center gap-5 text-sm text-bone/55"
          >
            <div className="flex items-center gap-1 text-gold-300">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" />
              ))}
            </div>
            <span>Walk-ins welcome · 6 days a week</span>
          </motion.div>
        </div>

        {/* right — pole + chair card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden justify-center lg:flex"
        >
          <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-b from-gold-500/10 to-transparent blur-2xl" />
          <BarberPole />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="card absolute -bottom-2 -left-6 w-56 p-5 backdrop-blur-md"
          >
            <p className="eyebrow text-[0.6rem]">Today at the shop</p>
            <p className="mt-2 font-display text-2xl text-bone">Open till 7</p>
            <p className="mt-1 text-sm text-bone/55">
              Same-day chairs available — request below.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <a
        href="#services"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-ultra text-bone/40 transition-colors hover:text-gold-300 md:flex"
      >
        Explore
        <ArrowDown size={16} className="animate-bounce" />
      </a>
    </section>
  )
}
