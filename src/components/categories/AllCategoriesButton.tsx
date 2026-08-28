'use client';

import { useRef, useState } from 'react';
import { AllCategoriesDialog } from './AllCategoriesDialog';
import type { CategoryGroup } from '@/config/category-groups';
import { getDictionary, type Locale } from '@/i18n';
import { IconGrid } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * Nút mở cửa sổ "Tất cả danh mục".
 *
 * Ba kiểu hiển thị dùng chung một cửa sổ:
 *  - `nav`   : nút chữ nhỏ trên thanh điều hướng máy tính
 *  - `menu`  : một dòng trong menu điện thoại (nền tối)
 *  - `tile`  : ô vuông đặt cạnh các danh mục nổi bật ngoài trang chủ
 */
export function AllCategoriesButton({
  groups, locale, variant = 'nav', className,
}: {
  groups: readonly CategoryGroup[];
  locale: Locale;
  variant?: 'nav' | 'menu' | 'tile';
  className?: string;
}) {
  const t = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Không có danh mục nào thì không hiện nút, tránh mở ra một cửa sổ trống.
  if (groups.length === 0) return null;

  const label = t.categories.allCategories;

  const styles: Record<'nav' | 'menu' | 'tile', string> = {
    nav: 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-midnight/80 transition-colors hover:text-champagne-600',
    menu: 'flex w-full items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-left text-[0.95rem] font-medium text-white transition-colors hover:border-champagne-400 hover:bg-white/[0.06]',
    tile: 'group/tile flex h-full w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-mist-400 bg-ivory-100 px-4 py-3.5 text-left transition-colors duration-300 ease-dubaiway hover:border-champagne hover:bg-champagne/[0.05]',
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          styles[variant],
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne',
          className,
        )}
      >
        {variant === 'tile' ? (
          <>
            <span className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/[0.12] text-champagne-600">
                <IconGrid className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className="text-sm font-medium text-midnight">{label}</span>
            </span>
            <span
              aria-hidden
              className="text-mist-400 transition-transform duration-300 ease-dubaiway group-hover/tile:translate-x-1 group-hover/tile:text-champagne"
            >
              +
            </span>
          </>
        ) : (
          <>
            <IconGrid className={cn('h-4 w-4', variant === 'menu' && 'h-[1.15rem] w-[1.15rem] text-champagne-400')} />
            {label}
          </>
        )}
      </button>

      <AllCategoriesDialog
        open={open}
        onClose={() => setOpen(false)}
        groups={groups}
        locale={locale}
        returnFocusTo={triggerRef}
      />
    </>
  );
}
