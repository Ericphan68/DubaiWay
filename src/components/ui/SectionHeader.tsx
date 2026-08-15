import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconArrowRight } from './icons';

/**
 * Mẫu tiêu đề section chuẩn: eyebrow → tiêu đề serif → mô tả,
 * kèm Route Line hairline. Dùng mở đầu mọi section nội dung.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  link,
  tone = 'light',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  link?: { label: string; href: string };
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-full items-end gap-6',
          align === 'center' ? 'flex-col items-center' : 'justify-between',
        )}
      >
        <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
          {eyebrow && (
            <span className="eyebrow">
              <span className="route-dot" />
              {eyebrow}
            </span>
          )}
          <h2
            className={cn(
              'mt-3 text-display-md font-medium',
              dark ? 'text-white' : 'text-midnight',
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'mt-3 text-pretty text-base leading-relaxed',
                dark ? 'text-white/70' : 'text-ink-muted',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {link && align === 'left' && (
          <Link
            href={link.href}
            className={cn(
              'group hidden shrink-0 items-center gap-2 text-sm font-semibold sm:inline-flex',
              dark ? 'text-champagne-400' : 'text-royal',
            )}
          >
            {link.label}
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-dubaiway group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className={cn('route-line w-full', align === 'center' && 'max-w-xs')} />

      {link && align === 'center' && (
        <Link
          href={link.href}
          className={cn(
            'group inline-flex items-center gap-2 text-sm font-semibold',
            dark ? 'text-champagne-400' : 'text-royal',
          )}
        >
          {link.label}
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-dubaiway group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
