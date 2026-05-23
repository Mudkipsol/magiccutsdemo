import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Scissors } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-onyx-950 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-300/25 bg-gold-300/10">
          <Scissors size={32} className="text-gold-300" />
        </div>

        <div>
          <p className="eyebrow mb-3">
            <span className="h-px w-8 bg-gold-300/60" />
            404
          </p>
          <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-none tracking-tight text-bone">
            Wrong chair.
          </h1>
          <p className="mt-4 max-w-sm text-lg text-bone/55">
            This page doesn't exist — but a great cut does. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-ghost">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <Link to="/book" className="btn-gold">
            Book a Chair
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
