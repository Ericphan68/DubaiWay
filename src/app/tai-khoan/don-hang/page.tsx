import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { formatMoney } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';
import { StatusBadge } from '@/components/marketplace/StatusBadges';
import { formatMoney as fmt } from '@/core/money';
import { getServiceBySlug } from '@/server/services/catalog-store';
import { previewCancellation } from '@/server/services/dispute-store';
import { CancelBookingForm } from '../AccountForms';

export const metadata: Metadata = { title: 'Đơn hàng của tôi', robots: { index: false, follow: false } };

export default async function MyBookingsPage() {
  const user = await getSessionUser();
  const bookings = user ? listBookingsForUser(user.id) : [];

  // Tính trước số tiền hoàn cho từng đơn để khách thấy rõ trước khi bấm huỷ.
  const cancelInfo = new Map<string, { refundLabel: string; canCancel: boolean; blockReason: string | null }>();
  for (const b of bookings) {
    const tiers = getServiceBySlug(b.serviceSlug)?.policies?.cancellationTiers ?? [];
    try {
      const p = previewCancellation(b.reference, tiers);
      cancelInfo.set(b.reference, {
        refundLabel: fmt(p.refundAmount, 'vi-VN') + ` (${p.refundRateBps / 100}%)`,
        canCancel: p.canCancel,
        blockReason: p.reason,
      });
    } catch {
      cancelInfo.set(b.reference, { refundLabel: '—', canCancel: false, blockReason: 'Không tính được mức hoàn.' });
    }
  }

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
                  // Mỗi đơn chiếm hai hàng: một hàng dữ liệu, một hàng thao tác huỷ.
                  <Fragment key={b.reference}>
                  <tr>
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
                  <tr>
                    <td className="px-4 pb-4 pt-0" />
                    <td colSpan={4} className="px-4 pb-4 pt-0">
                      <CancelBookingForm
                        reference={b.reference}
                        refundLabel={cancelInfo.get(b.reference)?.refundLabel ?? '—'}
                        canCancel={cancelInfo.get(b.reference)?.canCancel ?? false}
                        blockReason={cancelInfo.get(b.reference)?.blockReason ?? null}
                      />
                    </td>
                  </tr>
                  </Fragment>
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
