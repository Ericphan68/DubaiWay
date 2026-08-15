import Link from 'next/link';
import Image from 'next/image';
import { holyLandJourneys } from '@/data/holyland';
import { formatPrice } from '@/lib/format';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { IconArrowRight } from '@/components/ui/icons';

export function HolyLandSection() {
  const featured = holyLandJourneys.slice(0, 3);

  return (
    <Section background="midnight">
      <SectionHeader
        tone="dark"
        eyebrow="DubaiWay Holy Land Journeys"
        title="Những hành trình về vùng Đất Thánh"
        description="Israel, Jordan, Ai Cập, Thổ Nhĩ Kỳ, Hy Lạp và Rome — hiện đại, trang trọng và giàu cảm xúc. Đồng hành cùng trưởng đoàn mục vụ và hướng dẫn viên am hiểu Kinh Thánh."
        link={{ label: 'Tất cả hành trình Holy Land', href: '/holy-land' }}
      />

      <div className="mt-12 space-y-4">
        {featured.map((journey, index) => (
          <Link
            key={journey.slug}
            href={`/holy-land/${journey.slug}`}
            className="group grid items-stretch gap-0 overflow-hidden rounded-2xl bg-midnight-800 ring-1 ring-white/10 transition-colors hover:ring-champagne-400/40 md:grid-cols-[0.9fr_1.6fr]"
          >
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
              <Image
                src={journey.image}
                alt={journey.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-midnight/70 px-3 py-1 text-xs font-semibold text-champagne-400 backdrop-blur-sm">
                {String(index + 1).padStart(2, '0')} · {journey.mode}
              </span>
            </div>

            <div className="flex flex-col p-6 text-white sm:p-7">
              <p className="text-xs uppercase tracking-eyebrow text-champagne-400">{journey.theme}</p>
              <h3 className="mt-2 font-display text-2xl font-medium">{journey.title}</h3>
              <p className="mt-2 text-sm text-white/65">{journey.summary}</p>

              {/* Timeline điểm dừng — Route Line ngang */}
              <div className="mt-5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {journey.stops.map((stop, i) => (
                  <div key={stop.place} className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col items-center">
                      <span className="route-dot" />
                      <span className="mt-1.5 whitespace-nowrap text-xs font-medium text-white/80">
                        {stop.place}
                      </span>
                    </div>
                    {i < journey.stops.length - 1 && (
                      <span className="mx-1 h-px w-8 shrink-0 bg-gradient-to-r from-champagne to-champagne/30 sm:w-14" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                  <span className="block text-xs text-white/50">
                    {journey.durationDays} ngày · giá tham khảo từ
                  </span>
                  <span className="font-display text-xl font-semibold text-champagne-400">
                    {formatPrice(journey.price)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-transform group-hover:translate-x-1">
                  Chi tiết <IconArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/holy-land" variant="gold">Xem tất cả hành trình</Button>
        <Button href="/yeu-cau-bao-gia?type=holyland" variant="onDark">Tư vấn đoàn hội thánh riêng</Button>
      </div>
    </Section>
  );
}
