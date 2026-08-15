import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Logo DubaiWay: dấu ấn hình cánh cung "Route Line" (một chặng bay) + wordmark serif.
 * Vàng champagne cho biểu tượng, đúng nhận diện brand.
 */
export function Logo({
  tone = 'dark',
  className,
}: {
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const wordmark = tone === 'light' ? 'text-white' : 'text-midnight';

  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="DubaiWay — trang chủ">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden className="shrink-0">
        <circle cx="17" cy="17" r="16" stroke="#B88A3B" strokeWidth="1.2" opacity="0.5" />
        <path
          d="M7 22C11 12 23 12 27 22"
          stroke="#B88A3B"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1.5 3"
        />
        <path d="M7 22 17 8l10 14" stroke="#B88A3B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0" />
        <circle cx="7" cy="22" r="2" fill="#B88A3B" />
        <circle cx="27" cy="22" r="2" fill="#B88A3B" />
        <path d="M17 6l1.4 3 3 .3-2.3 2 .7 3-2.8-1.6L14 15l.7-3-2.3-2 3-.3L17 6Z" fill="#B88A3B" />
      </svg>
      <span className={cn('font-display text-xl font-semibold leading-none tracking-tight', wordmark)}>
        DubaiWay
      </span>
    </Link>
  );
}
