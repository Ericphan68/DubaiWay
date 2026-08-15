import { featuredAtDestination } from '@/data/tours';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TourCard } from '@/components/cards/TourCard';

export function ToursAtDestination() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Tour tại điểm đến"
        title="Đã ở điểm đến? Ghép tour, đặt trải nghiệm ngay"
        description="Dành cho người Việt tại Dubai, khách ở nước ngoài và khách tự bay đến — tour trong ngày, city tour, private tour, vé tham quan và đưa đón."
        link={{ label: 'Khám phá tour tại điểm đến', href: '/du-lich/tai-diem-den' }}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredAtDestination.map((tour) => (
          <TourCard key={tour.slug} tour={tour} />
        ))}
      </div>
    </Section>
  );
}
