import type { Metadata } from 'next';
import Link from 'next/link';
import { dubaiExperiences, dubaiCategories } from '@/data/dubai';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { ExperienceCard } from '@/components/cards/ExperienceCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dubai Experiences — Trải nghiệm tại Dubai',
  description:
    'Desert Safari, Burj Khalifa, du thuyền Marina, Abu Dhabi, trực thăng và nhiều trải nghiệm Dubai. Đặt trực tuyến hoặc nhờ DubaiWay hỗ trợ.',
};

const promos = [
  { title: 'Dubai Stopover', desc: 'Quá cảnh Dubai 1–2 ngày trọn gói: khách sạn, tham quan và đưa đón.' },
  { title: 'Dubai Luxury', desc: 'Du thuyền riêng, chauffeur và trải nghiệm VIP được thiết kế riêng.' },
  { title: 'Combo Experiences', desc: 'Gộp nhiều trải nghiệm với mức giá tham khảo tốt hơn.' },
];

export default async function DubaiPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const results = cat ? dubaiExperiences.filter((e) => e.category === cat) : dubaiExperiences;

  return (
    <>
      <PageHero
        eyebrow="Dubai Experiences"
        title="Cả một Dubai để trải nghiệm"
        description="Từ sa mạc đến siêu tháp, từ du thuyền đến trực thăng — chọn trải nghiệm và đặt chỉ trong vài bước."
        image={img(photo.dubaiSkyline, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Dubai Experiences' }]}
      />

      <section className="shell py-12">
        {/* Category */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/dubai"
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              !cat ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
            )}
          >
            Tất cả
          </Link>
          {dubaiCategories.map((c) => (
            <Link
              key={c}
              href={`/dubai?cat=${encodeURIComponent(c)}`}
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
            {results.map((item) => (
              <ExperienceCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có sản phẩm cho mục này"
            description="Nhắn nhân viên DubaiWay để sắp xếp trải nghiệm Dubai theo yêu cầu của bạn."
            action={<Button href="/yeu-cau-bao-gia?type=dubai" variant="primary">Nhờ DubaiWay hỗ trợ</Button>}
          />
        )}
      </section>

      {/* Promo bands */}
      <section className="bg-mist-200/60 py-14">
        <div className="shell grid gap-6 sm:grid-cols-3">
          {promos.map((p) => (
            <div key={p.title} className="rounded-2xl bg-ivory-100 p-6 shadow-card">
              <p className="font-display text-lg font-medium text-midnight">{p.title}</p>
              <p className="mt-2 text-sm text-ink-muted">{p.desc}</p>
              <Link href="/yeu-cau-bao-gia?type=dubai" className="mt-3 inline-flex text-sm font-semibold text-royal hover:underline">
                Tìm hiểu thêm →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
