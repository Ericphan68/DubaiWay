import type { ReactNode } from 'react';
import { IconSearch } from './icons';

/** Trạng thái rỗng — hướng người dùng hành động, không chỉ báo "trống". */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-mist-400 bg-ivory-100 px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist-200 text-ink-soft">
        <IconSearch className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-xl font-medium text-midnight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
