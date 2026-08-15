import type { Metadata } from 'next';
import Link from 'next/link';
import { tours } from '@/data/tours';
import { departures } from '@/data/departures';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { TourCard } from '@/components/cards/TourCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Tour khởi hành từ Việt Nam',
  description:
    'Tour trọn gói khởi hành từ TP.HCM, Hà Nội, Đà Nẵng — gồm vé máy bay, visa, khách sạn, hướng dẫn viên tiếng Việt và trưởng đoàn.',
};

const perks = [
  'Vé máy bay khứ hồi',
  'Visa (nếu cần)',
  'Khách sạn tiêu chuẩn',
  'Hướng dẫn viên tiếng Việt',
  'Trưởng đoàn suốt tuyến',
  'Bảo hiểm du lịch',
];

export default async function FromVietnamPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const base = tours.filter((t) => t.mode === 'from-vietnam');
  const activeCity = departures.find((d) => d.code === from)?.city;
  const results = activeCity ? base.filter((t) => t.departureFrom.includes(activeCity)) : base;

  return (
    <>
      <PageHero
        eyebrow="Trọn gói · Giá VND"
        title="Tour khởi hành từ Việt Nam"
        description="Bay thẳng cùng đoàn, mọi thứ đã được lo sẵn. Chọn nơi bạn xuất phát để xem lịch khởi hành phù hợp."
        image={img(photo.airplane, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Du lịch', href: '/du-lich' }, { label: 'Từ Việt Nam' }]}
      />

      <section className="shell py-10 lg:py-14">
        {/* Chọn điểm khởi hành */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/du-lich/tu-viet-nam"
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              !from ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
            )}
          >
            Tất cả điểm đi
          </Link>
          {departures.map((dep) => (
            <Link
              key={dep.code}
              href={`/du-lich/tu-viet-nam?from=${dep.code}`}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                from === dep.code ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
              )}
            >
              {dep.city}
            </Link>
          ))}
        </div>

        {/* Cam kết trọn gói */}
        <div className="mt-6 rounded-2xl border border-champagne-200 bg-ivory-100 p-5">
          <p className="text-sm font-semibold text-midnight">Mỗi tour trọn gói đã bao gồm</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {perks.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <IconCheck className="h-4 w-4 text-emerald-600" /> {perk}
              </span>
            ))}
          </div>
        </div>

        {/* Kết quả */}
        <div className="mt-8">
          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`Chưa có lịch khởi hành từ ${activeCity ?? 'điểm này'}`}
              description="DubaiWay có thể mở đoàn theo yêu cầu hoặc sắp xếp nối chuyến nội địa cho bạn."
              action={<Button href="/yeu-cau-bao-gia?type=group" variant="primary">Yêu cầu mở đoàn</Button>}
            />
          )}
        </div>
      </section>
    </>
  );
}
