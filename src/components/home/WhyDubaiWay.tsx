import { trustStats } from '@/data/reviews';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  IconGlobe,
  IconShield,
  IconUsers,
  IconSparkle,
} from '@/components/ui/icons';

const reasons = [
  {
    Icon: IconGlobe,
    title: 'Một nền tảng, mọi dịch vụ',
    desc: 'Vé, khách sạn, tour, visa và sự kiện — không phải nhảy qua nhiều nơi.',
  },
  {
    Icon: IconUsers,
    title: 'Đội ngũ am hiểu điểm đến',
    desc: 'Chuyên gia Dubai, Đất Thánh và Châu Âu tư vấn theo đúng nhu cầu của bạn.',
  },
  {
    Icon: IconShield,
    title: 'Minh bạch và an tâm',
    desc: 'Giá tham khảo rõ ràng, hợp đồng minh bạch, hỗ trợ suốt hành trình.',
  },
  {
    Icon: IconSparkle,
    title: 'Từ bình dân đến luxury',
    desc: 'Sản phẩm trải khắp các phân khúc, phù hợp mọi ngân sách.',
  },
];

export function WhyDubaiWay() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Vì sao chọn DubaiWay"
        title="Đồng hành đáng tin cho mỗi hành trình"
        align="center"
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ Icon, title, desc }) => (
          <div key={title} className="text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist-200 text-royal">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-medium text-midnight">{title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-6 rounded-2xl bg-midnight px-6 py-8 text-center text-white lg:grid-cols-4">
        {trustStats.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-3xl font-semibold text-champagne-400 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
