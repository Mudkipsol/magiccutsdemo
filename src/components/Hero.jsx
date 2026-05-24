import { motion, useScroll, useTransform } from 'framer-motion'
import { Phone, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { shop, hours } from '../data'

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

function getTodayHours() {
  const day = new Date().getDay()
  const idx = day === 0 ? 6 : day - 1
  return hours[idx]
}

export default function Hero() {
  const navigate = useNavigate()
  const today = getTodayHours()
  const isOpen = today.open !== 'Closed'

  // Scroll parallax on background image
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 700], ['0%', '14%'])

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* layered background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-onyx-950" />

        {/* Shop interior — Ken Burns slow zoom + scroll parallax */}
        <motion.img
          src="/shop-interior.webp"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          decoding="async"
          width={1920}
          height={1280}
          className="absolute inset-0 h-[115%] w-full object-cover"
          style={{ y: imgY, top: '-8%' }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 22, ease: 'linear' }}
        />

        {/* Legibility gradients — anchor text on the left, let the photo breathe right */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/80 to-onyx-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-transparent to-onyx-950/55" />

        {/* Gold ambient glow */}
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-screen"
          style={{
            background:
              'radial-gradient(110% 80% at 85% -10%, rgba(199,154,58,0.18), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(31,95,176,0.07), transparent 60%)',
          }}
        />
      </div>

      <div className="shell flex min-h-[100svh] items-center pt-28 pb-20">
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
            Magic Cuts is Dublin's home for precision haircuts, beard work, and
            straight-razor shaves. Every chair, every cut, every time — done the
            right way.
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

          {/* Live status — the one dynamic detail worth surfacing, kept inline */}
          <motion.div
            variants={rise}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-bone/55"
          >
            <span className="flex items-center gap-2 text-bone/75">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                {isOpen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-50" />
                )}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-gold-300' : 'bg-bone/30'}`} />
              </span>
              {isOpen ? `Open till ${today.close} PM` : 'Closed today'}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <a
              href={shop.mapHref}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-gold-300"
            >
              {shop.address}, Dublin OH
            </a>
            <span className="h-3 w-px bg-white/20" />
            <span>Walk-ins always welcome</span>
          </motion.div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-ultra text-bone/40 transition-colors hover:text-gold-300 md:flex"
      >
        Explore
        <ArrowDown size={16} className="opacity-60" />
      </a>
    </section>
  )
}
