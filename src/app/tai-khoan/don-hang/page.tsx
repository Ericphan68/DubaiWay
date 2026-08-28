import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';
import { StatusBadge } from '@/components/marketplace/StatusBadges';

export const metadata: Metadata = { title: 'Đơn hàng của tôi', robots: { index: false, follow: false } };

export default async function MyBookingsPage() {
  const user = await getSessionUser();
  const bookings = user ? listBookingsForUser(user.id) : [];

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Đơn hàng của tôi</h1>
      <p className="mt-1 text-sm text-ink-muted">{bookings.length} đơn hàng</p>

      <div className="mt-6">
        {bookings.length === 0 ? (
          <EmptyState
            title="Chưa có đơn hàng"
            body="Khi bạn đặt dịch vụ, đơn hàng và voucher sẽ hiện ở đây."
            action={{ label: 'Khám phá dịch vụ', href: '/danh-muc' }}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Mã đơn</Th><Th>Dịch vụ</Th><Th>Ngày sử dụng</Th>
                  <Th>Trạng thái</Th><Th className="text-right">Số tiền</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {bookings.map((b) => (
                  <tr key={b.reference}>
                    <Td>
                      <Link href={`/dat-cho/thanh-cong/${b.reference}`}
                            className="font-mono text-royal hover:underline">
                        {b.reference}
                      </Link>
                    </Td>
                    <Td>
                      <span className="block text-midnight">{b.serviceTitle}</span>
                      <span className="text-xs text-ink-soft">{b.packageName}</span>
                    </Td>
                    <Td>{new Date(`${b.serviceDate}T00:00:00`).toLocaleDateString('vi-VN')}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-right font-medium text-midnight">
                      {formatMoney(b.financials.customerTotal, 'vi-VN')}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink-muted ${className ?? ''}`}>{children}</td>;
}
