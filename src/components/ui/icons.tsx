import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconLuggage = (p: IconProps) => (
  <svg {...base(p)}><rect x="6" y="7" width="12" height="13" rx="2" /><path d="M9 7V4h6v3M10 11v5M14 11v5" /></svg>
);
export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" /></svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconWhatsapp = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" /><path d="M8.5 8.8c0-.4.3-.6.6-.6h.7c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.4 0 .6a6 6 0 0 0 2.6 2.4c.2.1.4 0 .6-.1l.5-.6c.2-.2.4-.2.6-.1l1.4.7c.2.1.3.3.3.5v.7c0 .4-.3.7-.7.8-1.4.2-3.3-.4-5-2.1-1.7-1.7-2.3-3.6-2.5-5Z" fill="currentColor" stroke="none" /></svg>
);
export const IconHome = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>
);
export const IconCompass = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>
);
export const IconPassport = (p: IconProps) => (
  <svg {...base(p)}><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9.5 16h5" /></svg>
);
export const IconPlane = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 15.5 3.5 12v-2l7 1 3-6 2 .5-1.5 6 5 1 1 3-1.5-.5Z" /></svg>
);
export const IconBed = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 8v10M3 12h18v6M21 12v-1a3 3 0 0 0-3-3H9v4" /><circle cx="6.5" cy="9.5" r="1.5" /></svg>
);
export const IconStar = (p: IconProps) => (
  <svg {...base(p)}><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8L12 3Z" fill="currentColor" stroke="none" /></svg>
);
export const IconMapPin = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 21c4-4 7-7.4 7-11a7 7 0 1 0-14 0c0 3.6 3 7 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 9h17M8 3v4M16 3v4" /></svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6a3 3 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9" /></svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const IconQuote = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 7c-2.5 0-4 2-4 4.5V17h5v-5H7c0-1.6.8-2.5 2-2.5V7Zm9 0c-2.5 0-4 2-4 4.5V17h5v-5h-3c0-1.6.8-2.5 2-2.5V7Z" fill="currentColor" stroke="none" /></svg>
);
export const IconShield = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3 5 6v5c0 4.3 3 7.7 7 9 4-1.3 7-4.7 7-9V6l-7-3Z" /><path d="m9.5 12 1.8 1.8 3.2-3.4" /></svg>
);
export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3c.6 3.7 1.7 4.8 5.4 5.4-3.7.6-4.8 1.7-5.4 5.4-.6-3.7-1.7-4.8-5.4-5.4C10.3 7.8 11.4 6.7 12 3Z" fill="currentColor" stroke="none" /><path d="M18.5 14c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" fill="currentColor" stroke="none" /></svg>
);
export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" /></svg>
);
export const IconAnchor = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="5" r="2" /><path d="M12 7v13M6 12H4a8 8 0 0 0 16 0h-2M8 11l-4 1M16 11l4 1" /></svg>
);
export const IconCar = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 16v-4l2-5h12l2 5v4M4 16h16M4 16v2M20 16v2" /><circle cx="7.5" cy="16" r="1.5" /><circle cx="16.5" cy="16" r="1.5" /></svg>
);
export const IconFacebook = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l.5-3H14V8.5c0-.3.2-.5.5-.5Z" fill="currentColor" stroke="none" /></svg>
);
export const IconInstagram = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.5" /><circle cx="16.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" /></svg>
);
export const IconYoutube = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="12" rx="3.5" /><path d="m11 9.5 4 2.5-4 2.5v-5Z" fill="currentColor" stroke="none" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
);

export const iconMap = {
  home: IconHome,
  user: IconUser,
  search: IconSearch,
  compass: IconCompass,
  passport: IconPassport,
  whatsapp: IconWhatsapp,
} as const;
