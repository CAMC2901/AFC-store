import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (p: P) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z" />
    <path d="M3.3 7.5 12 12.2l8.7-4.7" />
    <path d="M12 12.2V22" />
  </svg>
);

export const IconHeart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.7-9.3-9.1C1.4 7.9 3.2 5 6.2 5c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3 0 4.8 2.9 3.5 5.9C15.5 15.3 12 20 12 20Z" />
  </svg>
);

export const IconAddress = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
