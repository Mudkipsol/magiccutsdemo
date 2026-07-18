import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-onyx-950 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8"
      >
        <img src="/logo-mark.png" alt="" className="h-16 w-auto select-none" />

        <div>
          <h1 className="font-display text-[clamp(3.5rem,10vw,7rem)] font-bold uppercase leading-none text-bone">
            Wrong <span className="gold-text">chair.</span>
          </h1>
          <p className="mt-5 max-w-sm text-lg text-bone/55">
            This page doesn't exist, but a great cut does. Let's get you back
            on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-ghost">
            Back to home
          </Link>
          <Link to="/book" className="btn-gold">
            Book a Chair
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
