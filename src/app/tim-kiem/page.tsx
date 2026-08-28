import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Section } from '@/components/ui/Section';
import { EmptyState, ErrorState, ServiceGridSkeleton } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { SearchBar, SearchFilters } from '@/components/marketplace/SearchFilters';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';
import type { ServiceSearchFilters } from '@/server/repositories/types';

export const metadata: Metadata = {
  title: 'Tìm kiếm dịch vụ',
  description: 'Tìm tour, vé tham quan, safari sa mạc, du thuyền và dịch vụ du lịch tại Dubai trên DubaiWay.',
  alternates: { canonical: `${siteConfig.url}/tim-kiem` },
};

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;
const int = (v: string | string[] | undefined): number | undefined => {
  const n = Number.parseInt(typeof v === 'string' ? v : '', 10);
  return Number.isFinite(n) ? n : undefined;
};
const flt = (v: string | string[] | undefined): number | undefined => {
  const n = Number.parseFloat(typeof v === 'string' ? v : '');
  return Number.isFinite(n) ? n : undefined;
};

/** Đọc toàn bộ bộ lọc từ URL. Giá trị lạ bị bỏ qua thay vì làm sập trang. */
function parseFilters(sp: SP): ServiceSearchFilters {
  const sort = str(sp.sort);
  return {
    query: str(sp.q),
    categorySlug: str(sp.cat),
    city: str(sp.city),
    date: str(sp.date),
    priceMin: int(sp.pmin),
    priceMax: int(sp.pmax),
    guests: int(sp.guests),
    minRating: flt(sp.rating),
    language: str(sp.lang),
    pickupAvailable: sp.pickup === '1' || undefined,
    freeCancellation: sp.freecancel === '1' || undefined,
    instantConfirmation: sp.instant === '1' || undefined,
    onPromotion: sp.promo === '1' || undefined,
    merchantId: str(sp.merchant),
    sort: (['price_asc', 'price_desc', 'rating_desc', 'newest', 'featured'] as const)
      .find((s) => s === sort) ?? 'featured',
    page: int(sp.page) ?? 1,
    pageSize: 24,
  };
}

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'Tiếng Anh' },
  { code: 'ar', label: 'Tiếng Ả Rập' },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const repo = getRepositories();
  const filters = parseFilters(sp);

  let categories: { slug: string; name: string }[] = [];
  let result;
  try {
    [categories, result] = await Promise.all([
      repo.catalog.listCategories(locale).then((cs) => cs.map((c) => ({ slug: c.slug, name: c.name }))),
      repo.catalog.searchServices(filters, locale),
    ]);
  } catch {
    return (
      <Section>
        <ErrorState body="Không tải được kết quả tìm kiếm." retryHref="/tim-kiem" />
      </Section>
    );
  }

  // Danh sách thành phố lấy từ dữ liệu thật, không phải danh sách cứng.
  const all = await repo.catalog.searchServices({ pageSize: 200 }, locale).catch(() => null);
  const cities = [...new Set((all?.items ?? []).map((s) => s.city).filter((c): c is string => Boolean(c)))].sort();

  return (
    <Section>
      <h1 className="font-display text-3xl font-medium text-midnight">
        {filters.query ? `Kết quả cho “${filters.query}”` : 'Tìm kiếm dịch vụ'}
      </h1>

      <div className="mt-5">
        <Suspense fallback={<div className="h-12 rounded-full bg-mist-200" />}>
          <SearchBar defaultValue={filters.query} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<div className="h-96 rounded-2xl bg-mist-200" />}>
            <SearchFilters options={{ categories, cities, languages: LANGUAGES }} />
          </Suspense>
        </aside>

        <div className="min-w-0">
          <p className="text-sm text-ink-muted">
            {result.total > 0
              ? `${result.total} dịch vụ phù hợp`
              : 'Không có dịch vụ nào khớp bộ lọc hiện tại'}
          </p>

          <div className="mt-4">
            <Suspense fallback={<ServiceGridSkeleton count={6} />}>
              {result.items.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy dịch vụ nào"
                  body="Thử bỏ bớt bộ lọc, đổi từ khoá, hoặc xem toàn bộ danh mục."
                  action={{ label: 'Xem tất cả danh mục', href: '/danh-muc' }}
                />
              ) : (
                <ServiceGrid services={result.items} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </Section>
  );
}
