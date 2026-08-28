import type { Metadata } from 'next';
import { formatMoney } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listBookingsForMerchant } from '@/server/services/booking-store';
import { StatusBadge } from '@/components/marketplace/StatusBadges';

export const metadata: Metadata = { title: 'Đơn hàng — Đối tác', robots: { index: false, follow: false } };

export default async function MerchantBookingsPage() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  const bookings = merchant ? listBookingsForMerchant(merchant.id) : [];

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Đơn hàng</h1>
      <p className="mt-1 text-sm text-ink-muted">{bookings.length} đơn</p>

      <div className="mt-6">
        {bookings.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng" body="Đơn của khách sẽ hiện ở đây ngay khi phát sinh." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Mã đơn</Th><Th>Dịch vụ</Th><Th>Khách</Th><Th>Ngày</Th>
                  <Th>Trạng thái</Th><Th>Voucher</Th>
                  <Th className="text-right">Khách trả</Th><Th className="text-right">Bạn nhận</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {bookings.map((b) => (
                  <tr key={b.reference}>
                    <Td className="font-mono text-xs">{b.reference}</Td>
                    <Td>
                      <span className="block text-midnight">{b.serviceTitle}</span>
                      <span className="text-xs text-ink-soft">{b.packageName}</span>
                    </Td>
                    <Td>
                      <span className="block text-midnight">{b.travelers[0]?.fullName ?? '—'}</span>
                      <span className="text-xs text-ink-soft">{b.adults + b.children} khách</span>
                    </Td>
                    <Td>{new Date(`${b.serviceDate}T00:00:00`).toLocaleDateString('vi-VN')}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-xs">
                      {b.voucher.status === 'redeemed' ? (
                        <span className="text-emerald-700">Đã dùng</span>
                      ) : b.voucher.status === 'confirmed' ? (
                        <span className="text-amber-700">Chờ quét</span>
                      ) : (
                        <span className="text-ink-soft">{b.voucher.status}</span>
                      )}
                    </Td>
                    <Td className="text-right">{formatMoney(b.financials.customerTotal, 'vi-VN')}</Td>
                    <Td className="text-right font-medium text-midnight">
                      {formatMoney(b.financials.merchantRevenue, 'vi-VN')}
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
  return <th className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink-muted ${className ?? ''}`}>{children}</td>;
}
