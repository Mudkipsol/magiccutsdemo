import Reveal from './Reveal'

// A deliberate quiet, full-bleed moment between the busy sections — no card, no
// grid, just one confident line in a lot of ink. The tonal breath of the page.
export default function Statement() {
  return (
    <section className="relative border-t border-[var(--rule)] py-28 sm:py-40">
      <div className="shell text-center">
        <Reveal y={14}>
          <span className="mx-auto block h-px w-12 bg-gold-400/50" />
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mx-auto mt-10 max-w-4xl font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-medium leading-[1.18] tracking-[-0.02em] text-bone text-balance">
            Forty minutes in the chair. A week of looking like you{' '}
            <span className="italic font-normal">meant it</span>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
