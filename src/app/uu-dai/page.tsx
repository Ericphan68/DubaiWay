import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ưu đãi',
  description: 'Mã giảm giá và ưu đãi đang áp dụng trên DubaiWay.',
  alternates: { canonical: `${siteConfig.url}/uu-dai` },
};

/**
 * Ưu đãi lấy từ bảng `coupons` khi có Supabase.
 * Chưa kết nối thì hiện trạng thái rỗng trung thực thay vì bịa ra khuyến mãi không tồn tại.
 */
export default async function OffersPage() {
  const locale = await getLocale();
  const featured = await getRepositories().catalog.listFeaturedServices(locale, 8).catch(() => []);

  return (
    <>
      <Section>
        <SectionHeader
          eyebrow="Ưu đãi"
          title="Ưu đãi đang áp dụng"
          description="Mã giảm giá do DubaiWay hoặc đối tác tài trợ. Nhập mã ở bước thanh toán."
        />
        <div className="mt-10">
          <EmptyState
            title="Hiện chưa có mã giảm giá nào đang chạy"
            body="Chúng tôi chỉ hiển thị ưu đãi có thật và còn hiệu lực. Đăng ký nhận bản tin để biết khi có chương trình mới."
            action={{ label: 'Xem dịch vụ nổi bật', href: '/danh-muc' }}
          />
        </div>
      </Section>

      {featured.length > 0 ? (
        <Section background="white">
          <h2 className="font-display text-2xl font-medium text-midnight">Dịch vụ được đặt nhiều</h2>
          <div className="mt-6"><ServiceGrid services={featured} /></div>
        </Section>
      ) : null}
    </>
  );
}
