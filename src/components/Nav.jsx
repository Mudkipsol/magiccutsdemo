import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, CalendarClock, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shop } from '../data'
import { useAuthStore } from '../store/authStore'

const links = [
  { href: '#services', label: 'Services', idx: '01' },
  { href: '#team', label: 'Barbers', idx: '02' },
  { href: '#experience', label: 'The Shop', idx: '03' },
  { href: '#visit', label: 'Visit', idx: '06' },
]

function useAccountLink() {
  const { session, profile, loading } = useAuthStore()
  if (loading) return null
  if (session && profile?.role === 'owner') return { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, prominent: true }
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
        className={`transition-colors duration-500 ${
          scrolled
            ? 'border-b border-[var(--rule)] bg-onyx-950/80 backdrop-blur-xl'
            : 'border-b border-transparent'
        }`}
      >
        <nav className="shell flex h-[74px] items-center justify-between gap-6">
          {/* Typographic masthead wordmark */}
          <a href="#top" className="group flex items-baseline gap-3" aria-label="Magic Cuts home">
            <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.01em] text-bone">
              Magic Cuts
            </span>
            <span className="hidden h-3.5 w-px bg-[var(--rule-strong)] sm:block" />
            <span className="hidden text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-ash sm:block">
              Dublin · Ohio
            </span>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group flex items-center gap-1.5 text-[0.82rem] font-medium text-bone/65 transition-colors hover:text-bone"
              >
                <span className="text-[0.6rem] font-semibold tabular-nums text-gold-400/60">{l.idx}</span>
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            {account && (
              <Link
                to={account.to}
                className={`flex items-center gap-1.5 text-[0.82rem] font-medium transition-colors ${
                  account.prominent ? 'text-gold-300 hover:text-gold-200' : 'text-bone/65 hover:text-bone'
                }`}
              >
                <account.icon size={14} />
                {account.label}
              </Link>
            )}
            <Link to="/book" className="btn-gold text-[0.72rem]">
              Book a Chair
            </Link>
          </div>

          <div className="flex items-center gap-2.5 lg:hidden">
            <Link to="/book" className="btn-gold text-[0.68rem] px-4 py-2.5">
              Book
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-bone"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-b border-[var(--rule)] bg-onyx-950/97 backdrop-blur-xl lg:hidden"
          >
            <div className="shell flex flex-col py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-[var(--rule)] py-4 text-base font-medium text-bone/80"
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-gold-400/60">{l.idx}</span>
                  {l.label}
                </a>
              ))}
              {account && (
                <Link
                  to={account.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 border-b border-[var(--rule)] py-4 text-base font-medium ${account.prominent ? 'text-gold-300' : 'text-bone/80'}`}
                >
                  <account.icon size={17} /> {account.label}
                </Link>
              )}
              <Link to="/book" onClick={() => setOpen(false)} className="btn-gold mt-5 w-full">
                Book a Chair
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
