import type { ReactNode } from 'react';
import { ConsoleNav } from './ConsoleNav';
import type { ConsoleIconName } from './console-icons';
import { cn } from '@/lib/utils';

/**
 * Khung làm việc cho khu đối tác và khu quản trị.
 *
 * Vì sao thanh bên màu navy: trước đây cả hai khu dùng đúng bảng màu kem của
 * trang bán hàng, nên mọi thứ nổi lều bều trên nền kem, không có điểm neo và
 * không phân biệt được vùng điều hướng với vùng nội dung. Navy là màu sẵn có
 * trong nhận diện, không thêm màu mới, nhưng tạo ngay một cái cột sống cho
 * trang và cho mục đang xem một chỗ để nằm.
 */

export interface ConsoleNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ConsoleIconName;
  /** Chỉ sáng khi trùng khít — dùng cho mục gốc như /admin, /merchant. */
  readonly exact?: boolean;
  /** Số việc đang chờ. Bằng 0 hoặc không có thì không hiện. */
  readonly badge?: number;
}

export interface ConsoleNavGroup {
  readonly heading?: string;
  readonly items: readonly ConsoleNavItem[];
}

export function ConsoleShell({
  eyebrow, title, subtitle, groups, footer, children,
}: {
  /** Tên khu, ví dụ "Quản trị" hoặc "Khu đối tác". */
  eyebrow: string;
  /** Tên người hoặc tên doanh nghiệp đang đăng nhập. */
  title: string;
  subtitle?: ReactNode;
  groups: readonly ConsoleNavGroup[];
  /** Nút đăng xuất — truyền từ ngoài vì mỗi khu dùng form riêng. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-ivory-200/40">
      {/* Điện thoại: dải navy chạy hết bề ngang, ĐẶT NGOÀI hàng flex bên dưới.
          Để bên trong thì nó thành một cột anh em và bóp nội dung lại một dải hẹp. */}
      <div className="bg-midnight-950 px-4 py-3 text-white lg:hidden">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-champagne-400">
          {eyebrow}
        </p>
        <p className="mt-0.5 font-display text-base font-medium leading-snug">{title}</p>
        {subtitle ? <div className="mt-1.5">{subtitle}</div> : null}
      </div>

      <div className="mx-auto flex w-full max-w-[100rem] px-0 lg:gap-8 lg:px-6 lg:py-6">
        <aside
          className={cn(
            'hidden shrink-0 flex-col rounded-2xl bg-midnight-950 p-4 text-white lg:flex lg:w-[15.5rem]',
            'lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]',
          )}
        >
          <div className="px-3 pb-4 pt-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-champagne-400">
              {eyebrow}
            </p>
            <p className="mt-1 truncate font-display text-[1.05rem] font-medium leading-snug text-white">
              {title}
            </p>
            {subtitle ? <div className="mt-1.5">{subtitle}</div> : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-2">
            <ConsoleNav groups={groups} />
          </div>

          {footer ? <div className="mt-3 border-t border-white/10 px-3 pt-3">{footer}</div> : null}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-0 lg:py-0">
          {children}

          {/* Điện thoại không có thanh bên, nên điều hướng nằm cuối trang.
              Đặt ở đây thay vì trên đầu để không đẩy nội dung chính xuống. */}
          <div className="mt-10 rounded-2xl bg-midnight-950 p-4 text-white lg:hidden">
            <ConsoleNav groups={groups} />
            {footer ? <div className="mt-4 border-t border-white/10 px-3 pt-3">{footer}</div> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Đầu trang của một màn hình trong khu nội bộ.
 * Gom tiêu đề, mô tả và nút hành động về một chỗ để mọi trang cùng nhịp.
 */
export function ConsolePageHeader({
  title, description, actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-mist pb-5">
      <div className="min-w-0">
        <h1 className="font-display text-[1.7rem] font-semibold leading-tight text-midnight">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
