import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser, listServices } from '@/server/services/merchant-store';
import { listBookingsForMerchant, merchantTotals } from '@/server/services/booking-store';

export const metadata: Metadata = { title: 'Tổng quan đối tác', robots: { index: false, follow: false } };

export default async function MerchantDashboard() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  if (!merchant) return <EmptyState title="Chưa có hồ sơ đối tác" action={{ label: 'Đăng ký đối tác', href: '/tro-thanh-doi-tac' }} />;

  const totals = merchantTotals(merchant.id, 'USD');
  const bookings = listBookingsForMerchant(merchant.id);
  const services = listServices(merchant.id);
  const pendingRedeem = bookings.filter((b) => b.voucher.status === 'confirmed').length;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Tổng quan</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Doanh thu gộp" value={formatMoney(fromMinorUnits(totals.grossSales, 'USD'), 'vi-VN')} />
        <Stat label="Bạn thực nhận" value={formatMoney(fromMinorUnits(totals.netRevenue, 'USD'), 'vi-VN')} highlight />
        <Stat label="Hoa hồng DubaiWay" value={formatMoney(fromMinorUnits(totals.commission, 'USD'), 'vi-VN')} />
        <Stat label="Đơn hàng" value={String(totals.bookingCount)} />
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Hoa hồng nền tảng 10% tính trên tiền hàng sau giảm giá, chưa gồm thuế thu hộ.
        Số liệu chỉ tính đơn đã thanh toán trở lên.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Dịch vụ đang bán" value={String(services.filter((s) => s.status === 'active').length)} />
        <Stat label="Dịch vụ chờ duyệt" value={String(services.filter((s) => s.status === 'under_review' || s.status === 'submitted').length)} />
        <Stat label="Voucher chờ quét" value={String(pendingRedeem)} />
      </div>

      <h2 className="mt-10 font-display text-xl font-medium text-midnight">Đơn hàng mới nhất</h2>
      <div className="mt-4">
        {bookings.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng nào" body="Đơn hàng của khách sẽ hiện ở đây ngay khi có." />
        ) : (
          <ul className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.reference} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist bg-ivory-100 px-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-midnight">{b.serviceTitle}</span>
                  <span className="text-xs text-ink-soft">
                    {b.reference} · {b.travelers[0]?.fullName ?? '—'} · {b.adults + b.children} khách
                  </span>
                </span>
                <span className="text-right text-sm">
                  <span className="block font-medium text-midnight">
                    {formatMoney(b.financials.merchantRevenue, 'vi-VN')}
                  </span>
                  <span className="text-xs text-ink-soft">bạn nhận</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-champagne bg-champagne/[0.05]' : 'border-mist bg-ivory-100'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}
