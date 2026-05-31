import { hours, shop, faqs } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'
import { MapPin, Phone, Instagram } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

export default function Visit() {
  return (
    <section id="visit" className="relative border-t border-white/10 bg-onyx-900/40 py-24 sm:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Find Us"
          title="Drop in, or"
          accent="plan ahead."
          intro={`We’re on Martin Road in ${shop.city} — parking right out front, walk-ins always welcome.`}
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Hours */}
          <Reveal>
            <div className="card h-full p-7">
              <p className="eyebrow text-[0.6rem]">Hours</p>
              <ul className="mt-5 space-y-1">
                {hours.map((h, i) => {
                  const closed = h.open === 'Closed'
                  const today = i === todayIdx
                  return (
                    <li
                      key={h.day}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        today ? 'bg-gold-300/10 text-bone' : 'text-bone/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {today && <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />}
                        {h.day}
                      </span>
                      <span className={closed ? 'text-bone/30' : 'tabular-nums'}>
                        {closed ? 'Closed' : `${h.open} – ${h.close}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          {/* Location card */}
          <Reveal delay={0.08}>
            <a
              href={shop.mapHref}
              target="_blank"
              rel="noreferrer"
              className="card group relative block h-full min-h-[280px] overflow-hidden"
            >
              <div className="relative flex h-full flex-col justify-between p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-300/40 bg-onyx-950 text-gold-300">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="font-display text-2xl text-bone">{shop.address}</p>
                  <p className="text-bone/55">{shop.addressLine2}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-gold-300 transition-all group-hover:gap-2">
                    Open in Google Maps →
                  </span>
                </div>
              </div>
            </a>
          </Reveal>

          {/* Contact + FAQ */}
          <Reveal delay={0.16}>
            <div className="flex h-full flex-col gap-6">
              <div className="card p-7">
                <p className="eyebrow text-[0.6rem]">Reach Us</p>
                <div className="mt-5 space-y-3">
                  <a href={shop.phoneHref} className="flex items-center gap-3 text-bone/80 hover:text-gold-300">
                    <Phone size={16} className="text-gold-300" /> {shop.phone}
                  </a>
                  <a href={shop.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-bone/80 hover:text-gold-300">
                    <Instagram size={16} className="text-gold-300" /> {shop.instagramHandle}
                  </a>
                </div>
                <Link to="/book" className="btn-gold mt-6 block w-full text-center text-xs">Book a Chair</Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          {faqs.map((f, i) => (
            <Faq key={i} id={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq({ q, a, id }) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-panel-${id}`
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg text-bone">{q}</span>
        <span className={`text-gold-300 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <Plus size={20} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-bone/70">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
