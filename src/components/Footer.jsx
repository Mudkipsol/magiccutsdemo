import { shop } from '../data'
import { Instagram, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--rule-strong)] bg-onyx-950">
      <div className="shell pt-16">
        {/* Oversized masthead wordmark */}
        <div className="flex flex-col gap-4 border-b border-[var(--rule)] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-none tracking-[-0.03em] text-bone">
              Magic Cuts
            </p>
            <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-ash">
              {shop.tagline} · Est. {shop.established} · {shop.city}
            </p>
          </div>
          <Link to="/book" className="btn-gold shrink-0">Book a Chair</Link>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-3">
          <div>
            <p className="kicker">Explore</p>
            <ul className="mt-5 space-y-2.5 text-sm text-bone/60">
              <li><a href="#services" className="transition-colors hover:text-gold-300">Services</a></li>
              <li><a href="#team" className="transition-colors hover:text-gold-300">Barbers</a></li>
              <li><a href="#experience" className="transition-colors hover:text-gold-300">The Shop</a></li>
              <li><Link to="/gallery" className="transition-colors hover:text-gold-300">Gallery</Link></li>
              <li><Link to="/book" className="transition-colors hover:text-gold-300">Book a Chair</Link></li>
            </ul>
          </div>

          <div>
            <p className="kicker">Visit</p>
            <ul className="mt-5 space-y-3 text-sm text-bone/60">
              <li>
                <a href={shop.mapHref} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 transition-colors hover:text-gold-300">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gold-400" />
                  <span>{shop.address}<br />{shop.addressLine2}</span>
                </a>
              </li>
              <li>
                <a href={shop.phoneHref} className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                  <Phone size={15} className="text-gold-400" /> {shop.phone}
                </a>
              </li>
              <li>
                <a href={shop.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                  <Instagram size={15} className="text-gold-400" /> {shop.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="kicker">Hours</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone/60">
              Mon–Thu 10–7 · Fri 10–8 · Sat 9–8<br />Closed Sundays.
              <br /><br />
              Precision work, honest pricing, and a shop worth coming back to.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--rule)] py-7 text-xs text-bone/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {shop.full}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-bone">Privacy Policy</Link>
            <span className="h-3 w-px bg-[var(--rule-strong)]" />
            <Link to="/terms" className="transition-colors hover:text-bone">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
