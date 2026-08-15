import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'gold' | 'navy' | 'outline' | 'ghost' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  // Nút chính: nền Royal Gold, chữ trắng.
  primary: 'bg-champagne text-white hover:bg-champagne-600 shadow-sm hover:shadow-md',
  gold: 'bg-champagne text-white hover:bg-champagne-600 shadow-sm hover:shadow-md',
  // Nút phụ: nền navy, chữ trắng.
  navy: 'bg-midnight text-white hover:bg-midnight-800 shadow-sm hover:shadow-md',
  // Nút outline: viền navy, nền trong suốt.
  outline: 'border border-midnight/25 text-midnight hover:border-champagne hover:text-champagne-600 hover:bg-champagne/[0.05]',
  ghost: 'text-midnight hover:bg-midnight/[0.05]',
  onDark: 'border border-white/30 text-white hover:bg-white/10 hover:border-champagne-400 hover:text-champagne-400',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-13 px-8 text-base',
};

const shared =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-dubaiway disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', className, children, href, ...rest } = props;
  const classes = cn(shared, variants[variant], sizes[size], className);

  if (typeof href === 'string') {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = href.startsWith('http');
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...anchorRest}
      >
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
