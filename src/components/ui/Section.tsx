import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Background = 'ivory' | 'white' | 'mist' | 'midnight';

const backgrounds: Record<Background, string> = {
  ivory: 'bg-ivory text-ink',
  white: 'bg-ivory-100 text-ink',
  mist: 'bg-mist-200 text-ink',
  midnight: 'bg-midnight text-white',
};

/** Khung section chuẩn: nền + khoảng đệm dọc + shell canh giữa. */
export function Section({
  children,
  background = 'ivory',
  className,
  innerClassName,
  as: Tag = 'section',
  id,
}: {
  children: ReactNode;
  background?: Background;
  className?: string;
  innerClassName?: string;
  as?: ElementType;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn('py-16 sm:py-20 lg:py-24', backgrounds[background], className)}>
      <div className={cn('shell', innerClassName)}>{children}</div>
    </Tag>
  );
}
