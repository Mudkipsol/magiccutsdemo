import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { shop } from '../data'

// Headline lines rise out of their own overflow masks. One choreographed
// moment, nothing else competing with it.
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

export default function Hero() {
  const navigate = useNavigate()

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

        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/70 to-onyx-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-transparent to-onyx-950/40" />
      </div>

      <div className="shell flex flex-1 items-center pb-20 pt-32">
        <div className="w-full">
          <h1 className="font-display text-[clamp(3.2rem,9.5vw,10.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.01em] text-bone">
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

          <motion.p
            {...settle(0.7)}
            className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70"
          >
            Precision haircuts, beard work, and straight-razor shaves, cut in
            Dublin, Ohio since 2023. Walk-ins welcome, every chair done the
            right way.
          </motion.p>

          <motion.div {...settle(0.85)} className="mt-10 flex flex-wrap items-center gap-7">
            <button onClick={() => navigate('/book')} className="btn-gold">
              Book Your Chair
            </button>
            <a href={shop.phoneHref} className="text-link font-mono text-sm">
              or call {shop.phone}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
