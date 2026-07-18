import { shop } from '../data'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-onyx-950 pt-20">
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl text-bone">Magic Cuts</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone/50">
              Precision work, honest pricing, and a shop worth coming back to.
              Cutting in Dublin, Ohio since {shop.established}.
            </p>
          </div>

          <ul className="space-y-2 text-sm text-bone/70 md:mt-1">
            <li><a href="#services" className="hover:text-gold-300 transition-colors">The Menu</a></li>
            <li><a href="#team" className="hover:text-gold-300 transition-colors">Barbers</a></li>
            <li><a href="#experience" className="hover:text-gold-300 transition-colors">The Shop</a></li>
            <li><Link to="/gallery" className="hover:text-gold-300 transition-colors">Gallery</Link></li>
            <li><Link to="/book" className="hover:text-gold-300 transition-colors">Book a Chair</Link></li>
          </ul>

          <ul className="space-y-3 text-sm text-bone/70 md:mt-1">
            <li>
              <a href={shop.mapHref} target="_blank" rel="noreferrer" className="hover:text-gold-300 transition-colors">
                {shop.address}, {shop.addressLine2}
              </a>
            </li>
            <li>
              <a href={shop.phoneHref} className="hover:text-gold-300 transition-colors">
                {shop.phone}
              </a>
            </li>
            <li>
              <a href={shop.instagram} target="_blank" rel="noreferrer" className="hover:text-gold-300 transition-colors">
                {shop.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        <div className="gold-rule" />

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-bone/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {shop.full}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-bone transition-colors">Privacy Policy</Link>
            <span className="h-3 w-px bg-white/15" />
            <Link to="/terms" className="hover:text-bone transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
