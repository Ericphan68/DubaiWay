'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { categoryIcon, type CategoryGroup } from '@/config/category-groups';
import { getDictionary, type Locale } from '@/i18n';
import { IconClose, IconArrowRight } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * Cửa sổ "Tất cả danh mục".
 *
 * Máy tính: hộp lớn nằm giữa màn hình, có lớp nền tối phía sau.
 * Điện thoại: chiếm trọn màn hình, trượt lên từ dưới.
 *
 * Không tự tải dữ liệu — nhóm danh mục do phía máy chủ chuẩn bị rồi truyền vào,
 * nhờ vậy bảng luôn khớp với danh mục thật trong kho dữ liệu.
 */
export function AllCategoriesDialog({
  open, onClose, groups, locale, returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  groups: readonly CategoryGroup[];
  locale: Locale;
  /** Nút đã mở cửa sổ — đóng xong trả con trỏ bàn phím về đúng chỗ cũ. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const t = getDictionary(locale);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    returnFocusTo?.current?.focus();
  }, [onClose, returnFocusTo]);

  // Khoá cuộn nền. Bù đúng bề rộng thanh cuộn để trang không giật ngang khi mở.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Đưa con trỏ bàn phím vào trong cửa sổ và giữ nó ở đó cho tới khi đóng.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      // Tab ở phần tử cuối quay về đầu, Shift+Tab ở đầu nhảy về cuối.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex sm:items-center sm:justify-center sm:p-6">
      {/* Lớp nền tối. Bấm ra ngoài để đóng. */}
      <button
        type="button"
        aria-label={t.categories.close}
        onClick={handleClose}
        className="absolute inset-0 animate-overlay-in cursor-default bg-midnight-950/70 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative flex w-full flex-col overflow-hidden bg-ivory shadow-2xl',
          // Điện thoại: trọn màn hình, trượt lên. Máy tính: hộp bo góc nằm giữa.
          'h-full animate-sheet-in',
          'sm:h-auto sm:max-h-[86vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-mist sm:animate-panel-in',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-mist bg-ivory-100 px-5 py-4 sm:px-8 sm:py-6">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-champagne-600">
              DubaiWay
            </p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-semibold text-midnight sm:text-3xl">
              {t.categories.allCategories}
            </h2>
            <p className="mt-1 hidden text-sm text-ink-muted sm:block">
              {t.categories.allCategoriesDesc}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label={t.categories.close}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mist text-midnight transition-colors duration-300 ease-dubaiway hover:border-champagne hover:bg-champagne/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
          {groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">{t.categories.empty}</p>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.id} aria-labelledby={`${titleId}-${group.id}`}>
                  <div className="flex items-baseline gap-3">
                    <h3
                      id={`${titleId}-${group.id}`}
                      className="font-display text-lg font-semibold text-midnight"
                    >
                      {group.name}
                    </h3>
                    {/* Vạch champagne kéo dài — nhịp thị giác của DubaiWay. */}
                    <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-champagne/45 to-transparent" />
                  </div>

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => {
                      const Icon = categoryIcon(item.slug, group.id);
                      const count = item.serviceCount ?? 0;
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/danh-muc/${item.slug}`}
                            onClick={handleClose}
                            className="group/item flex items-center gap-3 rounded-2xl border border-transparent bg-ivory-100 px-3 py-3 transition-colors duration-300 ease-dubaiway hover:border-champagne hover:bg-champagne/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne/[0.1] text-champagne-600 transition-colors duration-300 ease-dubaiway group-hover/item:bg-champagne/[0.18]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-midnight">
                                {item.name}
                              </span>
                              <span className="block text-xs text-ink-soft">
                                {count > 0 ? `${count} ${t.categories.serviceCount}` : t.categories.updating}
                              </span>
                            </span>
                            <IconArrowRight
                              className="h-4 w-4 shrink-0 text-mist-400 transition-transform duration-300 ease-dubaiway group-hover/item:translate-x-0.5 group-hover/item:text-champagne"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-mist bg-ivory-100 px-5 py-3 sm:px-8">
          <Link
            href="/danh-muc"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-champagne-600 transition-colors hover:text-champagne focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
          >
            {t.categories.viewAllPage}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
