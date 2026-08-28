import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listBookingsForMerchant, merchantTotals } from '@/server/services/booking-store';
import { listCancellations } from '@/server/services/dispute-store';

export const metadata: Metadata = { title: 'Doanh thu & đối soát', robots: { index: false, follow: false } };

const aed = (m: number) => formatMoney(fromMinorUnits(m, 'AED'), 'vi-VN');

export default async function MerchantRevenuePage() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  if (!merchant) return null;

  const bookings = listBookingsForMerchant(merchant.id);
  const totals = merchantTotals(merchant.id, 'AED');

  // Tiền chỉ được giải ngân sau khi dịch vụ hoàn thành và hết hạn khiếu nại.
  const now = Date.now();
  const settled = bookings.filter(
    (b) => b.status === 'completed' && b.disputeWindowEndsAt && new Date(b.disputeWindowEndsAt).getTime() < now,
  );
  const pending = bookings.filter(
    (b) => (b.status === 'paid' || b.status === 'confirmed') ||
           (b.status === 'completed' && (!b.disputeWindowEndsAt || new Date(b.disputeWindowEndsAt).getTime() >= now)),
  );

  const sum = (list: typeof bookings) => list.reduce((s, b) => s + b.financials.merchantRevenue.amount, 0);
  const availableMinor = sum(settled);
  const pendingMinor = sum(pending);

  const cancellations = listCancellations().filter((c) =>
    bookings.some((b) => b.reference === c.bookingReference));
  const refundedMinor = cancellations.reduce((s, c) => s + Math.abs(c.merchantReversalMinor), 0);

  // Doanh thu theo tháng để đối tác nhìn được xu hướng.
  const byMonth = new Map<string, number>();
  for (const b of bookings) {
    if (!['paid', 'confirmed', 'completed'].includes(b.status)) continue;
    const key = b.createdAt.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + b.financials.merchantRevenue.amount);
  }
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);

  // Dịch vụ bán chạy.
  const byService = new Map<string, { title: string; count: number; revenue: number }>();
  for (const b of bookings) {
    if (!['paid', 'confirmed', 'completed'].includes(b.status)) continue;
    const cur = byService.get(b.serviceSlug) ?? { title: b.serviceTitle, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += b.financials.merchantRevenue.amount;
    byService.set(b.serviceSlug, cur);
  }
  const topServices = [...byService.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Doanh thu & đối soát</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Tiền được giải ngân sau khi dịch vụ hoàn thành và hết thời hạn khiếu nại của khách.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Doanh thu gộp" value={aed(totals.grossSales)} />
        <Stat label="Hoa hồng DubaiWay" value={aed(totals.commission)} />
        <Stat label="Có thể nhận" value={aed(availableMinor)} highlight />
        <Stat label="Đang chờ đối soát" value={aed(pendingMinor)} />
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Kiểm tra: bạn nhận {aed(totals.netRevenue)} + hoa hồng {aed(totals.commission)} = tổng khách trả{' '}
        {aed(totals.grossSales)}.
        {refundedMinor > 0 ? ` Đã hoàn lại khách ${aed(refundedMinor)} từ ${cancellations.length} đơn huỷ.` : ''}
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium text-midnight">Doanh thu theo tháng</h2>
        <div className="mt-3">
          {months.length === 0 ? (
            <EmptyState title="Chưa có doanh thu" body="Số liệu hiện ra khi có đơn hàng đầu tiên." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-mist">
              <table className="w-full min-w-[360px] text-sm">
                <thead className="bg-ivory-200 text-left">
                  <tr><Th>Tháng</Th><Th className="text-right">Bạn nhận</Th></tr>
                </thead>
                <tbody className="divide-y divide-mist bg-ivory-100">
                  {months.map(([m, v]) => (
                    <tr key={m}>
                      <Td>{m.split('-').reverse().join('/')}</Td>
                      <Td className="text-right font-medium text-midnight">{aed(v)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium text-midnight">Dịch vụ bán chạy</h2>
        <div className="mt-3">
          {topServices.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu" />
          ) : (
            <ul className="space-y-2">
              {topServices.map((s) => (
                <li key={s.title} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-mist bg-ivory-100 px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium text-midnight">{s.title}</span>
                    <span className="text-xs text-ink-soft">{s.count} đơn</span>
                  </span>
                  <span className="font-medium text-midnight">{aed(s.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-8 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
        Chuyển tiền thực tế về tài khoản ngân hàng cần nối với hệ thống thanh toán — sẽ bổ sung ở
        giai đoạn tài chính. Trang này cho bạn theo dõi số liệu chính xác trong thời gian đó.
      </p>
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
function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
