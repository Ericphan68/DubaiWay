'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { hotelCities, hotelAmenities } from '@/data/hotels';
import { priceBuckets } from '@/lib/hotel-filter';
import { cn } from '@/lib/utils';

function Group({
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
                active ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
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

export function HotelFilters({ resultCount }: { resultCount: number }) {
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

  const toggle = (param: string) => {
    const next = new URLSearchParams(params.toString());
    if (next.get(param) === '1') next.delete(param);
    else next.set(param, '1');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters = ['city', 'stars', 'price', 'rating', 'amenity', 'breakfast', 'freecancel'].some((k) => params.get(k));

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
      <p className="mt-1 text-xs text-ink-soft">{resultCount} khách sạn</p>

      <div className="mt-4">
        <Group heading="Khu vực" param="city" options={hotelCities.map((c) => ({ value: c, label: c }))} current={params.get('city')} onSelect={update} />
        <Group heading="Khoảng giá" param="price" options={priceBuckets} current={params.get('price')} onSelect={update} />
        <Group heading="Hạng sao" param="stars" options={[{ value: '5', label: '5 sao' }, { value: '4', label: 'Từ 4 sao' }, { value: '3', label: 'Từ 3 sao' }]} current={params.get('stars')} onSelect={update} />
        <Group heading="Điểm đánh giá" param="rating" options={[{ value: '9', label: 'Tuyệt vời 9+' }, { value: '8', label: 'Rất tốt 8+' }]} current={params.get('rating')} onSelect={update} />
        <Group heading="Tiện ích" param="amenity" options={hotelAmenities.slice(0, 10).map((a) => ({ value: a, label: a }))} current={params.get('amenity')} onSelect={update} />

        <div className="pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Ưu đãi</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'breakfast', label: 'Gồm bữa sáng' },
              { key: 'freecancel', label: 'Hủy miễn phí' },
            ].map((o) => {
              const active = params.get(o.key) === '1';
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => toggle(o.key)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
