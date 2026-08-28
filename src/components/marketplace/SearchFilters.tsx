'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Bộ lọc tìm kiếm.
 *
 * Toàn bộ trạng thái nằm trong URL, không nằm trong React state. Nhờ vậy kết quả
 * lọc chia sẻ được bằng link, nút back của trình duyệt hoạt động đúng, và máy chủ
 * render được ngay lần đầu (tốt cho SEO).
 */
export interface FilterOptions {
  readonly categories: readonly { slug: string; name: string }[];
  readonly cities: readonly string[];
  readonly languages: readonly { code: string; label: string }[];
}

const PRICE_BUCKETS = [
  { label: 'Dưới 50 USD', min: 0, max: 5000 },
  { label: '50 – 150 USD', min: 5000, max: 15000 },
  { label: '150 – 300 USD', min: 15000, max: 30000 },
  { label: 'Trên 300 USD', min: 30000, max: undefined },
];

const SORTS = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
];

export function SearchFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      }
      next.delete('page'); // đổi bộ lọc thì quay về trang đầu
      router.push(`/tim-kiem?${next.toString()}`);
    },
    [params, router],
  );

  const get = (k: string) => params.get(k) ?? '';
  const isOn = (k: string) => params.get(k) === '1';
  const activeCount = ['cat', 'city', 'lang', 'pmin', 'pmax', 'rating', 'pickup', 'freecancel', 'instant', 'guests']
    .filter((k) => params.get(k)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-midnight">Bộ lọc</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => router.push(`/tim-kiem${get('q') ? `?q=${encodeURIComponent(get('q'))}` : ''}`)}
            className="text-sm text-royal hover:underline"
          >
            Xoá tất cả ({activeCount})
          </button>
        ) : null}
      </div>

      <Group label="Sắp xếp">
        <select
          value={get('sort') || 'featured'}
          onChange={(e) => update({ sort: e.target.value === 'featured' ? undefined : e.target.value })}
          className="h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </Group>

      <Group label="Danh mục">
        <select
          value={get('cat')}
          onChange={(e) => update({ cat: e.target.value || undefined })}
          className="h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {options.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </Group>

      <Group label="Thành phố">
        <div className="flex flex-wrap gap-2">
          {options.cities.map((city) => (
            <Chip key={city} active={get('city') === city}
                  onClick={() => update({ city: get('city') === city ? undefined : city })}>
              {city}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Ngày sử dụng">
        <input
          type="date"
          value={get('date')}
          onChange={(e) => update({ date: e.target.value || undefined })}
          className="h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm"
        />
      </Group>

      <Group label="Khoảng giá">
        <div className="flex flex-wrap gap-2">
          {PRICE_BUCKETS.map((b) => {
            const active = get('pmin') === String(b.min) && get('pmax') === String(b.max ?? '');
            return (
              <Chip key={b.label} active={active}
                    onClick={() => update({
                      pmin: active ? undefined : String(b.min),
                      pmax: active ? undefined : (b.max === undefined ? undefined : String(b.max)),
                    })}>
                {b.label}
              </Chip>
            );
          })}
        </div>
      </Group>

      <Group label="Số khách">
        <input
          type="number" min={1} max={50} placeholder="Bất kỳ"
          value={get('guests')}
          onChange={(e) => update({ guests: e.target.value || undefined })}
          className="h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm"
        />
      </Group>

      <Group label="Điểm đánh giá">
        <div className="flex flex-wrap gap-2">
          {[4.5, 4, 3.5].map((r) => (
            <Chip key={r} active={get('rating') === String(r)}
                  onClick={() => update({ rating: get('rating') === String(r) ? undefined : String(r) })}>
              Từ {r} sao
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Ngôn ngữ phục vụ">
        <div className="flex flex-wrap gap-2">
          {options.languages.map((l) => (
            <Chip key={l.code} active={get('lang') === l.code}
                  onClick={() => update({ lang: get('lang') === l.code ? undefined : l.code })}>
              {l.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Tiện ích">
        <div className="space-y-2">
          <Toggle label="Có đón khách" checked={isOn('pickup')}
                  onChange={(v) => update({ pickup: v ? '1' : undefined })} />
          <Toggle label="Huỷ miễn phí" checked={isOn('freecancel')}
                  onChange={(v) => update({ freecancel: v ? '1' : undefined })} />
          <Toggle label="Xác nhận tức thì" checked={isOn('instant')}
                  onChange={(v) => update({ instant: v ? '1' : undefined })} />
          <Toggle label="Đang khuyến mãi" checked={isOn('promo')}
                  onChange={(v) => update({ promo: v ? '1' : undefined })} />
        </div>
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        active ? 'border-royal bg-royal text-white' : 'border-mist text-ink-muted hover:border-mist-400',
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
             className="accent-champagne" />
      {label}
    </label>
  );
}

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q');
        const next = new URLSearchParams(params.toString());
        // Giữ nguyên bộ lọc đang có, chỉ đổi từ khoá — khách không mất công lọc lại.
        if (typeof q === 'string' && q.trim()) next.set('q', q.trim());
        else next.delete('q');
        next.delete('page');
        router.push(`/tim-kiem?${next.toString()}`);
      }}
      className="flex gap-2"
      role="search"
    >
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Bạn muốn trải nghiệm gì ở Dubai?"
        aria-label="Từ khoá tìm kiếm"
        className="h-12 flex-1 rounded-full border border-mist bg-ivory-100 px-5 text-sm text-midnight outline-none focus:border-royal"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-champagne px-6 text-sm font-medium text-white transition-colors hover:bg-champagne-600"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
