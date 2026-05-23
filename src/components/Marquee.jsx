import { Sparkle } from './Icons'

const items = [
  'Precision Cuts',
  'Straight-Razor Shaves',
  'Beard Craft',
  'Walk-Ins Welcome',
  'Est. 2023',
  'Dublin, Ohio',
  'Skin Fades',
  'First Chair for Kids',
]

export default function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="group relative overflow-hidden border-y border-white/10 bg-onyx-900/60 py-5 cursor-default select-none">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-xl italic text-bone/80 transition-colors duration-300 group-hover:text-bone/60">{t}</span>
            <Sparkle className="h-3.5 w-3.5 text-gold-300 transition-opacity duration-300 group-hover:opacity-50" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-onyx-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-onyx-950 to-transparent" />
    </div>
  )
}
