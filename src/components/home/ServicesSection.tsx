import Link from 'next/link';
import { supportServices } from '@/data/services';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  IconCar,
  IconShield,
  IconAnchor,
  IconGlobe,
  IconUsers,
  IconSparkle,
} from '@/components/ui/icons';

const groupIcon: Record<string, typeof IconCar> = {
  'Di chuyển': IconCar,
  'An tâm': IconShield,
  'Trải nghiệm': IconAnchor,
  'Đồng hành': IconUsers,
  'Ưu tiên': IconSparkle,
};

export function ServicesSection() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Dịch vụ bổ trợ"
        title="Những mảnh ghép hoàn thiện chuyến đi"
        description="Đưa đón, thuê xe, du thuyền, bảo hiểm, eSIM, hướng dẫn viên và dịch vụ ưu tiên sân bay — thêm vào bất kỳ hành trình nào."
        link={{ label: 'Xem tất cả dịch vụ', href: '/dich-vu' }}
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {supportServices.map((svc) => {
          const Icon = groupIcon[svc.group] ?? IconGlobe;
          return (
            <Link
              key={svc.slug}
              href={`/dich-vu#${svc.slug}`}
              className="group flex flex-col rounded-xl border border-mist bg-ivory-100 p-5 transition-all hover:-translate-y-0.5 hover:border-royal/30 hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mist-200 text-royal transition-colors group-hover:bg-royal group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-midnight">{svc.name}</p>
              <p className="mt-1 text-xs text-ink-soft">{svc.summary}</p>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
