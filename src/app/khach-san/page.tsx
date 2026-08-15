import { Suspense } from 'react';
import type { Metadata } from 'next';
import { hotels } from '@/data/hotels';
import { img, photo } from '@/data/images';
import { filterHotels, hotelSortOptions, type HotelQuery } from '@/lib/hotel-filter';
import { PageHero } from '@/components/ui/PageHero';
import { HotelCard } from '@/components/cards/HotelCard';
import { HotelSearchBar } from '@/components/hotels/HotelSearchBar';
import { HotelFiltersPanel } from '@/components/hotels/HotelFiltersPanel';
import { SortSelect } from '@/components/tours/SortSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconUsers } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Khách sạn — Nơi lưu trú xứng tầm hành trình',
  description:
    'Tìm khách sạn từ resort bên biển đến khách sạn 5 sao giữa thành phố. Lọc theo giá, hạng sao, khu vực, tiện ích và ưu đãi.',
};

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<HotelQuery>;
}) {
  const q = await searchParams;
  const results = filterHotels(hotels, q);

  return (
    <>
      <PageHero
        eyebrow="Khách sạn"
        title="Nơi lưu trú xứng tầm hành trình"
        description="Từ khu nghỉ dưỡng bên biển đến khách sạn giữa lòng thành phố — chọn nơi phù hợp phong cách và ngân sách của bạn."
        image={img(photo.hotelPool, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Khách sạn' }]}
      >
        <HotelSearchBar />
      </PageHero>

      <section id="danh-sach" className="shell scroll-mt-24 py-12">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <Suspense fallback={<div className="h-96 rounded-2xl bg-mist-200" />}>
            <HotelFiltersPanel resultCount={results.length} />
          </Suspense>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-midnight">{results.length}</span> khách sạn · giá tham khảo
              </p>
              <Suspense fallback={null}>
                <SortSelect options={hotelSortOptions} />
              </Suspense>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {results.map((hotel) => (
                  <HotelCard key={hotel.slug} hotel={hotel} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có khách sạn khớp bộ lọc"
                description="Thử nới lỏng điều kiện, hoặc để DubaiWay tìm giúp nơi lưu trú phù hợp — kể cả cho đoàn."
                action={<Button href="/yeu-cau-bao-gia?type=hotel" variant="primary">Nhờ DubaiWay tìm phòng</Button>}
              />
            )}
          </div>
        </div>
      </section>

      {/* Khách sạn cho đoàn & sự kiện */}
      <section className="bg-midnight">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div className="max-w-xl text-white">
            <span className="eyebrow text-champagne-400"><IconUsers className="h-4 w-4" /> Đoàn &amp; sự kiện</span>
            <h2 className="mt-3 font-display text-2xl font-medium">Khách sạn cho đoàn và sự kiện</h2>
            <p className="mt-2 text-white/70">
              Đặt số lượng phòng lớn, phòng họp, tiệc và ưu đãi đoàn. DubaiWay thương lượng giá và giữ chỗ giúp bạn.
            </p>
          </div>
          <Button href="/yeu-cau-bao-gia?type=hotel-group" variant="gold" className="shrink-0">
            Yêu cầu báo giá đoàn
          </Button>
        </div>
      </section>
    </>
  );
}
