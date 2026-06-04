import React from 'react';

/**
 * Curcle brand mark — a "C" formed by four teal/cyan ring segments (gap on the
 * right) around a soft gray center dot. Fixed brand colors (independent of the
 * app theme palette).
 */
export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Curcle"
      className={className}
    >
      {/* ring segments (clockwise from the bottom of the right-side gap) */}
      <g fill="none" strokeWidth="8" strokeLinecap="butt">
        {/* bottom-right — darkest */}
        <path d="M36.29 32.60 A15 15 0 0 1 19.48 38.30" stroke="#0F7C96" />
        {/* bottom-left — medium teal */}
        <path d="M19.48 38.30 A15 15 0 0 1 9 24" stroke="#1AA2C0" />
        {/* upper-left — bright cyan */}
        <path d="M9 24 A15 15 0 0 1 19.48 9.70" stroke="#2FC5E6" />
        {/* top-right — pale cyan */}
        <path d="M19.48 9.70 A15 15 0 0 1 36.29 15.40" stroke="#C5EAF4" />
      </g>
      {/* center dot */}
      <circle cx="24" cy="24" r="5.5" fill="#D8DBDE" />
    </svg>
  );
}

export default Logo;
