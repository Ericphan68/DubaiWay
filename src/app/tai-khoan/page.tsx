import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';
import { StatusBadge } from '@/components/marketplace/StatusBadges';

export const metadata: Metadata = { title: 'Tài khoản', robots: { index: false, follow: false } };

export default async function AccountHomePage() {
  const user = await getSessionUser();
  const bookings = user ? listBookingsForUser(user.id) : [];

  const upcoming = bookings.filter(
    (b) => (b.status === 'paid' || b.status === 'confirmed') && b.serviceDate >= new Date().toISOString().slice(0, 10),
  );
  const spent = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'pending_payment')
    .reduce((s, b) => s + b.financials.customerTotal.amount, 0);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">
        Xin chào{user?.fullName ? `, ${user.fullName.split(' ').slice(-1)[0]}` : ''}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Đơn hàng" value={String(bookings.length)} />
        <Stat label="Sắp sử dụng" value={String(upcoming.length)} />
        <Stat label="Đã chi tiêu" value={formatMoney(fromMinorUnits(spent, 'USD'), 'vi-VN')} />
      </div>

      <h2 className="mt-10 font-display text-xl font-medium text-midnight">Đơn hàng gần đây</h2>
      <div className="mt-4">
        {bookings.length === 0 ? (
          <EmptyState
            title="Bạn chưa có đơn hàng nào"
            body="Khám phá các trải nghiệm tại Dubai và đặt chuyến đầu tiên của bạn."
            action={{ label: 'Khám phá dịch vụ', href: '/danh-muc' }}
          />
        ) : (
          <ul className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.reference}>
                <Link
                  href={`/dat-cho/thanh-cong/${b.reference}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist bg-ivory-100 p-4 transition-colors hover:border-champagne"
                >
                  <span>
                    <span className="block font-medium text-midnight">{b.serviceTitle}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {b.reference} · {new Date(`${b.serviceDate}T00:00:00`).toLocaleDateString('vi-VN')}
                    </span>
                  </span>
                  <span className="text-right">
                    <StatusBadge status={b.status} />
                    <span className="mt-1 block font-medium text-midnight">
                      {formatMoney(b.financials.customerTotal, 'vi-VN')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}

