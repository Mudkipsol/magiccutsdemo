import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shop, barbers } from '../data'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// Captions come from the roster so names and titles can never drift from data.js
const photos = [
  {
    src: '/shop-interior.webp',
    alt: 'Magic Cuts shop interior',
    caption: 'The shop floor, where the work gets done.',
    span: 'col-span-2',
  },
  {
    src: '/shop-group.jpg',
    alt: 'The Magic Cuts team',
    caption: 'The full team.',
    span: '',
  },
  ...barbers.map((b) => ({
    src: b.photo,
    alt: `${b.name}, ${b.title}`,
    caption: `${b.name} · ${b.title}`,
    span: '',
  })),
]

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState(null) // index or null

  const prev = () => setLightbox((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setLightbox((i) => (i + 1) % photos.length)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-onyx-950 pt-32 pb-24 lg:pt-40">
        <div className="shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-[clamp(2.8rem,5.5vw,6rem)] font-bold uppercase leading-[0.92] text-bone">
              Inside <span className="gold-text">Magic Cuts.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-bone/55">
              A look at the chairs, the craft, and the people behind every cut.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <motion.button
                key={p.src}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-[2px] bg-onyx-900 ${p.span} ${
                  i === 0 ? 'aspect-video' : 'aspect-[3/4]'
                }`}
                aria-label={`View ${p.alt}`}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-950/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 translate-y-full p-4 text-left font-mono text-xs text-bone transition-transform duration-300 group-hover:translate-y-0">
                  {p.caption}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-3xl font-bold uppercase text-bone">Follow for fresh cuts</p>
              <p className="mt-2 max-w-sm text-sm text-bone/55">
                Real work, real clients, real results, posted regularly.
              </p>
            </div>
            <a
              href={shop.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn-gold shrink-0 self-start sm:self-auto"
            >
              {shop.instagramHandle}
            </a>
          </div>
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-onyx-950/95 backdrop-blur-md"
              onClick={() => setLightbox(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-4 z-[91] flex items-center justify-center"
            >
              <div className="relative flex max-h-full max-w-3xl flex-col items-center gap-4">
                <img
                  src={photos[lightbox].src}
                  alt={photos[lightbox].alt}
                  className="max-h-[80vh] max-w-full rounded-[2px] object-contain"
                />
                <p className="font-mono text-xs text-bone/60">{photos[lightbox].caption}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[2px] border border-white/15 bg-onyx-900/80 font-display text-2xl text-bone hover:border-gold-300/40 hover:text-gold-300 sm:left-4"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[2px] border border-white/15 bg-onyx-900/80 font-display text-2xl text-bone hover:border-gold-300/40 hover:text-gold-300 sm:right-4"
                aria-label="Next photo"
              >
                ›
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/15 bg-onyx-900/80 font-display text-xl text-bone hover:border-gold-300/40 hover:text-gold-300 sm:right-4 sm:top-4"
                aria-label="Close lightbox"
              >
                ×
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
