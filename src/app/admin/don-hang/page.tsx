import type { Metadata } from 'next';
import { formatMoney } from '@/core/money';
import { EmptyState } from '@/components/states';
import { listAllBookings } from '@/server/services/booking-store';
import { getMerchant } from '@/server/services/merchant-store';
import { StatusBadge } from '@/components/marketplace/StatusBadges';

export const metadata: Metadata = { title: 'Đơn hàng — Quản trị', robots: { index: false, follow: false } };

export default async function AdminBookingsPage() {
  const bookings = listAllBookings();

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Đơn hàng toàn nền tảng</h1>
      <p className="mt-1 text-sm text-ink-muted">{bookings.length} đơn</p>

      <div className="mt-6">
        {bookings.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng nào" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Mã đơn</Th><Th>Dịch vụ</Th><Th>Đối tác</Th><Th>Trạng thái</Th>
                  <Th className="text-right">Khách trả</Th><Th className="text-right">Đối tác nhận</Th>
                  <Th className="text-right">Hoa hồng</Th><Th className="text-right">Thưởng GT</Th>
                  <Th className="text-right">DubaiWay giữ</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {bookings.map((b) => {
                  const f = b.financials;
                  return (
                    <tr key={b.reference}>
                      <Td className="font-mono text-xs">{b.reference}</Td>
                      <Td>{b.serviceTitle}</Td>
                      <Td className="text-xs">{getMerchant(b.merchantId)?.displayName ?? '—'}</Td>
                      <Td><StatusBadge status={b.status} /></Td>
                      <Td className="text-right">{formatMoney(f.customerTotal, 'vi-VN')}</Td>
                      <Td className="text-right">{formatMoney(f.merchantRevenue, 'vi-VN')}</Td>
                      <Td className="text-right">{formatMoney(f.platformCommission, 'vi-VN')}</Td>
                      <Td className="text-right">{formatMoney(f.referralReward, 'vi-VN')}</Td>
                      <Td className="text-right font-medium text-midnight">
                        {formatMoney(f.platformNetRevenue, 'vi-VN')}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
