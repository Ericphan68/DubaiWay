import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { signOutAction } from '@/app/dang-nhap/actions';
import { StatusChip } from '@/components/marketplace/StatusBadges';

const NAV = [
  { href: '/merchant', label: 'Tổng quan' },
  { href: '/merchant/dich-vu', label: 'Dịch vụ' },
  { href: '/merchant/don-hang', label: 'Đơn hàng' },
  { href: '/merchant/quet-ma', label: 'Quét voucher' },
];

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/dang-nhap?next=/merchant');
  // Chặn ở máy chủ. Không đủ vai trò thì không vào được, không phải chỉ ẩn menu.
  if (!isMerchantMember(user)) redirect('/tro-thanh-doi-tac');

  const merchant = getMerchantForUser(user.id);

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-wide text-champagne-600">Khu vực đối tác</p>
          <p className="mt-1 font-display text-lg font-medium text-midnight">
            {merchant?.displayName ?? 'Đối tác'}
          </p>
          {merchant ? (
            <p className="mt-1">
              <StatusChip status={merchant.status} />
            </p>
          ) : null}

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

        <div className="min-w-0">
          {merchant && merchant.status !== 'approved' ? (
            <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Hồ sơ của bạn đang ở trạng thái <strong>{merchant.status}</strong>. Dịch vụ chỉ hiển thị
              công khai sau khi hồ sơ được duyệt.
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </Section>
  );
}

