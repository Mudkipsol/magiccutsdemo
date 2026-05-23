import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ChevronLeft, ChevronRight, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shop, barbers } from '../data'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const photos = [
  {
    src: '/shop-interior.webp',
    alt: 'Magic Cuts shop interior',
    caption: 'The shop floor — where the work gets done.',
    span: 'col-span-2',
  },
  {
    src: '/shop-group.jpg',
    alt: 'The Magic Cuts team',
    caption: 'The full team.',
    span: '',
  },
  {
    src: '/barbers/barber1.jpg',
    alt: 'Bashaar — Lead Barber',
    caption: 'Bashaar · Lead Barber',
    span: '',
  },
  {
    src: '/barbers/barber2.jpg',
    alt: 'Alejandro — Senior Barber',
    caption: 'Alejandro · Senior Barber',
    span: '',
  },
  {
    src: '/barbers/barber3.jpg',
    alt: 'Bebo — Barber',
    caption: 'Bebo · Barber',
    span: '',
  },
]

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState(null) // index or null

  const prev = () => setLightbox((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setLightbox((i) => (i + 1) % photos.length)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-onyx-950 pt-28 pb-24">
        <div className="shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="eyebrow">
              <span className="h-px w-8 bg-gold-300/60" />
              The Shop
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-tight tracking-tight text-bone">
              Inside Magic Cuts.
            </h1>
            <p className="mt-3 max-w-lg text-lg text-bone/55">
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
                className={`group relative overflow-hidden rounded-2xl bg-onyx-900 ${p.span} ${
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
                <p className="absolute bottom-0 left-0 right-0 translate-y-full p-4 text-sm font-medium text-bone transition-transform duration-300 group-hover:translate-y-0">
                  {p.caption}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-gold-300/15 bg-gold-300/5 px-8 py-10 text-center">
            <p className="font-display text-2xl text-bone">Follow for fresh cuts</p>
            <p className="max-w-sm text-sm text-bone/55">
              Real work, real clients, real results — posted regularly on Instagram.
            </p>
            <a
              href={shop.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
            >
              <Instagram size={16} />
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
                  className="max-h-[80vh] max-w-full rounded-2xl object-contain"
                />
                <p className="text-sm text-bone/60">{photos[lightbox].caption}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-onyx-900/80 text-bone hover:border-gold-300/40 hover:text-gold-300"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-onyx-900/80 text-bone hover:border-gold-300/40 hover:text-gold-300"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-onyx-900/80 text-bone hover:border-gold-300/40 hover:text-gold-300"
                aria-label="Close lightbox"
              >
                <X size={16} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
