import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AREA_SIGN_IN } from '@/config/hosts';
import { ConsoleShell, type ConsoleNavGroup } from '@/components/layout/ConsoleShell';
import { getSessionUser, isPlatformStaff } from '@/server/auth';
import { signOutAction } from '@/app/dang-nhap/actions';

/**
 * Chia theo công việc chứ không đổ một danh sách phẳng 14 mục.
 * "Chờ duyệt" lên đầu vì đó là lý do người vận hành mở trang này.
 */
const NAV: ConsoleNavGroup[] = [
  {
    items: [
      { href: '/admin', label: 'Tổng quan', icon: 'dashboard', exact: true },
    ],
  },
  {
    heading: 'Chờ duyệt',
    items: [
      { href: '/admin/merchant', label: 'Hồ sơ đối tác', icon: 'approve' },
      { href: '/admin/dich-vu', label: 'Dịch vụ', icon: 'service' },
      { href: '/admin/khieu-nai', label: 'Khiếu nại', icon: 'dispute' },
      { href: '/admin/rut-tien', label: 'Yêu cầu rút tiền', icon: 'payout' },
    ],
  },
  {
    heading: 'Vận hành',
    items: [
      { href: '/admin/don-hang', label: 'Đơn hàng', icon: 'order' },
      { href: '/admin/danh-muc', label: 'Danh mục', icon: 'category' },
      { href: '/admin/khuyen-mai', label: 'Khuyến mãi', icon: 'promo' },
      { href: '/admin/danh-gia', label: 'Đánh giá', icon: 'review' },
      { href: '/admin/gioi-thieu', label: 'Giới thiệu', icon: 'referral' },
      { href: '/admin/noi-dung', label: 'Nội dung', icon: 'content' },
    ],
  },
  {
    heading: 'Hệ thống',
    items: [
      { href: '/admin/bao-cao', label: 'Báo cáo', icon: 'report' },
      { href: '/admin/nhan-vien', label: 'Nhân viên', icon: 'staff' },
      { href: '/admin/nhat-ky', label: 'Nhật ký', icon: 'log' },
    ],
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect(AREA_SIGN_IN.admin);
  // Chặn ở máy chủ theo vai trò, không dựa vào việc giấu link.
  if (!isPlatformStaff(user)) redirect('/');

  return (
    <ConsoleShell
      eyebrow="Quản trị"
      title={user.fullName ?? user.email}
      subtitle={
        <p className="text-[0.7rem] uppercase tracking-wide text-white/45">
          {user.roles.join(' · ')}
        </p>
      }
      groups={NAV}
      footer={
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-white/50 transition-colors hover:text-white">
            Đăng xuất
          </button>
        </form>
      }
    >
      {children}
    </ConsoleShell>
  );
}
