'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ConsoleNavGroup } from './ConsoleShell';
import { consoleIcon } from './console-icons';

/**
 * Điều hướng của khu nội bộ.
 *
 * Là client component vì cần biết đang ở trang nào để đánh dấu. Trước đây danh
 * sách 14 mục nằm phẳng, không icon, không dấu hiệu đang xem — mở lên không
 * biết mình đứng ở đâu. Giờ chia nhóm theo công việc và có vạch vàng chỉ mục
 * đang mở.
 */
export function ConsoleNav({ groups }: { groups: readonly ConsoleNavGroup[] }) {
  const pathname = usePathname();

  /** Mục gốc (/admin, /merchant) chỉ sáng khi đúng nó, tránh sáng ở mọi trang con. */
  const isCurrent = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="space-y-5" aria-label="Điều hướng khu nội bộ">
      {groups.map((group) => (
        <div key={group.heading ?? 'chinh'}>
          {group.heading ? (
            <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/35">
              {group.heading}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isCurrent(item.href, item.exact);
              const Icon = consoleIcon(item.icon);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2.5 text-sm transition-colors duration-200',
                      active
                        ? 'bg-white/[0.08] font-medium text-white'
                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white',
                    )}
                  >
                    {/* Vạch vàng bên trái: dấu hiệu đang xem, đọc được cả khi không phân biệt màu. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full transition-colors',
                        active ? 'bg-champagne-400' : 'bg-transparent',
                      )}
                    />
                    <Icon className={cn('h-[1.05rem] w-[1.05rem] shrink-0', active ? 'text-champagne-400' : 'text-white/40 group-hover:text-white/70')} />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-champagne px-1.5 text-[0.7rem] font-semibold text-midnight-950">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
