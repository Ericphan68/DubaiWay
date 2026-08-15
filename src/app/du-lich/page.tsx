import { Suspense } from 'react';
import type { Metadata } from 'next';
import { tours } from '@/data/tours';
import { img, photo } from '@/data/images';
import { filterTours, type TourQuery } from '@/lib/tour-filter';
import { PageHero } from '@/components/ui/PageHero';
import { TourCard } from '@/components/cards/TourCard';
import { TourFiltersPanel } from '@/components/tours/TourFiltersPanel';
import { SortSelect } from '@/components/tours/SortSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Tour du lịch & hành hương',
  description:
    'Khám phá tour Dubai, Đất Thánh, Châu Âu và nhiều điểm đến. Lọc theo điểm khởi hành, phân khúc, số ngày và loại tour.',
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<TourQuery>;
}) {
  const q = await searchParams;
  const results = filterTours(tours, q);

  return (
    <>
      <PageHero
        eyebrow="DubaiWay Tours"
        title="Tour du lịch & hành hương"
        description="Từ trải nghiệm trong ngày đến đại hành trình liên tuyến — chọn theo điểm đến, phân khúc và cách bạn muốn đi."
        image={img(photo.dubaiDesert, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Du lịch' }]}
      />

      <section className="shell py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <Suspense fallback={<div className="h-96 rounded-2xl bg-mist-200" />}>
            <TourFiltersPanel resultCount={results.length} />
          </Suspense>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-midnight">{results.length}</span> tour
              </p>
              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((tour) => (
                  <TourCard key={tour.slug} tour={tour} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có tour khớp bộ lọc"
                description="Thử bỏ bớt điều kiện lọc, hoặc để DubaiWay tư vấn một hành trình thiết kế riêng cho bạn."
                action={
                  <Button href="/yeu-cau-bao-gia" variant="primary">
                    Yêu cầu tư vấn riêng
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
