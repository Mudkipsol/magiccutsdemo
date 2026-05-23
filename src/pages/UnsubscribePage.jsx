import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Mail, ArrowLeft } from 'lucide-react'

export default function UnsubscribePage() {
  const [params] = useSearchParams()
  const email = params.get('email') || ''
  const phone = params.get('phone') || ''
  const type = params.get('type') || 'email'

  const [status, setStatus] = useState('idle') // idle | loading | done | error

  const confirm = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, type }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-onyx-950 px-6 text-center">
      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 text-sm text-bone/40 hover:text-bone">
        <ArrowLeft size={15} /> Magic Cuts
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {status === 'done' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/10">
              <Check size={28} className="text-gold-300" />
            </div>
            <h1 className="font-display text-2xl text-bone">You're unsubscribed.</h1>
            <p className="text-sm text-bone/50">
              We've removed {email || phone} from our{' '}
              {type === 'all' ? 'email and SMS lists' : `${type} list`}.
            </p>
            <Link to="/" className="btn-ghost mt-2 text-sm">Back to site</Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Mail size={28} className="text-bone/50" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-bone">Unsubscribe</h1>
              <p className="mt-2 text-sm text-bone/55">
                {email || phone
                  ? `Remove ${email || phone} from our ${type === 'all' ? 'marketing lists' : `${type} list`}?`
                  : 'Confirm your unsubscribe request below.'}
              </p>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
            )}
            <div className="flex w-full gap-3">
              <Link to="/" className="btn-ghost flex-1 text-sm">Cancel</Link>
              <button
                onClick={confirm}
                disabled={status === 'loading'}
                className="btn-gold flex-1 text-sm"
              >
                {status === 'loading' ? 'Processing…' : 'Unsubscribe'}
              </button>
            </div>
            <p className="text-xs text-bone/30">
              Changed your mind?{' '}
              <a href="mailto:hello@magicutsalon.com" className="text-gold-300 hover:underline">
                Contact us
              </a>{' '}
              to re-subscribe.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
