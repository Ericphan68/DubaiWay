'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { sortOptions as tourSortOptions } from '@/lib/tour-filter';

export function SortSelect({
  options = tourSortOptions,
}: {
  options?: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get('sort') ?? 'popular';

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === 'popular') next.delete('sort');
    else next.set('sort', value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-ink-soft">Sắp xếp:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-mist bg-ivory-100 px-4 text-sm font-medium text-midnight outline-none focus:border-royal"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
