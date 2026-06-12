import React from 'react';

/**
 * Brand mark — a single flowing line that rises into two waves and resolves in a
 * small loop, with a ™ to the upper-right. Monochrome and stroke-based, so it
 * inherits the surrounding text colour (use `text-*` to recolour).
 *
 * `size` sets the rendered height; width follows the mark's natural aspect ratio.
 * To use the exact brand asset instead, drop it in `public/logo.svg` and swap
 * this for an <img src="/logo.svg" />.
 */
const ASPECT = 206 / 112; // viewBox width / height

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={Math.round(size * ASPECT)}
      height={size}
      viewBox="0 0 206 112"
      role="img"
      aria-label="Curcle"
      fill="none"
      className={`text-gray-900 ${className}`}
    >
      <path
        d="M12 74 C24 74 27 82 38 79 C50 76 49 30 66 28 C84 26 82 86 100 84 C116 82 115 44 131 46 C144 48 147 66 157 66 C165 66 168 57 161 55 C155 53 156 66 166 67 C174 68 181 67 188 66"
        stroke="currentColor"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="190"
        y="50"
        fontSize="15"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="600"
        fill="currentColor"
      >
        ™
      </text>
    </svg>
  );
}

export default Logo;
