import Reveal from './Reveal'

// Editorial section header: a numbered index (Nº 01) + a hairline + a tracked
// label, then an oversized Fraunces headline with an italic (not gold) accent.
// This indexed masthead is the page's recurring structural signature.
export default function SectionHead({ index, eyebrow, title, accent, intro, align = 'left', className = '' }) {
  const center = align === 'center'
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'} ${className}`}>
      <Reveal y={16}>
        <div className={`flex items-center gap-4 ${center ? 'justify-center' : ''}`}>
          {index && (
            <span className="font-display text-sm italic text-gold-400">Nº {index}</span>
          )}
          <span className="h-px w-10 bg-[var(--rule-strong)]" />
          <span className="kicker">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 font-display text-[clamp(2.3rem,5vw,3.7rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-bone text-balance">
          {title} {accent && <span className="italic font-normal text-bone/90">{accent}</span>}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-bone/55">{intro}</p>
        </Reveal>
      )}
    </div>
  )
}
