import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { shop } from '../data'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-onyx-950">
      {/* The last word, set like a poster */}
      <div className="shell py-20 sm:py-28">
        <span className="block overflow-hidden">
          <motion.p
            initial={{ y: '105%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(3.4rem,10vw,11rem)] font-bold uppercase leading-[0.88] text-bone"
          >
            Walk out <span className="gold-text">sharp.</span>
          </motion.p>
        </span>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-8"
        >
          <Link to="/book" className="btn-gold">
            Book Your Chair
          </Link>
          <a href={shop.phoneHref} className="text-link font-mono text-sm">
            or call {shop.phone}
          </a>
        </motion.div>
      </div>

      {/* One ruled info line, then legal */}
      <div className="border-t border-white/[0.08]">
        <div className="shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="pole h-6 w-2 rounded-full" />
            <span className="font-display text-lg font-bold uppercase text-bone">Magic Cuts</span>
            <span className="font-mono text-xs text-bone/40">est. {shop.established}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-bone/55">
            <a href="#services" className="transition-colors hover:text-gold-300">The Menu</a>
            <a href="#team" className="transition-colors hover:text-gold-300">Barbers</a>
            <Link to="/gallery" className="transition-colors hover:text-gold-300">Gallery</Link>
            <a href={shop.mapHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-300">
              {shop.address}, Dublin OH
            </a>
            <a href={shop.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-300">
              {shop.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="shell flex flex-col items-start justify-between gap-3 py-5 font-mono text-[11px] text-bone/35 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {shop.full}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-bone/70">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-bone/70">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
