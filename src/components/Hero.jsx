import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Phone, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { shop, hours } from '../data'
import BarberPole from './BarberPole'

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

  // Cursor spotlight — updates DOM directly (no re-renders)
  const spotlightRef = useRef(null)
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (spotlightRef.current) {
      spotlightRef.current.style.background =
        `radial-gradient(520px circle at ${x}px ${y}px, rgba(199,154,58,0.16), transparent 65%)`
    }
  }, [])

  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => spotlightRef.current && (spotlightRef.current.style.opacity = '1')}
      onMouseLeave={() => spotlightRef.current && (spotlightRef.current.style.opacity = '0')}
    >
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

        {/* Dark overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/90 to-onyx-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/20 to-onyx-950/65" />

        {/* Cursor spotlight */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{ opacity: 0 }}
        />

        {/* Gold ambient glow */}
        <div
          className="absolute inset-0 opacity-[0.4] mix-blend-screen"
          style={{
            background:
              'radial-gradient(120% 90% at 80% -10%, rgba(199,154,58,0.22), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(31,95,176,0.08), transparent 60%)',
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

          <motion.div
            variants={rise}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-10 flex items-center gap-4 text-sm text-bone/50"
          >
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

        {/* right — pole + hours card */}
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
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <p className="eyebrow text-[0.6rem]">Today at the shop</p>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-300" />
              </span>
            </div>
            <p className="mt-2 font-display text-2xl text-bone">
              {isOpen ? `Open till ${today.close} PM` : 'Closed today'}
            </p>
            <p className="mt-1 text-sm text-bone/55">
              {isOpen
                ? 'Same-day chairs available — request below.'
                : 'Back open tomorrow — book ahead now.'}
            </p>
          </motion.div>
        </motion.div>
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
