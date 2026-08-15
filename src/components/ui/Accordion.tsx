'use client';

import { useState } from 'react';
import type { FaqItem } from '@/types';
import { cn } from '@/lib/utils';
import { IconChevronDown } from './icons';

/** Danh sách FAQ dạng accordion — mở/đóng từng mục. */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-mist rounded-2xl border border-mist bg-ivory-100">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-midnight">{item.question}</span>
              <IconChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300',
                  isOpen && 'rotate-180 text-royal',
                )}
              />
            </button>
            <div
              className={cn(
                'grid overflow-hidden transition-all duration-300 ease-dubaiway',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
