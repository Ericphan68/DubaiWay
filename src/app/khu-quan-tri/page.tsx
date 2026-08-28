import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AreaSignIn, STAFF_ROLES } from '@/components/account/AreaSignIn';
import { getSessionUser } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Đăng nhập quản trị',
  description: 'Cổng đăng nhập nội bộ DubaiWay.',
  robots: { index: false, follow: false },
};

export default async function AdminSignInPage() {
  const user = await getSessionUser();
  if (user) redirect('/admin');

  return (
    <AreaSignIn
      landing="/admin"
      eyebrow="Khu quản trị"
      title="Đăng nhập nội bộ"
      description="Duyệt đối tác và dịch vụ, xử lý khiếu nại, đối soát và rút tiền."
      demoFilter={(roles) => roles.some((r) => STAFF_ROLES.includes(r))}
    />
  );
}
