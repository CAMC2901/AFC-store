import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (props: IconProps) => ({
  width: props.size ?? 24,
  height: props.size ?? 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const IconCart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 7h14l-1.5 10.5a2 2 0 0 1-2 1.5H9.5a2 2 0 0 1-2-1.5L6 7Z" />
    <path d="M6 7 4.8 4.6A1.5 1.5 0 0 0 3.4 3.7H2" />
    <path d="M9.5 11v2" />
    <path d="M14.5 11v2" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.7-9.3-9.1C1.4 7.9 3.2 5 6.2 5c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3 0 4.8 2.9 3.5 5.9C15.5 15.3 12 20 12 20Z" />
  </svg>
);

export const IconHeartFilled = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 20s-7.5-4.7-9.3-9.1C1.4 7.9 3.2 5 6.2 5c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3 0 4.8 2.9 3.5 5.9C15.5 15.3 12 20 12 20Z" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const IconMinus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
  </svg>
);

export const IconStarHalf = (p: IconProps) => (
  <svg {...base(p)} stroke="none">
    <path
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z"
      fill="currentColor"
    />
    <path d="M12 2.5v15l-5.9 3 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" fill="url(#half)" />
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="#E5E7EB" />
        <stop offset="50%" stopColor="#E5E7EB" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export const IconTruck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 6h11v11H2z" />
    <path d="M13 10h4l4 4v3h-8z" />
    <circle cx="6.5" cy="18.5" r="1.8" />
    <circle cx="17.5" cy="18.5" r="1.8" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconTag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3h7l11 11-7 7L3 10V3Z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
);

export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const IconPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01" />
    <path d="M11 12h1v4h1" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const IconWhatsApp = (p: IconProps) => (
  <svg {...base(p)} stroke="none" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.5-1.2-2.9s.7-2.1 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .4-.1.2-.2.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.7.9.9 1.7 1.2 1.9 1.3.3.1.4.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.1Z" />
  </svg>
);

export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </svg>
);

export const IconList = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="16" height="5" rx="1" />
    <rect x="4" y="14" width="16" height="5" rx="1" />
  </svg>
);

export const IconSliders = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const IconBox = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z" />
    <path d="M3.3 7.5 12 12.2l8.7-4.7" />
    <path d="M12 12.2V22" />
  </svg>
);

export const IconPackage = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
    <path d="M7.5 4.6l9 5.2" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c1-3 3.5-4.5 6.5-4.5s5.5 1.5 6.5 4.5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16 15.7c2.4.3 4.2 1.6 5 3.3" />
  </svg>
);

export const IconDollar = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18" />
    <path d="M16.5 6.5c-1-1.5-2.5-2-4.5-2-2.5 0-4.5 1.3-4.5 3.5S11 11.4 12 12s4.5.7 4.5 3-1.9 3.5-4.5 3.5c-2 0-3.5-.7-4.5-2" />
  </svg>
);

export const IconChart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-5 3 3 5-7" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconRuler = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="9" width="19" height="6" rx="1" transform="rotate(-20 12 12)" />
    <path d="m8 12 1 1.5" transform="rotate(-20 12 12)" />
    <path d="m12 11 1 1.5" transform="rotate(-20 12 12)" />
    <path d="m16 10 1 1.5" transform="rotate(-20 12 12)" />
  </svg>
);

export const IconWeight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v4" />
    <path d="M8.5 8h7l1.5 12a1 1 0 0 1-1 1.2H8a1 1 0 0 1-1-1.2L8.5 8Z" />
    <path d="M12 4a2 2 0 0 0-2 2v0h4v0a2 2 0 0 0-2-2Z" />
  </svg>
);

export const IconZoom = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
    <path d="M11 8v6" />
    <path d="M8 11h6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 3v6h-6" />
  </svg>
);

export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />
  </svg>
);

export const IconInstagram = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const IconFacebook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IconPinterest = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 20.5 11 13m-1.3-1.2a3 3 0 1 1 4.4 2.6c-.8.5-1.6.7-2.1-.2" />
  </svg>
);

export const IconTwitter = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
);

export const IconLeaf = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20C4 9 11 4 21 4c0 10-5 16-17 16Z" />
    <path d="M4 20c2-7 7-12 13-14" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3 3.9M6.6 6.6A16.8 16.8 0 0 0 2 12s3.5 7 10 7a9.9 9.9 0 0 0 4.3-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const IconAddress = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const IconBot = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <path d="M12 8V5M12 5a2 2 0 0 0-2-2M12 5a2 2 0 0 1 2-2" />
    <path d="M9 13h.01M15 13h.01" />
    <path d="M9 16h6" />
  </svg>
);

export const IconStar2 = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m12 2 1.7 4.7 5 .4-3.8 3.2 1.2 4.9L12 12.6l-4.1 2.6 1.2-4.9-3.8-3.2 5-.4L12 2Z" />
  </svg>
);

export const IconThumbsUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 10v11M7 10l4-7a2.5 2.5 0 0 1 4.5 1.5V9h4a2 2 0 0 1 2 2.3l-1 6A3 3 0 0 1 17.5 20H7" />
  </svg>
);

export const IconFlag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 3v18" />
    <path d="M5 4h12l-2 4 2 4H5" />
  </svg>
);

export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </svg>
);

export const IconCompare = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="m21 3-7 7" />
    <path d="m3 21 7-7" />
  </svg>
);

export const IconQr = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14h1M14 20h3M18 18h3M20 21h0" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export const IconCart2 = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
