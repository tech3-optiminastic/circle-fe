import React from 'react';

/**
 * Optiminastic brand mark — the CMYK overlapping-circles motif (cyan / magenta /
 * yellow blended with multiply) that forms the "O" in the Optiminastic logo.
 * Sits on a rounded white tile so the colour blend renders consistently on any
 * background (light surfaces and the crimson brand chips alike).
 *
 * To use the exact brand asset instead, drop it in `public/logo.svg` and swap
 * this for an <img src="/logo.svg" />.
 */
export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const multiply: React.CSSProperties = { mixBlendMode: 'multiply' };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Optiminastic × Circle"
      className={className}
    >
      {/* Isolate so the multiply blend mixes the circles against the white tile,
          not against whatever is behind the logo. */}
      <g style={{ isolation: 'isolate' }}>
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#ffffff" />
        {/* Centres separated by ~one radius → each pair overlaps by about half. */}
        <circle cx="18.5" cy="20" r="10.5" fill="#00AEEF" style={multiply} />
        <circle cx="29.5" cy="20" r="10.5" fill="#EC008C" style={multiply} />
        <circle cx="24" cy="29.5" r="10.5" fill="#FFF200" style={multiply} />
      </g>
    </svg>
  );
}

export default Logo;
