import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { shop, hours } from '../data'

// Each headline line rises out of its own overflow mask, then the supporting
// copy follows. One choreographed moment, no per-element fade soup.
const lineRise = (i) => ({
  initial: { y: '110%' },
  animate: { y: '0%' },
  transition: { duration: 0.9, delay: 0.2 + i * 0.14, ease: [0.22, 1, 0.36, 1] },
})

const settle = (delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

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
          <h1 className="font-display text-[clamp(3rem,8vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-bone">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...lineRise(0)}>
                The cut that
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...lineRise(1)}>
                <span className="gold-text italic">earns</span> the
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...lineRise(2)}>
                second look.
              </motion.span>
            </span>
          </h1>

          <motion.p
            {...settle(0.75)}
            className="mt-7 max-w-xl text-lg leading-relaxed text-bone/65"
          >
            Precision haircuts, beard work, and straight-razor shaves, cut in
            Dublin, Ohio since 2023. Every chair, every visit, done the right
            way.
          </motion.p>

          <motion.div {...settle(0.9)} className="mt-9 flex flex-wrap items-center gap-6">
            <button onClick={() => navigate('/book')} className="btn-gold">
              Book Your Chair
            </button>
            <a href={shop.phoneHref} className="text-link text-sm">
              or call {shop.phone}
            </a>
          </motion.div>

          {/* Live status — the one dynamic detail worth surfacing, kept inline */}
          <motion.div
            {...settle(1.05)}
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
        <span aria-hidden="true" className="font-display text-base leading-none">↓</span>
      </a>
    </section>
  )
}
