import Image from 'next/image';
import { img, photo } from '@/data/images';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { IconUsers, IconShield, IconCheck } from '@/components/ui/icons';

const groupTypes = [
  { title: 'Tour đoàn riêng', desc: 'Lịch trình và ngày khởi hành theo yêu cầu của đoàn.' },
  { title: 'Tour doanh nghiệp', desc: 'Kết hợp du lịch, khen thưởng và team building.' },
  { title: 'Tour hội thánh', desc: 'Hành trình Đất Thánh cho đoàn mục vụ và tín hữu.' },
  { title: 'Tour trường học', desc: 'Chương trình giáo dục – trải nghiệm an toàn.' },
];

export function GroupToursSection() {
  return (
    <Section background="midnight">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative order-last aspect-[4/3] overflow-hidden rounded-2xl lg:order-first">
          <Image
            src={img(photo.team, 1200)}
            alt="Đoàn khách DubaiWay"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 flex gap-3">
            <div className="rounded-xl bg-midnight/80 px-4 py-3 backdrop-blur-sm">
              <p className="font-display text-2xl font-semibold text-champagne-400">350+</p>
              <p className="text-xs text-white/70">đoàn đã phục vụ</p>
            </div>
            <div className="rounded-xl bg-midnight/80 px-4 py-3 backdrop-blur-sm">
              <p className="font-display text-2xl font-semibold text-champagne-400">10–500</p>
              <p className="text-xs text-white/70">khách mỗi đoàn</p>
            </div>
          </div>
        </div>

        <div className="text-white">
          <span className="eyebrow text-champagne-400">
            <span className="route-dot" /> Tour đoàn &amp; doanh nghiệp
          </span>
          <h2 className="mt-3 text-display-md font-medium">
            Một đầu mối lo trọn hành trình cho cả đoàn
          </h2>
          <p className="mt-3 text-white/70">
            Từ báo giá, vé máy bay, visa đoàn đến điều phối tại điểm đến — có trưởng đoàn và hướng dẫn
            viên đồng hành suốt tuyến.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {groupTypes.map((g) => (
              <div key={g.title} className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                <p className="font-medium text-white">{g.title}</p>
                <p className="mt-1 text-sm text-white/60">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5"><IconUsers className="h-4 w-4 text-champagne-400" /> Điều phối đoàn</span>
            <span className="inline-flex items-center gap-1.5"><IconShield className="h-4 w-4 text-champagne-400" /> Bảo hiểm đầy đủ</span>
            <span className="inline-flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-champagne-400" /> Hợp đồng rõ ràng</span>
          </div>

          <Button href="/yeu-cau-bao-gia?type=group" variant="gold" className="mt-7">
            Yêu cầu báo giá tour đoàn
          </Button>
        </div>
      </div>
    </Section>
  );
}
