import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { OnboardForm } from './OnboardForm';

export const metadata: Metadata = { title: 'Đăng ký đối tác', robots: { index: false, follow: true } };

export default async function MerchantRegisterPage() {
  const user = await getSessionUser();
  if (!user) redirect('/dang-nhap?next=/merchant/dang-ky');
  // Đã có hồ sơ thì về thẳng trang hồ sơ, không tạo hồ sơ thứ hai.
  if (getMerchantForUser(user.id)) redirect('/merchant/ho-so');

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow="Đăng ký đối tác"
          title="Tạo hồ sơ bán dịch vụ trên DubaiWay"
          description="Điền thông tin, đính kèm giấy tờ pháp lý. Đội thẩm định xét duyệt trong 1–2 ngày làm việc. Không phí niêm yết, DubaiWay chỉ nhận 10% hoa hồng khi bạn bán được."
        />
        <div className="mt-8">
          <OnboardForm />
        </div>
      </div>
    </Section>
  );
}
