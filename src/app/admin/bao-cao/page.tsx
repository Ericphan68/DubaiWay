import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { listAllBookings, platformTotals } from '@/server/services/booking-store';
import { listAllRewards, listAllWithdrawals } from '@/server/services/referral-store';
import { listMerchants } from '@/server/services/merchant-store';
import { listServices } from '@/server/services/catalog-store';
import { listCancellations, listDisputes } from '@/server/services/dispute-store';
import { listRedemptions } from '@/server/services/coupon-store';

export const metadata: Metadata = { title: 'Báo cáo — Quản trị', robots: { index: false, follow: false } };

const aed = (m: number) => formatMoney(fromMinorUnits(m, 'AED'), 'vi-VN');

export default async function AdminReportsPage() {
  const t = platformTotals();
  const bookings = listAllBookings();
  const rewards = listAllRewards();
  const withdrawals = listAllWithdrawals();
  const merchants = listMerchants();
  const services = listServices();
  const cancellations = listCancellations();
  const disputes = listDisputes();
  const couponRedemptions = listRedemptions();

  const paidBookings = bookings.filter((b) => ['paid', 'confirmed', 'completed'].includes(b.status));

  // Doanh thu theo tháng.
  const byMonth = new Map<string, { gmv: number; commission: number; net: number; count: number }>();
  for (const b of paidBookings) {
    const key = b.createdAt.slice(0, 7);
    const cur = byMonth.get(key) ?? { gmv: 0, commission: 0, net: 0, count: 0 };
    cur.gmv += b.financials.customerTotal.amount;
    cur.commission += b.financials.platformCommission.amount;
    cur.net += b.financials.platformNetRevenue.amount;
    cur.count += 1;
    byMonth.set(key, cur);
  }
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);

  // Đối tác theo doanh thu.
  const byMerchant = new Map<string, { name: string; gmv: number; count: number }>();
  for (const b of paidBookings) {
    const m = merchants.find((x) => x.id === b.merchantId);
    const cur = byMerchant.get(b.merchantId) ?? { name: m?.displayName ?? '—', gmv: 0, count: 0 };
    cur.gmv += b.financials.customerTotal.amount;
    cur.count += 1;
    byMerchant.set(b.merchantId, cur);
  }
  const topMerchants = [...byMerchant.values()].sort((a, b) => b.gmv - a.gmv).slice(0, 10);

  // Hiệu quả giới thiệu.
  const referredBookings = paidBookings.filter((b) => b.referrerUserId !== null);
  const referralGmv = referredBookings.reduce((s, b) => s + b.financials.customerTotal.amount, 0);
  const referralCost = rewards.reduce((s, r) => s + r.amountMinor, 0);

  const cancelRate = bookings.length > 0
    ? Math.round((bookings.filter((b) => b.status === 'cancelled' || b.status === 'refunded').length / bookings.length) * 1000) / 10
    : 0;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Báo cáo</h1>
      <p className="mt-1 text-sm text-ink-muted">Số liệu tổng hợp toàn nền tảng.</p>

      <Section title="Tài chính">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Tổng giá trị giao dịch" value={aed(t.gmv)} />
          <Stat label="Hoa hồng nền tảng" value={aed(t.commission)} />
          <Stat label="Doanh thu đối tác" value={aed(t.merchantRevenue)} />
          <Stat label="Thưởng giới thiệu" value={aed(t.referralPaid)} />
          <Stat label="Doanh thu ròng" value={aed(t.netRevenue)} highlight />
          <Stat label="Đã hoàn cho khách"
                value={aed(cancellations.reduce((s, c) => s + c.refundAmountMinor, 0))} />
        </div>
      </Section>

      <Section title="Theo tháng">
        {months.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : (
          <Table head={['Tháng', 'Đơn', 'GMV', 'Hoa hồng', 'Ròng']}
                 rows={months.map(([m, v]) => [
                   m.split('-').reverse().join('/'),
                   String(v.count),
                   aed(v.gmv),
                   aed(v.commission),
                   aed(v.net),
                 ])} />
        )}
      </Section>

      <Section title="Đối tác theo doanh thu">
        {topMerchants.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : (
          <Table head={['Đối tác', 'Đơn', 'GMV']}
                 rows={topMerchants.map((m) => [m.name, String(m.count), aed(m.gmv)])} />
        )}
      </Section>

      <Section title="Hiệu quả chương trình giới thiệu">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Đơn có người giới thiệu" value={String(referredBookings.length)} />
          <Stat label="GMV từ giới thiệu" value={aed(referralGmv)} />
          <Stat label="Chi phí thưởng" value={aed(referralCost)} />
          <Stat
            label="Tỷ lệ chi/GMV"
            value={referralGmv > 0 ? `${Math.round((referralCost / referralGmv) * 1000) / 10}%` : '—'}
          />
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Chi phí thưởng luôn bằng 30% hoa hồng nền tảng của đơn có người giới thiệu — tức
          khoảng 3% GMV của nhóm đơn đó.
        </p>
      </Section>

      <Section title="Vận hành">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Đối tác đã duyệt" value={String(merchants.filter((m) => m.status === 'approved').length)} />
          <Stat label="Dịch vụ đang bán" value={String(services.filter((s) => s.status === 'active').length)} />
          <Stat label="Tỷ lệ huỷ / hoàn tiền" value={`${cancelRate}%`} urgent={cancelRate > 15} />
          <Stat label="Khiếu nại đang mở"
                value={String(disputes.filter((d) => d.status !== 'resolved' && d.status !== 'rejected').length)} />
          <Stat label="Lượt dùng mã khuyến mãi" value={String(couponRedemptions.length)} />
          <Stat label="Yêu cầu rút tiền chờ duyệt"
                value={String(withdrawals.filter((w) => w.status === 'requested').length)} />
        </div>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stat({ label, value, highlight, urgent }: {
  label: string; value: string; highlight?: boolean; urgent?: boolean;
}) {
  const cls = urgent ? 'border-amber-300 bg-amber-50'
    : highlight ? 'border-champagne bg-champagne/[0.05]'
    : 'border-mist bg-ivory-100';
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}

function Table({ head, rows }: { head: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-mist">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-ivory-200 text-left">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-mist bg-ivory-100">
          {rows.map((r) => (
            <tr key={r.join('|')}>
              {r.map((cell, i) => (
                <td key={i} className={`px-4 py-3 text-ink-muted ${i > 0 ? 'text-right' : 'text-midnight'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
