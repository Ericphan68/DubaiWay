import type { ActionType } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Hệ thống nhãn 3 loại hành động — giúp khách phân biệt rõ:
 *  - book    → Đặt trực tiếp với DubaiWay
 *  - quote   → Gửi yêu cầu để DubaiWay báo giá
 *  - partner → Chuyển sang nền tảng đối tác
 * Dùng nhất quán trên mọi card sản phẩm.
 */
export const actionMeta: Record<
  ActionType,
  { label: string; dot: string; text: string }
> = {
  book: { label: 'Đặt với DubaiWay', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  quote: { label: 'Yêu cầu báo giá', dot: 'bg-royal', text: 'text-royal' },
  partner: { label: 'Chuyển đối tác', dot: 'bg-champagne-600', text: 'text-champagne-600' },
};

export function ActionBadge({
  action,
  className,
}: {
  action: ActionType;
  className?: string;
}) {
  const meta = actionMeta[action];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold',
        meta.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
