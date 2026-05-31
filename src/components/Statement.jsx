import Reveal from './Reveal'

// A deliberate "quiet" full-bleed moment between the busy grid sections — no
// card, no grid, no chrome. Just one confident line in a lot of black. This is
// the tonal break the page needs so every section doesn't read the same.
export default function Statement() {
  return (
    <section className="relative py-32 sm:py-44">
      <div className="shell text-center">
        <Reveal>
          <span className="mx-auto block h-px w-12 bg-gold-300/50" />
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mx-auto mt-10 max-w-4xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-medium leading-[1.15] tracking-[-0.015em] text-bone text-balance">
            Forty minutes in the chair. A week of looking like you{' '}
            <span className="italic text-gold-300">meant it</span>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
