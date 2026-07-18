import { Link } from 'react-router-dom'
import { shop } from '../data'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-onyx-950">
      <div className="shell grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="pole h-7 w-2.5 rounded-full" />
            <span className="font-display text-2xl font-bold uppercase text-bone">Magic Cuts</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone/50">
            Precision work, honest pricing, and a shop worth coming back to.
            Cutting in Dublin, Ohio since {shop.established}.
          </p>
          <Link to="/book" className="btn-gold mt-8 inline-flex !px-6 !py-3 text-sm">
            Book a Chair
          </Link>
        </div>

        <ul className="space-y-3 font-display text-lg font-bold uppercase tracking-[0.06em] text-bone/60 md:pt-1">
          <li><a href="#services" className="transition-colors hover:text-gold-300">The Menu</a></li>
          <li><a href="#team" className="transition-colors hover:text-gold-300">Barbers</a></li>
          <li><a href="#experience" className="transition-colors hover:text-gold-300">The Shop</a></li>
          <li><Link to="/gallery" className="transition-colors hover:text-gold-300">Gallery</Link></li>
        </ul>

        <ul className="space-y-3 font-mono text-sm text-bone/60 md:pt-2">
          <li>
            <a href={shop.mapHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-300">
              {shop.address}<br />{shop.addressLine2}
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
      </div>

      <div className="border-t border-white/[0.07]">
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
