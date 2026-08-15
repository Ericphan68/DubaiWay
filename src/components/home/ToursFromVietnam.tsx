import { featuredFromVietnam } from '@/data/tours';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TourCard } from '@/components/cards/TourCard';
import { IconCheck } from '@/components/ui/icons';

const perks = ['Vé máy bay', 'Visa', 'Khách sạn', 'HDV tiếng Việt', 'Trưởng đoàn'];

export function ToursFromVietnam() {
  return (
    <Section background="ivory">
      <SectionHeader
        eyebrow="Tour khởi hành từ Việt Nam"
        title="Trọn gói, khởi hành từ TP.HCM · Hà Nội · Đà Nẵng"
        description="Giá niêm yết bằng VND, đã gồm những gì bạn cần cho một chuyến đi an tâm."
        link={{ label: 'Tất cả tour từ Việt Nam', href: '/du-lich/tu-viet-nam' }}
      />

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {perks.map((perk) => (
          <span key={perk} className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
            <IconCheck className="h-4 w-4 text-emerald-600" /> {perk}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredFromVietnam.map((tour) => (
          <TourCard key={tour.slug} tour={tour} />
        ))}
      </div>
    </Section>
  );
}
