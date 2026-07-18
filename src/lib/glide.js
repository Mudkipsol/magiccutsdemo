// JS-driven anchor glide. CSS scroll-behavior:smooth is disabled by Chrome
// whenever the OS has reduced-motion set, which silently turns every anchor
// click into a snap. This animates the scroll itself so the glide always runs.

let raf = null
let cleanup = null

function cancelGlide() {
  if (raf) cancelAnimationFrame(raf)
  raf = null
  if (cleanup) {
    cleanup()
    cleanup = null
  }
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function glideTo(targetY) {
  cancelGlide()
  const startY = window.scrollY
  const dist = targetY - startY
  if (Math.abs(dist) < 1) return

  // Distance-scaled duration: short hops stay quick, page-length jumps glide.
  const duration = Math.min(1200, Math.max(550, Math.abs(dist) * 0.35))
  const t0 = performance.now()

  // A wheel or touch from the user takes the scroll back immediately.
  const onUser = () => cancelGlide()
  window.addEventListener('wheel', onUser, { passive: true })
  window.addEventListener('touchstart', onUser, { passive: true })

  // If frames never arrive (tab hidden mid-glide), land at the target.
  const watchdog = setTimeout(() => {
    window.scrollTo({ top: targetY, behavior: 'instant' })
    cancelGlide()
  }, duration + 500)

  cleanup = () => {
    clearTimeout(watchdog)
    window.removeEventListener('wheel', onUser)
    window.removeEventListener('touchstart', onUser)
  }

  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration)
    window.scrollTo({ top: startY + dist * easeInOutCubic(p), behavior: 'instant' })
    if (p < 1) {
      raf = requestAnimationFrame(step)
    } else {
      cancelGlide()
    }
  }
  raf = requestAnimationFrame(step)
}

// Delegated listener: catches every same-page hash link (nav, footer, hero)
// without each component needing to know about it.
export function installAnchorGlide({ headerOffset = 88 } = {}) {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest('a[href*="#"]')
    if (!a) return
    const url = new URL(a.getAttribute('href'), window.location.href)
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return
    const el = document.querySelector(url.hash)
    if (!el) return
    e.preventDefault()
    window.history.pushState(null, '', url.hash)
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset)
    glideTo(top)
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
