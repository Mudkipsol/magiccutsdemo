import { motion, useScroll, useTransform } from 'framer-motion'
import { Phone, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { shop, hours } from '../data'

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
}

function getTodayHours() {
  const day = new Date().getDay()
  return hours[day === 0 ? 6 : day - 1]
}

export default function Hero() {
  const navigate = useNavigate()
  const today = getTodayHours()
  const isOpen = today.open !== 'Closed'

  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 700], ['0%', '12%'])

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      <div className="shell flex min-h-[100svh] flex-col justify-between pt-28 pb-8">
        {/* Dispatch line — a fine editorial header rule */}
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          className="hidden items-center gap-4 border-b border-[var(--rule)] pb-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ash md:flex"
        >
          <span className="text-gold-400">Est. {shop.established}</span>
          <span className="h-3 w-px bg-[var(--rule-strong)]" />
          <span>{shop.city}</span>
          <span className="ml-auto flex items-center gap-2 text-bone/70">
            <span className="relative flex h-1.5 w-1.5">
              {isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-50" />}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-gold-300' : 'bg-bone/30'}`} />
            </span>
            {isOpen ? `Open till ${today.close} PM` : 'Closed today'}
          </span>
        </motion.div>

        {/* Main masthead grid — asymmetric: type left, plate right */}
        <div className="grid flex-1 grid-cols-1 items-center gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <motion.h1
              variants={rise}
              custom={1}
              initial="hidden"
              animate="show"
              className="font-display text-[clamp(2.9rem,8.5vw,6.6rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-bone text-balance"
            >
              The cut that earns the{' '}
              <span className="italic font-normal">second look</span>.
            </motion.h1>

            <motion.p
              variants={rise}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-8 max-w-md text-[1.0625rem] leading-relaxed text-bone/60"
            >
              Precision haircuts, beard work, and straight-razor shaves in Dublin,
              Ohio. Every chair, every cut, every time. No off days.
            </motion.p>

            <motion.div
              variants={rise}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <button onClick={() => navigate('/book')} className="btn-gold">
                Book a Chair
              </button>
              <a href={shop.phoneHref} className="btn-ghost">
                <Phone size={15} />
                {shop.phone}
              </a>
            </motion.div>

            {/* Rating badge — renders only when real numbers are set in data.js.
                Do not hardcode a fake rating. */}
            {shop.googleRating && shop.googleReviewCount && (
              <motion.a
                href={shop.googleReviews}
                target="_blank"
                rel="noreferrer"
                variants={rise}
                custom={3.6}
                initial="hidden"
                animate="show"
                className="mt-6 inline-flex items-center gap-2.5 text-sm text-bone/65 transition-colors hover:text-bone"
              >
                <span className="flex items-center gap-0.5 text-gold-300">
                  {[...Array(5)].map((_, n) => (
                    <Star key={n} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <span className="font-semibold text-bone">{shop.googleRating}</span>
                <span className="text-bone/40">·</span>
                <span>{shop.googleReviewCount}+ Google reviews</span>
              </motion.a>
            )}
          </div>

          {/* Framed photographic plate */}
          <motion.figure
            variants={rise}
            custom={2.4}
            initial="hidden"
            animate="show"
            className="relative lg:col-span-5"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-[6px] border border-[var(--rule-strong)] bg-onyx-900 sm:aspect-[16/10] lg:aspect-[4/5]">
              <motion.img
                src="/shop-interior.webp"
                alt="Inside Magic Cuts barbershop in Dublin, Ohio"
                fetchpriority="high"
                decoding="async"
                width={1200}
                height={1500}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ y: imgY }}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 18, ease: 'linear' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx-950/70 via-transparent to-transparent" />
            </div>
            <figcaption className="mt-3 flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ash">
              <span>The shop · {shop.address}</span>
              <span className="text-gold-400">Nº 00</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* Footer rule of the masthead */}
        <motion.div
          variants={rise}
          custom={4}
          initial="hidden"
          animate="show"
          className="flex items-center gap-4 border-t border-[var(--rule)] pt-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ash"
        >
          <span>Walk-ins welcome</span>
          <span className="hidden h-3 w-px bg-[var(--rule-strong)] sm:block" />
          <a href={shop.mapHref} target="_blank" rel="noreferrer" className="hidden transition-colors hover:text-gold-300 sm:block">
            {shop.address}, Dublin OH
          </a>
          <span className="ml-auto hidden md:block">Scroll ↓</span>
        </motion.div>
      </div>
    </section>
  )
}
