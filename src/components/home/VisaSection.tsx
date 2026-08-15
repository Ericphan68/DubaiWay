import Link from 'next/link';
import { popularVisas } from '@/data/visas';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconClock } from '@/components/ui/icons';

export function VisaSection() {
  return (
    <Section background="mist">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Visa"
            title="Bạn muốn xin visa đi đâu?"
            description="Chọn quốc gia muốn đến, DubaiWay tư vấn điều kiện hồ sơ theo quốc tịch và nơi cư trú của bạn. Chúng tôi hỗ trợ hồ sơ — không cam kết đậu visa."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/visa" variant="primary">Kiểm tra điều kiện visa</Button>
            <Button href="/yeu-cau-bao-gia?type=visa" variant="outline">Nhận tư vấn hồ sơ</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {popularVisas.map((visa) => (
            <Link
              key={visa.slug}
              href={`/visa/${visa.slug}`}
              className="group flex flex-col rounded-xl bg-ivory-100 p-4 shadow-card ring-1 ring-mist transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="text-2xl" aria-hidden>{visa.flag}</span>
              <span className="mt-2 text-sm font-semibold text-midnight group-hover:text-royal">
                {visa.country}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
                <IconClock className="h-3 w-3" /> {visa.processingTime}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal">
                Xem chi tiết <IconArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
