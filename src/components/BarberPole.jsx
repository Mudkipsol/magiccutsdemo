// CSS-animated barber pole. Self-contained, no images.
export default function BarberPole({ className = '' }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* cap */}
      <div className="mx-auto h-5 w-[58px] rounded-t-full bg-gradient-to-b from-gold-100 to-gold-500 shadow-gold" />
      <div className="mx-auto -mt-1 h-3 w-[64px] rounded-full bg-gradient-to-b from-gold-200 to-gold-600" />
      {/* glass cylinder */}
      <div className="relative mx-auto mt-1 h-[260px] w-[52px] overflow-hidden rounded-full border border-white/10 bg-onyx-900 shadow-lift">
        <div
          className="absolute inset-0 animate-pole"
          style={{
            backgroundImage:
              'repeating-linear-gradient(48deg, #b91d2e 0 14px, #f4efe6 14px 28px, #1f5fb0 28px 42px, #f4efe6 42px 56px)',
            backgroundSize: '100% 56px',
          }}
        />
        {/* glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-black/40" />
        <div className="absolute left-1 top-0 h-full w-2 rounded-full bg-white/30 blur-[1px]" />
      </div>
      {/* base */}
      <div className="mx-auto -mt-1 h-3 w-[64px] rounded-full bg-gradient-to-b from-gold-200 to-gold-600" />
      <div className="mx-auto h-5 w-[58px] rounded-b-full bg-gradient-to-b from-gold-500 to-gold-100 shadow-gold" />
    </div>
  )
}
