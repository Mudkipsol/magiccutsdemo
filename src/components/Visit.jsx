import { hours, shop, faqs } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'
import { MapPin, Phone, Instagram, Plus } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

export default function Visit() {
  return (
    <section id="visit" className="relative border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="shell">
        <SectionHead
          index="06"
          eyebrow="Find Us"
          title="Drop in, or"
          accent="plan ahead."
          intro={`On Martin Road in ${shop.city} — parking right out front, walk-ins always welcome.`}
        />

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Hours ledger + contact */}
          <div>
            <p className="kicker">Hours</p>
            <ul className="mt-5 border-t border-[var(--rule-strong)]">
              {hours.map((h, i) => {
                const closed = h.open === 'Closed'
                const today = i === todayIdx
                return (
                  <li
                    key={h.day}
                    className={`flex items-center justify-between border-b border-[var(--rule)] py-3 text-sm ${
                      today ? 'text-bone' : 'text-bone/55'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {today && <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />}
                      <span className={today ? 'font-semibold' : ''}>{h.day}</span>
                    </span>
                    <span className={`tnum ${closed ? 'text-bone/30' : ''}`}>
                      {closed ? 'Closed' : `${h.open} – ${h.close}`}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-8 flex flex-col gap-3 text-[0.95rem]">
              <a href={shop.phoneHref} className="flex items-center gap-3 text-bone/80 transition-colors hover:text-gold-300">
                <Phone size={15} className="text-gold-400" /> {shop.phone}
              </a>
              <a href={shop.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-bone/80 transition-colors hover:text-gold-300">
                <Instagram size={15} className="text-gold-400" /> {shop.instagramHandle}
              </a>
            </div>
          </div>

          {/* Location plate */}
          <Reveal delay={0.08}>
            <a
              href={shop.mapHref}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full min-h-[260px] flex-col justify-between rounded-[6px] border border-[var(--rule)] bg-onyx-900/60 p-8 transition-colors hover:border-gold-400/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-gold-400/40 text-gold-400">
                <MapPin size={18} />
              </span>
              <div>
                <p className="font-display text-2xl text-bone">{shop.address}</p>
                <p className="text-bone/55">{shop.addressLine2}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-300 transition-all group-hover:gap-2.5">
                  Open in Google Maps →
                </span>
              </div>
            </a>
          </Reveal>
        </div>

        {/* FAQ */}
        <div className="mt-20 grid grid-cols-1 gap-x-16 lg:grid-cols-[auto_1fr]">
          <p className="kicker mb-6 lg:mb-0">Questions</p>
          <div className="border-t border-[var(--rule-strong)]">
            {faqs.map((f, i) => (
              <Faq key={i} id={i} {...f} />
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <Reveal delay={0.05}>
          <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-[var(--rule)] pt-10 sm:flex-row sm:items-center">
            <p className="font-display text-2xl text-bone sm:text-3xl">Ready when you are.</p>
            <Link to="/book" className="btn-gold">Book a Chair</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Faq({ q, a, id }) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-panel-${id}`
  return (
    <div className="border-b border-[var(--rule)]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg text-bone">{q}</span>
        <span className={`text-gold-400 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
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
            <p className="max-w-2xl pb-5 text-[0.95rem] leading-relaxed text-bone/65">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
