'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNav } from '@/config/nav';
import { iconMap } from '@/components/ui/icons';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/** Điều hướng đáy cố định — chỉ hiện trên mobile. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-ivory-100/95 backdrop-blur-md lg:hidden"
      aria-label="Điều hướng nhanh"
    >
      <ul className="grid grid-cols-5">
        {bottomNav.map((item) => {
          const Icon = iconMap[item.icon];
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const isWhatsapp = item.icon === 'whatsapp';

          const content = (
            <span className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium">
              <Icon
                className={cn(
                  'h-5 w-5',
                  isWhatsapp ? 'text-[#25D366]' : active ? 'text-royal' : 'text-ink-soft',
                )}
              />
              <span className={cn(active && !isWhatsapp ? 'text-royal' : 'text-ink-muted')}>
                {item.label}
              </span>
            </span>
          );

          return (
            <li key={item.label}>
              {isWhatsapp ? (
                <a
                  href={whatsappLink(whatsappMessages.default)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <Link href={item.href} className="block" aria-current={active ? 'page' : undefined}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
