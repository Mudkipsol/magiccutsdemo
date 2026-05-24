import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, LayoutDashboard, CalendarClock, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shop } from '../data'
import { useAuthStore } from '../store/authStore'

const links = [
  { href: '#services', label: 'Services' },
  { href: '#experience', label: 'The Shop' },
  { href: '#process', label: 'How It Works' },
  { href: '#visit', label: 'Visit' },
]

// Resolve the account entry point from the current auth state.
function useAccountLink() {
  const { session, profile, loading } = useAuthStore()
  if (loading) return null
  if (session && profile?.role === 'owner') return { to: '/dashboard', label: 'Owner Dashboard', icon: LayoutDashboard, prominent: true }
  if (session && profile?.role === 'barber') return { to: '/barber', label: 'My Schedule', icon: CalendarClock }
  if (session) return { to: '/account', label: 'My Account', icon: User }
  return { to: '/account', label: 'Sign in', icon: User }
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
        className={`backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-onyx-950/55'
            : 'border-b border-white/[0.06] bg-white/[0.03]'
        }`}
      >
        <nav className="shell flex h-[72px] items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" aria-label="Magic Cuts home">
            <Logo />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-wide text-bone">
                Magic Cuts
              </span>
              <span className="text-[0.58rem] font-semibold uppercase tracking-ultra text-gold-300/80">
                Dublin · Ohio
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm font-medium text-bone/70 transition-colors hover:text-bone"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold-300 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {account && (
              account.prominent ? (
                <Link
                  to={account.to}
                  className="flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-300/10 px-4 py-2 text-xs font-semibold text-gold-200 transition-colors hover:bg-gold-300/20"
                >
                  <account.icon size={15} />
                  {account.label}
                </Link>
              ) : (
                <Link
                  to={account.to}
                  className="flex items-center gap-1.5 text-sm font-medium text-bone/70 transition-colors hover:text-bone"
                >
                  <account.icon size={15} />
                  {account.label}
                </Link>
              )
            )}
            <a href={shop.phoneHref} className="btn-ghost text-xs">
              <Phone size={15} />
              {shop.phone}
            </a>
            <Link to="/book" className="btn-gold text-xs">
              Book a Chair
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-bone lg:hidden"
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
            <div className="shell flex flex-col gap-1 py-5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-bone/80 hover:bg-white/5 hover:text-bone"
                >
                  {l.label}
                </a>
              ))}
              {account && (
                <Link
                  to={account.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium ${account.prominent ? 'text-gold-200' : 'text-bone/80'} hover:bg-white/5 hover:text-bone`}
                >
                  <account.icon size={17} /> {account.label}
                </Link>
              )}
              <div className="mt-3 flex gap-3">
                <a href={shop.phoneHref} className="btn-ghost flex-1 text-xs">
                  <Phone size={15} /> Call
                </a>
                <Link to="/book" onClick={() => setOpen(false)} className="btn-gold flex-1 text-center text-xs">
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

function Logo() {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <defs>
          <linearGradient id="navg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3e6c2" />
            <stop offset="0.55" stopColor="#c79a3a" />
            <stop offset="1" stopColor="#9c6f20" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="url(#navg)" strokeWidth="1.4" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontSize="19"
          fontWeight="700"
          fill="url(#navg)"
        >
          M
        </text>
      </svg>
    </span>
  )
}
