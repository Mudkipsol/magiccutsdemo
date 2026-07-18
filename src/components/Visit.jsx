import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hours, shop, faqs } from '../data'

const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

export default function Visit() {
  return (
    <section id="visit" className="relative border-t border-white/10 bg-onyx-900/40 py-24 sm:py-32">
      <div className="shell">
        <div className="max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone text-balance"
          >
            Drop in, or <span className="gold-text italic">plan ahead.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-lg leading-relaxed text-bone/60"
          >
            We're on Martin Road in {shop.city}, parking right out front,
            walk-ins always welcome.
          </motion.p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          {/* The address, set like it matters */}
          <div>
            <span className="block overflow-hidden">
              <motion.a
                href={shop.mapHref}
                target="_blank"
                rel="noreferrer"
                initial={{ y: '105%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="block font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.02] text-bone transition-colors duration-200 hover:text-gold-200"
              >
                2779 Martin Rd
              </motion.a>
            </span>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="mt-2 font-display text-xl text-bone/60">{shop.addressLine2}</p>
              <p className="mt-3 font-mono text-xs tracking-widest text-gold-300/50">
                40.1028° N · 83.1421° W
              </p>

              <div className="mt-8 flex flex-col items-start gap-4 text-base">
                <a href={shop.phoneHref} className="text-link">
                  {shop.phone}
                </a>
                <a href={shop.instagram} target="_blank" rel="noreferrer" className="text-link">
                  {shop.instagramHandle}
                </a>
                <a href={shop.mapHref} target="_blank" rel="noreferrer" className="text-link">
                  Open in Google Maps →
                </a>
              </div>

              <Link to="/book" className="btn-gold mt-10 inline-flex">
                Book a Chair
              </Link>
            </motion.div>
          </div>

          {/* Hours ledger */}
          <div>
            {hours.map((h, i) => {
              const closed = h.open === 'Closed'
              const today = i === todayIdx
              return (
                <motion.div
                  key={h.day}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative flex items-baseline justify-between overflow-hidden py-3"
                >
                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-x-0 top-0 h-px origin-left ${
                      today ? 'bg-gold-300/50' : 'bg-white/[0.08]'
                    }`}
                  />
                  <span className={`font-display text-lg ${today ? 'italic text-gold-200' : 'text-bone/70'}`}>
                    {h.day}
                    {today && <em className="ml-3 text-sm text-gold-300/70">today</em>}
                  </span>
                  <span className={`tabular-nums text-base ${today ? 'text-gold-200' : closed ? 'text-bone/30' : 'text-bone/60'}`}>
                    {closed ? 'Closed' : `${h.open} – ${h.close}`}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          {faqs.map((f, i) => (
            <Faq key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg text-bone">{q}</span>
        <span
          aria-hidden="true"
          className={`font-display text-2xl leading-none text-gold-300 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-bone/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
