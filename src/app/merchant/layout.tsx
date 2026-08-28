import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AREA_SIGN_IN } from '@/config/hosts';
import { ConsoleShell, type ConsoleNavGroup } from '@/components/layout/ConsoleShell';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { signOutAction } from '@/app/dang-nhap/actions';
import { StatusChip } from '@/components/marketplace/StatusBadges';

/** Chia theo việc hằng ngày: bán gì — bán được bao nhiêu — hồ sơ. */
const NAV: ConsoleNavGroup[] = [
  {
    items: [
      { href: '/merchant', label: 'Tổng quan', icon: 'dashboard', exact: true },
    ],
  },
  {
    heading: 'Bán hàng',
    items: [
      { href: '/merchant/dich-vu', label: 'Dịch vụ', icon: 'service' },
      { href: '/merchant/lich', label: 'Lịch & tồn kho', icon: 'calendar' },
      { href: '/merchant/don-hang', label: 'Đơn hàng', icon: 'order' },
      { href: '/merchant/quet-ma', label: 'Quét voucher', icon: 'scan' },
    ],
  },
  {
    heading: 'Theo dõi',
    items: [
      { href: '/merchant/doanh-thu', label: 'Doanh thu', icon: 'report' },
      { href: '/merchant/danh-gia', label: 'Đánh giá', icon: 'review' },
      { href: '/merchant/ho-so', label: 'Hồ sơ đối tác', icon: 'profile' },
    ],
  },
];

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  // Trang đăng nhập riêng của khu đối tác. Đặt ngoài /merchant nên không lọt
  // vào chính lớp chặn này, tránh chuyển hướng vòng tròn.
  if (!user) redirect(AREA_SIGN_IN.merchant);
  // Người đã có hồ sơ đối tác hoặc có vai trò merchant đều vào được.
  // Người chưa có gì thì đẩy sang trang đăng ký thay vì chặn cụt.
  const merchant = getMerchantForUser(user.id);
  if (!merchant && !isMerchantMember(user)) redirect('/merchant/dang-ky');

  return (
    <ConsoleShell
      eyebrow="Khu đối tác"
      title={merchant?.displayName ?? 'Đối tác'}
      subtitle={merchant ? <StatusChip status={merchant.status} /> : null}
      groups={NAV}
      footer={
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-white/50 transition-colors hover:text-white">
            Đăng xuất
          </button>
        </form>
      }
    >
      {merchant && merchant.status !== 'approved' ? (
        <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Hồ sơ của bạn đang chờ duyệt. Dịch vụ chỉ hiển thị công khai sau khi hồ sơ được duyệt —
          trong lúc chờ, bạn vẫn soạn dịch vụ và mở lịch bình thường.
        </p>
      ) : null}
      {children}
    </ConsoleShell>
  );
}
