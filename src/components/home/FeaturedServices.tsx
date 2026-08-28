import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';

/** Dịch vụ nổi bật — dữ liệu thật từ repository, không phải danh sách cứng. */
export async function FeaturedServices() {
  const locale = await getLocale();
  const services = await getRepositories().catalog.listFeaturedServices(locale, 8).catch(() => []);
  if (services.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        eyebrow="Được đặt nhiều nhất"
        title="Trải nghiệm nổi bật tại Dubai"
        description="Những dịch vụ khách quốc tế đặt nhiều nhất, từ các đối tác đã được DubaiWay xác minh."
        link={{ label: 'Xem tất cả dịch vụ', href: '/dich-vu' }}
      />
      <div className="mt-8">
        <ServiceGrid services={services} />
      </div>
    </Section>
  );
}
