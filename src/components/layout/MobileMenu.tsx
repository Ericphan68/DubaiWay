'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mainNav } from '@/config/nav';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import {
  IconClose,
  IconChevronDown,
  IconPhone,
  IconWhatsapp,
} from '@/components/ui/icons';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';

/** Menu toàn màn hình cho mobile/tablet. */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Khoá cuộn nền khi menu mở.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-midnight-950/60 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-midnight text-white shadow-console transition-transform duration-400 ease-dubaiway',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Logo tone="light" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label="Đóng menu"
          >
            <IconClose className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Điều hướng di động">
          <ul className="space-y-1">
            {mainNav.map((item) => {
              const hasMenu = Boolean(item.megaMenu);
              const isOpen = expanded === item.label;
              return (
                <li key={item.label} className="border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex-1 py-3.5 text-base font-medium text-white/90"
                    >
                      {item.label}
                    </Link>
                    {hasMenu && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        className="p-2 text-white/60"
                        aria-label={`Mở ${item.label}`}
                        aria-expanded={isOpen}
                      >
                        <IconChevronDown
                          className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-180')}
                        />
                      </button>
                    )}
                  </div>
                  {hasMenu && isOpen && (
                    <ul className="space-y-0.5 pb-3 pl-3">
                      {item.megaMenu!.flatMap((g) => g.children).map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-champagne-400"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-white/10 px-5 py-4">
          <Button href="/yeu-cau-bao-gia" variant="gold" className="w-full" onClick={onClose}>
            Nhận tư vấn & báo giá
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${siteConfig.contact.hotline}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 py-2.5 text-sm text-white hover:bg-white/10"
            >
              <IconPhone className="h-4 w-4" /> Gọi ngay
            </a>
            <a
              href={whatsappLink(whatsappMessages.default)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-sm font-medium text-white hover:bg-[#1eb757]"
            >
              <IconWhatsapp className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
