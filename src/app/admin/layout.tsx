import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AREA_SIGN_IN } from '@/config/hosts';
import { Section } from '@/components/ui/Section';
import { getSessionUser, isPlatformStaff } from '@/server/auth';
import { signOutAction } from '@/app/dang-nhap/actions';

const NAV = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/merchant', label: 'Duyệt đối tác' },
  { href: '/admin/dich-vu', label: 'Duyệt dịch vụ' },
  { href: '/admin/danh-muc', label: 'Danh mục' },
  { href: '/admin/don-hang', label: 'Đơn hàng' },
  { href: '/admin/khuyen-mai', label: 'Khuyến mãi' },
  { href: '/admin/danh-gia', label: 'Đánh giá' },
  { href: '/admin/khieu-nai', label: 'Khiếu nại' },
  { href: '/admin/gioi-thieu', label: 'Giới thiệu' },
  { href: '/admin/rut-tien', label: 'Rút tiền' },
  { href: '/admin/bao-cao', label: 'Báo cáo' },
  { href: '/admin/noi-dung', label: 'Nội dung' },
  { href: '/admin/nhan-vien', label: 'Nhân viên' },
  { href: '/admin/nhat-ky', label: 'Nhật ký' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect(AREA_SIGN_IN.admin);
  // Chặn ở máy chủ theo vai trò, không dựa vào việc giấu link.
  if (!isPlatformStaff(user)) redirect('/');

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-wide text-champagne-600">Quản trị</p>
          <p className="mt-1 font-display text-lg font-medium text-midnight">{user.fullName ?? user.email}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{user.roles.join(', ')}</p>

          <nav className="mt-5 space-y-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                    className="block rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-mist-200 hover:text-midnight">
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction} className="mt-5 border-t border-mist pt-4">
            <button type="submit" className="text-sm text-ink-soft hover:text-midnight">Đăng xuất</button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Section>
  );
}
