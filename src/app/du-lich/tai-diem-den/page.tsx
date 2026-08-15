import type { Metadata } from 'next';
import { tours } from '@/data/tours';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { LocalTourCard } from '@/components/cards/LocalTourCard';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Tour tại điểm đến',
  description:
    'Dành cho khách tự bay đến hoặc người Việt ở nước ngoài: tour trong ngày, city tour, private tour, vé tham quan, transfer và trải nghiệm địa phương.',
};

const audiences = [
  'Người Việt đang sống tại Dubai',
  'Người Việt ở nước ngoài',
  'Khách quốc tế',
  'Khách tự bay đến điểm đến',
];

const categories = [
  'Tour trong ngày',
  'City Tour',
  'Private Tour',
  'Vé tham quan',
  'Transfer & đưa đón',
  'Trải nghiệm địa phương',
  'Tour nhiều ngày (không gồm vé quốc tế)',
];

export default function AtDestinationPage() {
  const localTours = tours.filter((t) => t.mode === 'at-destination');

  return (
    <>
      <PageHero
        eyebrow="Đã ở điểm đến"
        title="Tour tại điểm đến"
        description="Không cần vé quốc tế. Ghép đoàn địa phương, đặt trực tuyến nhanh hoặc nhắn nhân viên để thiết kế buổi đi chơi của bạn."
        image={img(photo.dubaiMarina, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Du lịch', href: '/du-lich' }, { label: 'Tại điểm đến' }]}
      />

      <section className="shell py-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
            <p className="text-sm font-semibold text-midnight">Phù hợp với</p>
            <ul className="mt-2 grid gap-1 text-sm text-ink-muted">
              {audiences.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
            <p className="text-sm font-semibold text-midnight">Bạn có thể đặt</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c} className="rounded-full bg-mist-200 px-3 py-1 text-xs text-ink-muted">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {localTours.map((tour) => (
            <LocalTourCard key={tour.slug} tour={tour} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-midnight p-6 text-white sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-xl font-medium">Không thấy trải nghiệm bạn muốn?</p>
              <p className="mt-1 text-sm text-white/70">
                Nhắn nhân viên DubaiWay để thiết kế buổi đi chơi riêng, thuê xe kèm hướng dẫn hoặc gộp nhiều điểm.
              </p>
            </div>
            <Button href="/yeu-cau-bao-gia?type=local" variant="gold" className="shrink-0">
              Nhắn nhân viên tư vấn
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
