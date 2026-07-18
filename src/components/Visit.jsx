import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hours, shop, faqs } from '../data'

const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

const MAP_SRC = 'https://www.google.com/maps?q=2779+Martin+Rd,+Dublin,+OH+43017&output=embed'

export default function Visit() {
  // Mount the map iframe ourselves when the panel scrolls into view.
  // Native loading="lazy" on an iframe inside an animated container proved
  // unreliable (the request never fired on some devices). The timer is a
  // belt-and-suspenders fallback in case the viewport observer never fires.
  const [mapLive, setMapLive] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMapLive(true), 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <section id="visit" className="relative border-t border-white/10 bg-onyx-900/40 py-24 sm:py-32">
      <div className="shell">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.8rem,5.5vw,6rem)] font-bold uppercase leading-[0.92] text-bone"
        >
          Drop in, or <span className="gold-text">plan ahead.</span>
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Address, hours, contact */}
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
                className="block font-display text-[clamp(2.8rem,4.5vw,5.5rem)] font-bold uppercase leading-[0.9] text-bone transition-colors duration-200 hover:text-gold-200"
              >
                2779 Martin Rd
              </motion.a>
            </span>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <p className="mt-2 font-display text-2xl font-bold uppercase text-bone/60">
                {shop.addressLine2}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4 font-mono text-sm">
                <a href={shop.phoneHref} className="text-link">
                  {shop.phone}
                </a>
                <a href={shop.instagram} target="_blank" rel="noreferrer" className="text-link">
                  {shop.instagramHandle}
                </a>
              </div>

              {/* Hours ledger — each rule draws itself in */}
              <div className="mt-10">
                {hours.map((h, i) => {
                  const closed = h.open === 'Closed'
                  const today = i === todayIdx
                  return (
                    <div
                      key={h.day}
                      className="relative flex items-baseline justify-between py-3"
                    >
                      <motion.span
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className={`absolute inset-x-0 top-0 h-px origin-left ${today ? 'bg-gold-300/60' : 'bg-white/[0.08]'}`}
                      />
                      <span className={`font-display text-xl font-bold uppercase ${today ? 'text-gold-200' : 'text-bone/70'}`}>
                        {h.day}
                        {today && <span className="ml-3 font-mono text-xs font-normal normal-case text-gold-300/70">today</span>}
                      </span>
                      <span className={`font-mono text-sm tabular-nums ${today ? 'text-gold-200' : closed ? 'text-bone/30' : 'text-bone/60'}`}>
                        {closed ? 'Closed' : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  )
                })}
              </div>

              <Link to="/book" className="btn-gold mt-10 inline-flex">
                Book a Chair
              </Link>
            </motion.div>
          </div>

          {/* The map, in the shop's palette */}
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
            onViewportEnter={() => setMapLive(true)}
            viewport={{ once: true, margin: '100px 0px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[420px] overflow-hidden rounded-[2px] border border-white/10 bg-onyx-900"
          >
            {mapLive ? (
              <iframe
                title="Map to Magic Cuts, 2779 Martin Rd, Dublin OH"
                src={MAP_SRC}
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0, filter: 'invert(0.89) hue-rotate(180deg) saturate(0.25) brightness(0.92) contrast(1.05)' }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <p className="font-mono text-xs tracking-widest text-gold-300/50">40.1028° N · 83.1421° W</p>
                <p className="font-mono text-xs text-bone/35">loading map…</p>
              </div>
            )}
            <a
              href={shop.mapHref}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 left-4 bg-onyx-950/90 px-4 py-2.5 font-mono text-xs text-bone/80 transition-colors hover:text-gold-300"
            >
              Open in Google Maps →
            </a>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-24 grid grid-cols-1 gap-10 border-t border-white/10 pt-14 lg:grid-cols-[1fr_2fr]">
          <h3 className="font-display text-3xl font-bold uppercase text-bone/80">
            Before you ask
          </h3>
          <div>
            {faqs.map((f, i) => (
              <Faq key={i} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 first:border-t">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-lg font-medium text-bone">{q}</span>
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
            <p className="max-w-2xl pb-5 text-bone/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
