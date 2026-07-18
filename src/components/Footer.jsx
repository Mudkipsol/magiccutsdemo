import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { shop, hours } from '../data'

const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

// The back page. A full-viewport editorial close: the last pitch, the shop's
// vitals set in columns, then the wordmark as the final image on the site.
export default function Footer() {
  return (
    <footer className="relative flex min-h-[100svh] flex-col border-t border-white/10 bg-onyx-950">
      {/* The last pitch + the shop's vitals */}
      <div className="shell flex flex-1 flex-col justify-center py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.6rem,4.5vw,4.8rem)] font-bold uppercase leading-[0.92] text-bone"
            >
              The chair is open.<br />
              <span className="gold-text">Take it.</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-9 flex flex-wrap items-center gap-7"
            >
              <Link to="/book" className="btn-gold">
                Book Your Chair
              </Link>
              <a href={shop.phoneHref} className="text-link font-mono text-sm">
                or call {shop.phone}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {hours.map((h, i) => {
              const closed = h.open === 'Closed'
              const today = i === todayIdx
              return (
                <div key={h.day} className="flex items-baseline justify-between border-t border-white/[0.08] py-2 last:border-b">
                  <span className={`font-display text-base font-bold uppercase tracking-[0.06em] ${today ? 'text-gold-200' : 'text-bone/60'}`}>
                    {h.day.slice(0, 3)}
                  </span>
                  <span className={`font-mono text-xs tabular-nums ${today ? 'text-gold-200' : closed ? 'text-bone/30' : 'text-bone/55'}`}>
                    {closed ? 'Closed' : `${h.open} – ${h.close}`}
                  </span>
                </div>
              )
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-between gap-10"
          >
            <ul className="space-y-2.5 font-display text-xl font-bold uppercase tracking-[0.06em] text-bone/60">
              <li><a href="#services" className="transition-colors hover:text-gold-300">The Menu</a></li>
              <li><a href="#team" className="transition-colors hover:text-gold-300">Barbers</a></li>
              <li><a href="#experience" className="transition-colors hover:text-gold-300">The Shop</a></li>
              <li><Link to="/gallery" className="transition-colors hover:text-gold-300">Gallery</Link></li>
            </ul>
            <ul className="space-y-2 font-mono text-sm text-bone/55">
              <li>
                <a href={shop.mapHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-300">
                  {shop.address}, {shop.addressLine2}
                </a>
              </li>
              <li>
                <a href={shop.phoneHref} className="transition-colors hover:text-gold-300">{shop.phone}</a>
              </li>
              <li>
                <a href={shop.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-300">
                  {shop.instagramHandle}
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Legal, above the wordmark so the brand gets the last word */}
      <div className="border-t border-white/[0.07]">
        <div className="shell flex flex-col items-start justify-between gap-3 py-5 font-mono text-[11px] text-bone/35 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {shop.full}. Est. {shop.established}, Dublin, Ohio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-bone/70">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-bone/70">Terms</Link>
          </div>
        </div>
      </div>

      {/* The wordmark, cropped at the baseline: the site's final image */}
      <div className="relative overflow-hidden" aria-hidden="true">
        <motion.p
          initial={{ y: '30%', opacity: 0 }}
          whileInView={{ y: '12%', opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="select-none whitespace-nowrap text-center font-display text-[17.5vw] font-bold uppercase leading-[0.78] text-bone/95"
        >
          Magic Cuts
        </motion.p>
      </div>

      {/* The pole, as the last pixel of the site */}
      <div className="pole h-1.5 w-full" />
    </footer>
  )
}
