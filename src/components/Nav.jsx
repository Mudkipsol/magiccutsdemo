import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shop, hours } from '../data'
import { useAuthStore } from '../store/authStore'

const links = [
  { href: '#services', label: 'The Menu' },
  { href: '#team', label: 'Barbers' },
  { href: '#experience', label: 'The Shop' },
  { href: '#visit', label: 'Visit' },
]

// Resolve the account entry point from the current auth state.
function useAccountLink() {
  const { session, profile, loading } = useAuthStore()
  if (loading) return null
  if (session && profile?.role === 'owner') return { to: '/dashboard', label: 'Owner Dashboard', prominent: true }
  if (session && profile?.role === 'barber') return { to: '/barber', label: 'My Schedule' }
  if (session) return { to: '/account', label: 'My Account' }
  return { to: '/account', label: 'Sign in' }
}

function todayLine() {
  const day = new Date().getDay()
  const idx = day === 0 ? 6 : day - 1
  const t = hours[idx]
  return t.open === 'Closed' ? 'Closed today' : `Open today ${t.open} – ${t.close}`
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const account = useAccountLink()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-colors duration-300 ${
          scrolled ? 'bg-onyx-950/90 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        {/* Utility line — real shop facts, not decoration */}
        <div className="hidden border-b border-white/[0.07] md:block">
          <div className="shell flex h-8 items-center justify-between font-mono text-[11px] text-bone/45">
            <span>{shop.address}, {shop.addressLine2}</span>
            <span className="flex items-center gap-5">
              <span>{todayLine()}</span>
              <a href={shop.phoneHref} className="transition-colors hover:text-gold-300">
                {shop.phone}
              </a>
            </span>
          </div>
        </div>

        <nav className={`shell flex h-16 items-center justify-between border-b transition-colors duration-300 ${scrolled ? 'border-white/10' : 'border-white/[0.07]'}`}>
          <a href="#top" className="flex items-center gap-3" aria-label="Magic Cuts home">
            <span aria-hidden="true" className="pole h-7 w-2.5 rounded-full" />
            <span className="font-display text-2xl font-bold uppercase tracking-[0.04em] text-bone">
              Magic Cuts
            </span>
          </a>

          <div className="hidden items-center gap-10 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative font-display text-base font-bold uppercase tracking-[0.1em] text-bone/60 transition-colors hover:text-bone"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold-300 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            {account && (
              <Link
                to={account.to}
                className={`font-display text-base font-bold uppercase tracking-[0.1em] transition-colors ${
                  account.prominent ? 'text-gold-300 hover:text-gold-200' : 'text-bone/60 hover:text-bone'
                }`}
              >
                {account.label}
              </Link>
            )}
            <Link to="/book" className="btn-gold !px-6 !py-3 text-sm">
              Book a Chair
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 text-bone lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-b border-white/10 bg-onyx-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="shell flex flex-col py-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/[0.06] py-4 font-display text-3xl font-bold uppercase text-bone/85 hover:text-gold-200"
                >
                  {l.label}
                </a>
              ))}
              {account && (
                <Link
                  to={account.to}
                  onClick={() => setOpen(false)}
                  className={`border-b border-white/[0.06] py-4 font-display text-3xl font-bold uppercase ${account.prominent ? 'text-gold-300' : 'text-bone/85'} hover:text-gold-200`}
                >
                  {account.label}
                </Link>
              )}
              <div className="mt-6 flex gap-3">
                <a href={shop.phoneHref} className="btn-ghost flex-1 text-sm">
                  Call {shop.phone}
                </a>
                <Link to="/book" onClick={() => setOpen(false)} className="btn-gold flex-1 text-center text-sm">
                  Book a Chair
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
