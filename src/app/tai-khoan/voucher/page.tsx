import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';

export const metadata: Metadata = { title: 'Voucher của tôi', robots: { index: false, follow: false } };

const VOUCHER_LABEL: Record<string, { text: string; cls: string }> = {
  issued:    { text: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-800' },
  confirmed: { text: 'Sẵn sàng dùng',  cls: 'bg-emerald-50 text-emerald-700' },
  redeemed:  { text: 'Đã sử dụng',     cls: 'bg-mist-200 text-ink-soft' },
  expired:   { text: 'Hết hạn',        cls: 'bg-mist-200 text-ink-soft' },
  cancelled: { text: 'Đã huỷ',         cls: 'bg-mist-200 text-ink-soft' },
  refunded:  { text: 'Đã hoàn tiền',   cls: 'bg-mist-200 text-ink-soft' },
};

export default async function MyVouchersPage() {
  const user = await getSessionUser();
  const bookings = user ? listBookingsForUser(user.id) : [];
  const usable = bookings.filter((b) => b.voucher.status !== 'cancelled');

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Voucher của tôi</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Xuất trình mã QR cho đối tác khi sử dụng dịch vụ. Mỗi voucher chỉ dùng được một lần.
      </p>

      <div className="mt-6">
        {usable.length === 0 ? (
          <EmptyState
            title="Chưa có voucher nào"
            body="Voucher được phát ngay sau khi bạn thanh toán thành công."
            action={{ label: 'Khám phá dịch vụ', href: '/danh-muc' }}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {usable.map((b) => {
              const s = VOUCHER_LABEL[b.voucher.status] ?? VOUCHER_LABEL.issued;
              return (
                <li key={b.voucher.code}>
                  <Link
                    href={`/dat-cho/thanh-cong/${b.reference}`}
                    className="block rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-champagne"
                  >
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                      {s.text}
                    </span>
                    <span className="mt-2 block font-medium text-midnight">{b.serviceTitle}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">{b.packageName}</span>
                    <span className="mt-3 block font-mono text-xs text-ink-muted">{b.voucher.code}</span>
                    <span className="mt-1 block text-sm text-ink-muted">
                      {new Date(`${b.voucher.serviceDate}T00:00:00`).toLocaleDateString('vi-VN', {
                        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                      {' · '}{b.voucher.guestCount} khách
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
