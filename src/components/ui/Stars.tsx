import { cn } from '@/lib/utils';
import { IconStar } from './icons';

/** Hiển thị hạng sao khách sạn / mức đánh giá. */
export function Stars({
  count,
  className,
  size = 14,
}: {
  count: number;
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-champagne', className)} aria-label={`${count} sao`}>
      {Array.from({ length: count }).map((_, i) => (
        <IconStar key={i} width={size} height={size} />
      ))}
    </span>
  );
}
