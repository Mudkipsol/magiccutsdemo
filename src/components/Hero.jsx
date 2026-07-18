import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { shop, hours } from '../data'

// Headline lines rise out of their own overflow masks. One choreographed
// moment at poster scale, then the supporting row settles underneath.
const lineRise = (i) => ({
  initial: { y: '110%' },
  animate: { y: '0%' },
  transition: { duration: 0.9, delay: 0.15 + i * 0.13, ease: [0.22, 1, 0.36, 1] },
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
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* layered background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-onyx-950" />

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

        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/55 to-onyx-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950/85 via-onyx-950/35 to-transparent" />
      </div>

      <div className="shell flex flex-1 flex-col justify-end pb-16 pt-32">
        <h1 className="font-display text-[clamp(3.4rem,11vw,12.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.01em] text-bone">
          <span className="block overflow-hidden">
            <motion.span className="block" {...lineRise(0)}>
              The cut that
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...lineRise(1)}>
              <span className="gold-text">earns</span> the
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...lineRise(2)}>
              second look.
            </motion.span>
          </span>
        </h1>

        <motion.div
          {...settle(0.8)}
          className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="max-w-xl text-lg leading-relaxed text-bone/70">
            Precision haircuts, beard work, and straight-razor shaves, cut in
            Dublin, Ohio since 2023. Every chair, every visit, done the right
            way.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <a href={shop.phoneHref} className="text-link font-mono text-sm">
              {shop.phone}
            </a>
            <button onClick={() => navigate('/book')} className="btn-gold">
              Book Your Chair
            </button>
          </div>
        </motion.div>

        <motion.div
          {...settle(0.95)}
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-bone/50"
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
          <span aria-hidden="true" className="text-bone/25">/</span>
          <a
            href={shop.mapHref}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-gold-300"
          >
            {shop.address}, Dublin OH
          </a>
          <span aria-hidden="true" className="text-bone/25">/</span>
          <span>Walk-ins always welcome</span>
        </motion.div>
      </div>
    </section>
  )
}
