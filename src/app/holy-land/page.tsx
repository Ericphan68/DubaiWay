import type { Metadata } from 'next';
import Link from 'next/link';
import { holyLandJourneys, holyLandCategories } from '@/data/holyland';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { HolyLandCard } from '@/components/holyland/HolyLandCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { IconUsers, IconGlobe, IconSparkle } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'DubaiWay Holy Land Journeys — Hành trình về Đất Thánh',
  description:
    'Hành trình hành hương Israel, Jordan, Ai Cập, Thổ Nhĩ Kỳ, Hy Lạp và Rome — hiện đại, trang trọng và giàu cảm xúc, có trưởng đoàn mục vụ đồng hành.',
};

const pillars = [
  { Icon: IconGlobe, title: 'Đúng dấu chân lịch sử', desc: 'Lộ trình bám sát bối cảnh Kinh Thánh, diễn giải bởi hướng dẫn viên am hiểu.' },
  { Icon: IconUsers, title: 'Có trưởng đoàn mục vụ', desc: 'Giờ tĩnh nguyện, cầu nguyện và suy ngẫm mỗi ngày cùng người dẫn đoàn.' },
  { Icon: IconSparkle, title: 'Trang trọng & hiện đại', desc: 'Trải nghiệm chỉn chu, không theo phong cách tour tôn giáo cũ.' },
];

export default async function HolyLandPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const results = cat ? holyLandJourneys.filter((j) => j.mode === cat) : holyLandJourneys;

  return (
    <>
      <PageHero
        eyebrow="DubaiWay Holy Land Journeys"
        title="Những hành trình về vùng Đất Thánh"
        description="Israel · Jordan · Ai Cập · Thổ Nhĩ Kỳ · Hy Lạp · Rome. Một hành trình của đức tin — trang trọng, hiện đại và giàu cảm xúc."
        image={img(photo.jerusalem, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Holy Land' }]}
      />

      {/* Ba trụ cột */}
      <section className="shell py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-mist bg-ivory-100 p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist-200 text-royal">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display text-lg font-medium text-midnight">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phân loại + danh sách */}
      <section className="shell pb-16">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/holy-land"
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              !cat ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
            )}
          >
            Tất cả hành trình
          </Link>
          {holyLandCategories.map((c) => (
            <Link
              key={c}
              href={`/holy-land?cat=${encodeURIComponent(c)}`}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                cat === c ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
              )}
            >
              {c}
            </Link>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((journey) => (
              <HolyLandCard key={journey.slug} journey={journey} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có hành trình cho phân loại này"
            description="DubaiWay có thể thiết kế đoàn riêng theo chủ đề và lịch của hội thánh bạn."
            action={<Button href="/yeu-cau-bao-gia?type=holyland" variant="primary">Tư vấn đoàn riêng</Button>}
          />
        )}
      </section>

      {/* CTA đoàn hội thánh riêng */}
      <section className="bg-midnight">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div className="max-w-xl text-white">
            <span className="eyebrow text-champagne-400"><span className="route-dot" /> Đoàn hội thánh riêng</span>
            <h2 className="mt-3 font-display text-2xl font-medium">Dẫn dắt đoàn của bạn về Đất Thánh</h2>
            <p className="mt-2 text-white/70">
              DubaiWay đồng hành cùng mục sư và lãnh đạo: thiết kế lộ trình theo chủ đề, lo trọn hậu cần và
              giữ trọn không gian thiêng liêng cho đoàn.
            </p>
          </div>
          <Button href="/yeu-cau-bao-gia?type=holyland" variant="gold" className="shrink-0">
            Tư vấn đoàn hội thánh
          </Button>
        </div>
      </section>
    </>
  );
}
