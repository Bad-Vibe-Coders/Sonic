import { useState } from 'react'

/**
 * Sonic icon-only mark.
 * Prefers the real artwork at /sonic-logo.png (transparent PNG — works on light & dark).
 * Falls back to the built-in SVG if that file isn't present yet.
 *
 * To use the reference logo: export the ICON-ONLY artwork as a transparent PNG
 * (e.g. 256×256) and save it to  prototype/sonic/public/sonic-logo.png
 */
let _id = 0
export default function Logo({ size = 28, className = '' }) {
  const [imgOk, setImgOk] = useState(true)
  const uid = `sonic-${++_id}`

  if (imgOk) {
    return (
      <img src="/sonic-logo.png" width={size} height={size} alt="Sonic"
        className={`object-contain ${className}`} style={{ width: size, height: size }}
        onError={() => setImgOk(false)} />
    )
  }

  // ---- SVG fallback (brand gradient, matches landing cyan→violet) ----
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="Sonic">
      <defs>
        <linearGradient id={`b-${uid}`} x1="10" y1="10" x2="54" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" /><stop offset="0.55" stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`n-${uid}`} x1="12" y1="34" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#243043" /><stop offset="1" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id={`v-${uid}`} x1="40" y1="8" x2="56" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M9 23 L36 9 L55 19 L28 33 Z" fill={`url(#b-${uid})`} />
      <path d="M44 14 L55 19 L48 27 L37 22 Z" fill={`url(#v-${uid})`} />
      <path d="M55 41 L28 55 L9 45 L36 31 Z" fill={`url(#n-${uid})`} />
      <path d="M28 33 L36 31 L36 33 L28 35 Z" fill="#0b1220" opacity="0.35" />
    </svg>
  )
}
