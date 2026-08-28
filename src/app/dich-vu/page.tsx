import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Tất cả dịch vụ',
  description: 'Toàn bộ dịch vụ du lịch tại Dubai và UAE trên DubaiWay — tour, vé tham quan, safari sa mạc, du thuyền, đưa đón sân bay và nhiều hơn nữa.',
  alternates: { canonical: `${siteConfig.url}/dich-vu` },
};

export default async function AllServicesPage() {
  const locale = await getLocale();
  let result;
  try {
    result = await getRepositories().catalog.searchServices({ pageSize: 48 }, locale);
  } catch {
    return <Section><ErrorState body="Không tải được danh sách dịch vụ." retryHref="/dich-vu" /></Section>;
  }

  return (
    <Section>
      <SectionHeader
        eyebrow="Toàn bộ dịch vụ"
        title="Mọi trải nghiệm trên DubaiWay"
        description={result.total > 0 ? `${result.total} dịch vụ từ các đối tác đã được xác minh.` : undefined}
      />
      <div className="mt-10">
        {result.items.length === 0 ? (
          <EmptyState title="Chưa có dịch vụ nào" action={{ label: 'Xem danh mục', href: '/danh-muc' }} />
        ) : (
          <ServiceGrid services={result.items} />
        )}
      </div>
    </Section>
  );
}
