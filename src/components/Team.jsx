import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { barbers } from '../data'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

export default function Team() {
  const navigate = useNavigate()

  return (
    <section id="team" className="relative py-24 sm:py-32">
      {/* subtle top glow */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(199,154,58,0.3), transparent)' }}
      />

      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            eyebrow="Meet the Team"
            title="Your chair, your"
            accent="barber."
            intro="Pick who you want before you walk in. Every barber at Magic Cuts has a specialty — and a chair with your name on it."
          />
          <Reveal delay={0.1}>
            <button onClick={() => navigate('/book')} className="btn-gold shrink-0">
              Book Your Barber
            </button>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {barbers.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08]"
              onClick={() => navigate(`/book?barber=${b.id}`)}
            >
              {/* photo */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-onyx-900">
                <img
                  src={b.photo}
                  alt={b.name}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* fallback while photo loads */}
                <div className="absolute inset-0 hidden items-center justify-center bg-onyx-800" style={{ display:'none' }}>
                  <span className="font-display text-6xl text-gold-300/40">
                    {b.name.startsWith('[') ? 'MC' : b.name.charAt(0)}
                  </span>
                </div>
                {/* bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-onyx-950 via-onyx-950/60 to-transparent" />
              </div>

              {/* info */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="eyebrow text-[0.58rem]">{b.title}</p>
                <h3 className="mt-1.5 font-display text-2xl text-bone">{b.name}</h3>
                <p className="mt-1.5 text-sm leading-snug text-bone/60">{b.bio}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {b.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-gold-300/25 bg-gold-300/10 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-gold-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-gold-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {b.name.startsWith('[') ? 'Book this barber →' : `Book with ${b.name.split(' ')[0]} →`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
