'use client';

import { useState } from 'react';
import { TourFilters } from './TourFilters';
import { IconClose } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * Bố trí bộ lọc: sidebar dính ở desktop, drawer trượt ở mobile.
 * Nút "Lọc" (kèm số kết quả) chỉ hiện trên mobile.
 */
export function TourFiltersPanel({ resultCount }: { resultCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <TourFilters resultCount={resultCount} />
        </div>
      </aside>

      {/* Nút mở drawer — mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-midnight/20 px-4 py-2 text-sm font-medium text-midnight lg:hidden"
      >
        Lọc <span className="rounded-full bg-royal px-1.5 text-xs text-white">{resultCount}</span>
      </button>

      {/* Drawer — mobile */}
      <div className={cn('fixed inset-0 z-[60] lg:hidden', open ? '' : 'pointer-events-none')} aria-hidden={!open}>
        <div
          className={cn('absolute inset-0 bg-midnight-950/50 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-4 transition-transform duration-300 ease-dubaiway',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-lg font-medium text-midnight">Bộ lọc tour</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist-200"
              aria-label="Đóng bộ lọc"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <TourFilters resultCount={resultCount} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 h-11 w-full rounded-full bg-royal text-sm font-medium text-white"
          >
            Xem {resultCount} tour
          </button>
        </div>
      </div>
    </>
  );
}
