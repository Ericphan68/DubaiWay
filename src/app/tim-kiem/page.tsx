import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { search } from '@/lib/search';
import { SearchBox } from '@/components/search/SearchBox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconArrowRight } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm tour, điểm đến, visa, khách sạn và cẩm nang trên DubaiWay.',
};

const suggestions = ['Dubai', 'Đất Thánh', 'Visa UAE', 'Vé thương gia', 'Santorini'];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? search(query) : [];

  return (
    <section className="shell py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center font-display text-3xl font-medium text-midnight sm:text-display-md">
          Bạn đang tìm gì?
        </h1>
        <p className="mt-2 text-center text-ink-muted">Tìm nhanh tour, điểm đến, visa, khách sạn và cẩm nang.</p>

        <div className="mt-6">
          <Suspense fallback={<div className="h-12 rounded-full bg-mist-200" />}>
            <SearchBox initial={query} />
          </Suspense>
        </div>

        {!query && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-ink-soft">Gợi ý:</span>
            {suggestions.map((s) => (
              <Link key={s} href={`/tim-kiem?q=${encodeURIComponent(s)}`} className="rounded-full border border-mist-400 px-3 py-1 text-ink-muted hover:border-royal/40 hover:text-royal">
                {s}
              </Link>
            ))}
          </div>
        )}
      </div>

      {query && (
        <div className="mx-auto mt-10 max-w-3xl">
          <p className="mb-4 text-sm text-ink-muted">
            <span className="font-semibold text-midnight">{results.length}</span> kết quả cho “{query}”
          </p>

          {results.length > 0 ? (
            <div className="divide-y divide-mist rounded-2xl border border-mist bg-ivory-100">
              {results.map((r, i) => (
                <Link key={i} href={r.href} className="group flex items-center gap-4 p-4 transition-colors hover:bg-mist-200/50">
                  <Badge tone="navy">{r.type}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-midnight group-hover:text-royal">{r.title}</p>
                    <p className="truncate text-xs text-ink-soft">{r.subtitle}</p>
                  </div>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={`Không tìm thấy kết quả cho “${query}”`}
              description="Thử từ khoá khác, hoặc để đội ngũ DubaiWay tư vấn trực tiếp cho bạn."
              action={<Button href="/yeu-cau-bao-gia" variant="primary">Nhận tư vấn</Button>}
            />
          )}
        </div>
      )}
    </section>
  );
}
