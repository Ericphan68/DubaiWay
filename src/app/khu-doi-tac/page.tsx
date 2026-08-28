import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AreaSignIn, STAFF_ROLES } from '@/components/account/AreaSignIn';
import { getSessionUser } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Đăng nhập đối tác',
  description: 'Cổng đăng nhập dành cho đối tác cung cấp dịch vụ trên DubaiWay.',
  robots: { index: false, follow: false },
};

export default async function MerchantSignInPage() {
  const user = await getSessionUser();
  if (user) redirect('/merchant');

  return (
    <AreaSignIn
      landing="/merchant"
      eyebrow="Khu đối tác"
      title="Đăng nhập đối tác"
      description="Quản lý dịch vụ, lịch mở bán, đơn hàng và đối soát doanh thu."
      footer={
        <>
          Chưa có tài khoản đối tác?{' '}
          <a href="/merchant/dang-ky" className="text-royal hover:underline">Đăng ký làm đối tác</a>
        </>
      }
      demoFilter={(roles) => roles.some((r) => r.startsWith('merchant_') && !STAFF_ROLES.includes(r))}
    />
  );
}
