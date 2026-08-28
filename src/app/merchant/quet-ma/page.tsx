import type { Metadata } from 'next';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listBookingsForMerchant } from '@/server/services/booking-store';
import { ScanForm } from './ScanForm';

export const metadata: Metadata = { title: 'Quét voucher', robots: { index: false, follow: false } };

export default async function ScanPage() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  const recent = merchant
    ? listBookingsForMerchant(merchant.id).filter((b) => b.voucher.status === 'redeemed').slice(0, 8)
    : [];

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Quét voucher</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Nhập mã trên voucher của khách hoặc quét mã QR. Mỗi voucher chỉ xác nhận được
        <strong className="text-midnight"> một lần</strong>.
      </p>

      <div className="mt-6 rounded-2xl border border-mist bg-ivory-100 p-5 sm:p-6">
        <ScanForm />
      </div>

      {recent.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium text-midnight">Đã xác nhận gần đây</h2>
          <ul className="mt-3 divide-y divide-mist overflow-hidden rounded-2xl border border-mist bg-ivory-100">
            {recent.map((b) => (
              <li key={b.voucher.code} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="block font-mono text-xs text-ink-soft">{b.voucher.code}</span>
                  <span className="block text-midnight">{b.serviceTitle}</span>
                </span>
                <span className="text-right text-xs text-ink-soft">
                  {b.voucher.redeemedAt ? new Date(b.voucher.redeemedAt).toLocaleString('vi-VN') : ''}
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                    Đã dùng
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
