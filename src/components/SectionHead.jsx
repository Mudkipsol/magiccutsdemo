import Reveal from './Reveal'

export default function SectionHead({ eyebrow, title, accent, intro, align = 'left' }) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Reveal>
        <p className={`eyebrow ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-gold-300/60" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone text-balance">
          {title} {accent && <span className="gold-text italic">{accent}</span>}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-bone/60">{intro}</p>
        </Reveal>
      )}
    </div>
  )
}
