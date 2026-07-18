import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shop } from '../data'
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

export default function Nav() {
  const [open, setOpen] = useState(false)
  const account = useAccountLink()

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-onyx-950 border-b border-white/10">
      <nav className="shell flex h-20 items-center justify-between lg:h-24">
        <a href="#top" className="flex items-center gap-4" aria-label="Magic Cuts home">
          <img src="/logo-mark.png" alt="" className="h-11 w-auto lg:h-12" />
          <span className="font-display text-3xl font-bold uppercase tracking-[0.05em] text-bone lg:text-4xl">
            Magic Cuts
          </span>
        </a>

        <div className="hidden items-center gap-12 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative py-2 font-display text-lg font-bold uppercase tracking-[0.12em] text-bone/70 transition-colors hover:text-bone"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold-300 transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-9 lg:flex">
          {account && (
            <Link
              to={account.to}
              className={`font-display text-lg font-bold uppercase tracking-[0.12em] transition-colors ${
                account.prominent ? 'text-gold-300 hover:text-gold-200' : 'text-bone/70 hover:text-bone'
              }`}
            >
              {account.label}
            </Link>
          )}
          <a href={shop.phoneHref} className="font-mono text-sm text-bone/80 transition-colors hover:text-gold-300">
            {shop.phone}
          </a>
          <Link to="/book" className="btn-gold text-base">
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-b border-white/10 bg-onyx-950 lg:hidden"
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
