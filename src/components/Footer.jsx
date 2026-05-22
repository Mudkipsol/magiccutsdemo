import { shop } from '../data'
import { Instagram, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-onyx-950 pt-20">
      {/* oversized wordmark */}
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl text-bone">Magic Cuts</p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-ultra text-gold-300/80">
              {shop.tagline} · Est. {shop.established}
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone/50">
              Precision haircuts, beard work and straight-razor shaves in {shop.city}.
              Old-school craft, modern finish.
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-ultra text-bone/40">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-bone/70">
              <li><a href="#services" className="hover:text-gold-300">Services</a></li>
              <li><a href="#experience" className="hover:text-gold-300">The Shop</a></li>
              <li><a href="#process" className="hover:text-gold-300">How It Works</a></li>
              <li><a href="#book" className="hover:text-gold-300">Book a Chair</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-ultra text-bone/40">Visit</p>
            <ul className="mt-4 space-y-3 text-sm text-bone/70">
              <li>
                <a href={shop.mapHref} target="_blank" rel="noreferrer" className="flex items-start gap-2 hover:text-gold-300">
                  <MapPin size={15} className="mt-0.5 text-gold-300" />
                  <span>{shop.address}<br />{shop.addressLine2}</span>
                </a>
              </li>
              <li>
                <a href={shop.phoneHref} className="flex items-center gap-2 hover:text-gold-300">
                  <Phone size={15} className="text-gold-300" /> {shop.phone}
                </a>
              </li>
              <li>
                <a href={shop.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold-300">
                  <Instagram size={15} className="text-gold-300" /> {shop.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          aria-hidden
          className="select-none text-center font-display font-bold leading-none text-white/[0.04]"
          style={{ fontSize: 'clamp(3rem, 16vw, 13rem)', letterSpacing: '-0.04em' }}
        >
          MAGIC CUTS
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-bone/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {shop.full}. All rights reserved.</p>
          <p>Dublin, Ohio · Walk-ins welcome</p>
        </div>
      </div>
    </footer>
  )
}
