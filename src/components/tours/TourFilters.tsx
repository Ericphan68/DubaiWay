'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  tourDestinations,
  tourDepartureCities,
  segmentLabels,
  formatLabels,
} from '@/data/tours';
import type { Tour } from '@/types';
import { cn } from '@/lib/utils';

const durations = [
  { value: 'short', label: '1–3 ngày' },
  { value: 'medium', label: '4–7 ngày' },
  { value: 'long', label: '8+ ngày' },
];

const modes = [
  { value: 'join', label: 'Tour ghép' },
  { value: 'private-group', label: 'Đoàn riêng' },
];

/** Nhóm nút lọc đơn chọn — bấm lại để bỏ chọn. */
function FilterGroup({
  heading,
  param,
  options,
  current,
  onSelect,
}: {
  heading: string;
  param: string;
  options: { value: string; label: string }[];
  current: string | null;
  onSelect: (param: string, value: string) => void;
}) {
  return (
    <div className="border-b border-mist py-4 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{heading}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(param, opt.value)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                active
                  ? 'border-royal bg-royal text-white'
                  : 'border-mist-400 text-ink-muted hover:border-royal/40 hover:text-midnight',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TourFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (param: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (next.get(param) === value) next.delete(param);
      else next.set(param, value);
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters = ['dest', 'from', 'segment', 'format', 'duration', 'mode'].some((k) => params.get(k));

  const destOptions = tourDestinations.map((d) => ({ value: d, label: d }));
  const fromOptions = tourDepartureCities.map((c) => ({ value: c, label: c }));
  const segmentOptions = (Object.keys(segmentLabels) as Tour['segment'][]).map((s) => ({
    value: s,
    label: segmentLabels[s],
  }));
  const formatOptions = (['join', 'private-group', 'family', 'corporate', 'church'] as Tour['format'][]).map((f) => ({
    value: f,
    label: formatLabels[f],
  }));

  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-medium text-midnight">Bộ lọc</p>
        {hasFilters && (
          <button type="button" onClick={clearAll} className="text-xs font-semibold text-royal hover:underline">
            Xóa lọc
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-soft">{resultCount} tour phù hợp</p>

      <div className="mt-4">
        <FilterGroup heading="Điểm đến" param="dest" options={destOptions} current={params.get('dest')} onSelect={update} />
        <FilterGroup heading="Khởi hành từ" param="from" options={fromOptions} current={params.get('from')} onSelect={update} />
        <FilterGroup heading="Phân khúc" param="segment" options={segmentOptions} current={params.get('segment')} onSelect={update} />
        <FilterGroup heading="Loại tour" param="format" options={formatOptions} current={params.get('format')} onSelect={update} />
        <FilterGroup heading="Số ngày" param="duration" options={durations} current={params.get('duration')} onSelect={update} />
        <div className="pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Hình thức</p>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => {
              const active = params.get('mode') === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update('mode', m.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
