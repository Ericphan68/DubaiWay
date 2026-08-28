import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Bốn trạng thái giao diện bắt buộc: đang tải, rỗng, lỗi, thành công.
 * Gom một chỗ để mọi trang hiển thị nhất quán, không mỗi nơi một kiểu.
 */

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-mist bg-ivory-100 px-6 py-14 text-center', className)}>
      {children}
    </div>
  );
}

export function LoadingState({ title, body }: { title?: string; body?: string }) {
  return (
    <Shell>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-mist border-t-champagne" aria-hidden />
      <p className="mt-4 font-display text-lg text-midnight">{title ?? 'Đang tải…'}</p>
      {body ? <p className="mt-1 max-w-md text-sm text-ink-muted">{body}</p> : null}
      <span className="sr-only" role="status">Đang tải nội dung</span>
    </Shell>
  );
}

export function EmptyState({
  title, body, action,
}: {
  title: string;
  body?: string;
  action?: { label: string; href: string };
}) {
  return (
    <Shell>
      {/* Không dùng kính lúp: "chưa có dữ liệu" khác hẳn "tìm không ra".
          Kính lúp khiến người xem tưởng vừa có một cuộc tìm kiếm thất bại.
          Ô rỗng có đường gạch ngang nói đúng hơn: chỗ này để trống, chờ được điền. */}
      <svg viewBox="0 0 48 48" className="h-11 w-11 text-mist-400" fill="none" aria-hidden>
        <rect x="7" y="11" width="34" height="26" rx="4" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4" />
        <path d="M16 24h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <p className="mt-4 font-display text-lg text-midnight">{title}</p>
      {body ? <p className="mt-1 max-w-md text-sm text-ink-muted">{body}</p> : null}
      {action ? (
        <Button href={action.href} variant="outline" size="sm" className="mt-5">{action.label}</Button>
      ) : null}
    </Shell>
  );
}

export function ErrorState({
  title, body, retryHref,
}: {
  title?: string;
  body?: string;
  retryHref?: string;
}) {
  return (
    <Shell className="border-red-200 bg-red-50/40">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-red-400" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
        <path d="M24 15v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="33" r="1.6" fill="currentColor" />
      </svg>
      <p className="mt-4 font-display text-lg text-midnight">{title ?? 'Đã xảy ra lỗi'}</p>
      <p className="mt-1 max-w-md text-sm text-ink-muted">
        {body ?? 'Chúng tôi không tải được dữ liệu. Vui lòng thử lại sau ít phút.'}
      </p>
      {retryHref ? (
        <Button href={retryHref} variant="outline" size="sm" className="mt-5">Thử lại</Button>
      ) : null}
    </Shell>
  );
}

export function SuccessState({
  title, body, action, children,
}: {
  title: string;
  body?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <Shell className="border-emerald-200 bg-emerald-50/40">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-emerald-500" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
        <path d="M16 24.5l5.5 5.5L32 19.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mt-4 font-display text-lg text-midnight">{title}</p>
      {body ? <p className="mt-1 max-w-md text-sm text-ink-muted">{body}</p> : null}
      {children}
      {action ? (
        <Button href={action.href} variant="primary" size="sm" className="mt-5">{action.label}</Button>
      ) : null}
    </Shell>
  );
}

/** Khung xương khi đang tải danh sách dịch vụ. */
export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-ivory-100">
      <div className="aspect-[4/3] animate-pulse bg-mist-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-mist-200" />
        <div className="h-4 w-full animate-pulse rounded bg-mist-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-mist-200" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-mist-200" />
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => <ServiceCardSkeleton key={i} />)}
    </div>
  );
}
