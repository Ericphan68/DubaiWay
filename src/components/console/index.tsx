import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconArrowRight } from '@/components/ui/icons';

/**
 * Thành phần dùng chung cho khu đối tác và khu quản trị.
 *
 * Nguyên tắc xuyên suốt: HÌNH THỨC PHẢI NÓI ĐÚNG NỘI DUNG.
 * Trước đây mọi con số nằm trong những ô giống hệt nhau, nên "1 hồ sơ đang chờ
 * bạn duyệt" trông y như "0 yêu cầu rút tiền". Người vận hành phải đọc từng ô
 * mới biết hôm nay có việc gì. Ở đây, việc cần làm trông khác việc không cần.
 */

/* ── Số liệu ──────────────────────────────────────────────────────────────── */

export function ConsoleStat({
  label, value, hint, tone = 'plain', className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** `money` cho số tiền chính, `plain` cho số đếm thường. */
  tone?: 'plain' | 'money';
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-mist bg-ivory-100 px-4 py-3.5', className)}>
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">{label}</p>
      <p
        className={cn(
          // tabular-nums: chữ số đều bề ngang nên các cột tiền thẳng hàng.
          // Thiếu nó thì bảng tài chính so le, đọc rất khó chịu.
          'mt-1 font-display font-semibold tabular-nums text-midnight',
          tone === 'money' ? 'text-[1.35rem] leading-tight' : 'text-[1.5rem] leading-none',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

/* ── Dòng tiền ────────────────────────────────────────────────────────────── */

/**
 * Tiền chảy đi đâu, vẽ đúng theo cách nó chảy thật:
 *
 *   Tổng giao dịch  →  Đối tác nhận  +  Hoa hồng DubaiWay
 *                                        →  Thưởng giới thiệu + DubaiWay giữ lại
 *
 * Sáu ô rời rạc không nói được quan hệ này. Người xem phải tự cộng trừ mới biết
 * số nào ra từ số nào.
 */
export function MoneyFlow({
  gmv, merchantRevenue, commission, referralPaid, netRevenue, balanced,
}: {
  gmv: string;
  merchantRevenue: string;
  commission: string;
  referralPaid: string;
  netRevenue: string;
  /** Sổ sách có khớp không. Lệch là dấu hiệu hỏng, phải hiện rõ. */
  balanced: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-ivory-100">
      <div className="border-b border-mist px-5 py-4">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">
          Tổng giá trị giao dịch
        </p>
        <p className="mt-0.5 font-display text-[2rem] font-semibold leading-none tabular-nums text-midnight">
          {gmv}
        </p>
      </div>

      <div className="grid divide-y divide-mist sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">
            Đối tác nhận
          </p>
          <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-midnight">
            {merchantRevenue}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-champagne-600">
            Hoa hồng DubaiWay
          </p>
          <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-champagne-600">
            {commission}
          </p>

          {/* Hoa hồng lại chia tiếp — thụt vào để thấy đây là nhánh con. */}
          <dl className="mt-3 space-y-1.5 border-l-2 border-champagne/25 pl-3">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-ink-muted">Thưởng người giới thiệu</dt>
              <dd className="text-sm font-medium tabular-nums text-midnight">{referralPaid}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-ink-muted">DubaiWay giữ lại</dt>
              <dd className="text-sm font-medium tabular-nums text-midnight">{netRevenue}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p
        className={cn(
          'border-t px-5 py-2.5 text-xs',
          balanced
            ? 'border-mist bg-ivory-200/50 text-ink-soft'
            : 'border-red-300 bg-red-50 font-medium text-red-700',
        )}
      >
        {balanced
          ? 'Sổ sách khớp: đối tác nhận + hoa hồng = tổng giao dịch, và thưởng + giữ lại = hoa hồng.'
          : 'Sổ sách KHÔNG khớp. Cần kiểm tra ngay trước khi đối soát.'}
      </p>
    </div>
  );
}

/* ── Hàng việc cần làm ────────────────────────────────────────────────────── */

export interface QueueItem {
  readonly count: number;
  /** Câu mô tả việc, viết ở dạng số ít. VD "hồ sơ đối tác chờ duyệt". */
  readonly label: string;
  readonly href: string;
}

/**
 * Việc đang chờ bạn.
 *
 * Đây là lý do người vận hành mở trang này, nên nó nằm trên cùng và viết thành
 * câu chứ không phải một dãy ô số. Không có việc gì thì thu lại thành một dòng
 * yên tĩnh — màn hình trống là tin tốt, không nên trông như lỗi.
 */
export function ActionQueue({ items, emptyLabel }: { items: readonly QueueItem[]; emptyLabel: string }) {
  const pending = items.filter((i) => i.count > 0);

  if (pending.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-mist bg-ivory-100 px-4 py-3 text-sm text-ink-muted">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {emptyLabel}
      </p>
    );
  }

  return (
    <section aria-label="Việc cần xử lý" className="overflow-hidden rounded-2xl border border-champagne/45 bg-champagne/[0.05]">
      <p className="border-b border-champagne/25 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-champagne-600">
        Đang chờ bạn
      </p>
      <ul className="divide-y divide-champagne/20">
        {pending.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-champagne/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            >
              <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-champagne px-2 font-display text-base font-semibold tabular-nums text-midnight-950">
                {item.count}
              </span>
              <span className="min-w-0 flex-1 text-sm text-midnight">{item.label}</span>
              <IconArrowRight className="h-4 w-4 shrink-0 text-champagne-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Khối nội dung & trạng thái rỗng ──────────────────────────────────────── */

export function ConsoleCard({
  title, description, actions, children, className,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-mist bg-ivory-100', className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-mist px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-midnight">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-ink-soft">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Màn hình trống.
 * Nói rõ bước tiếp theo thay vì chỉ báo "chưa có gì" — trống là lời mời làm
 * việc gì đó, không phải một thông báo lỗi.
 */
export function ConsoleEmpty({
  title, body, action,
}: {
  title: string;
  body?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-display text-base font-medium text-midnight">{title}</p>
      {body ? <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{body}</p> : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-champagne px-4 py-2 text-sm font-medium text-champagne-600 transition-colors hover:bg-champagne/[0.08]"
        >
          {action.label}
          <IconArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

/* ── Nhóm số liệu phụ ─────────────────────────────────────────────────────── */

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
