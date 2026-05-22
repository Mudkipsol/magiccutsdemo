// Hand-built line icons. Stroke inherits currentColor.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function Scissors(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M8 7.5 20 17M8 16.5 20 7M11 12l-3 0" />
    </svg>
  )
}

export function Razor(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 11h13l4-4v-2l-4 4H3z" />
      <path d="M9 14v3a3 3 0 0 0 6 0v-3" />
    </svg>
  )
}

export function Beard(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 5c0 4 1 7 3 9 1.5 1.5 2.5 3 4 3s2.5-1.5 4-3c2-2 3-5 3-9" />
      <path d="M9 5c0 2 1 3 3 3s3-1 3-3" />
      <path d="M8.5 13.5c1 1 2 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
    </svg>
  )
}

export function Pole(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="9" y="5" width="6" height="14" rx="3" />
      <path d="M9 8l6-3M9 12l6-3M9 16l6-3" />
      <path d="M8 5h8M8 19h8" />
    </svg>
  )
}

export function Comb(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 9h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M6 14v4M10 14v4M14 14v4M18 14v4" />
    </svg>
  )
}

export function Spray(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="8" y="9" width="8" height="11" rx="2" />
      <path d="M10 9V6h4v3M14 6h3M19 5v2M19 9v.01M21 7h.01M17 4h.01" />
    </svg>
  )
}

export function Star(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.6 6.3 6.8.5-5.2 4.4 1.7 6.6L12 17.3 6.1 20.8l1.7-6.6L2.6 9.8l6.8-.5z" />
    </svg>
  )
}

export function Sparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.4 4.6 2.4 6.6 7 7-4.6.4-6.6 2.4-7 7-.4-4.6-2.4-6.6-7-7 4.6-.4 6.6-2.4 7-7z" />
    </svg>
  )
}

export const serviceIcon = {
  signature: Scissors,
  fade: Comb,
  'cut-beard': Beard,
  shave: Razor,
  beard: Beard,
  kids: Pole,
  color: Spray,
  style: Spray,
}
