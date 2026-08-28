import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { getSessionUser } from '@/server/auth';
import { signOutAction } from '@/app/dang-nhap/actions';

const NAV = [
  { href: '/tai-khoan', label: 'Tổng quan' },
  { href: '/tai-khoan/don-hang', label: 'Đơn hàng' },
  { href: '/tai-khoan/voucher', label: 'Voucher' },
  { href: '/tai-khoan/danh-gia', label: 'Đánh giá' },
  { href: '/tai-khoan/gioi-thieu', label: 'Giới thiệu bạn bè' },
  { href: '/tai-khoan/ho-so', label: 'Hồ sơ' },
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  // Chặn ở máy chủ, không phải giấu bằng CSS.
  if (!user) redirect('/dang-nhap?next=/tai-khoan');

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="font-display text-lg font-medium text-midnight">
            {user.fullName ?? user.email}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">{user.email}</p>

          <nav className="mt-5 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-mist-200 hover:text-midnight"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction} className="mt-5 border-t border-mist pt-4">
            <button type="submit" className="text-sm text-ink-soft hover:text-midnight">
              Đăng xuất
            </button>
          </form>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </Section>
  );
}
