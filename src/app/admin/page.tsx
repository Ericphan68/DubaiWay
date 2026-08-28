import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { platformTotals } from '@/server/services/booking-store';
import { listAllRewards, listAllWithdrawals } from '@/server/services/referral-store';
import { listMerchants, listServices } from '@/server/services/merchant-store';

export const metadata: Metadata = { title: 'Quản trị', robots: { index: false, follow: false } };

export default async function AdminDashboard() {
  const t = platformTotals();
  const merchants = listMerchants();
  const services = listServices();
  const rewards = listAllRewards();
  const withdrawals = listAllWithdrawals();

  const usd = (minor: number) => formatMoney(fromMinorUnits(minor, 'USD'), 'vi-VN');
  const pendingMerchants = merchants.filter(
    (m) => m.status === 'submitted' || m.status === 'under_review',
  ).length;
  const pendingServices = services.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review',
  ).length;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Tổng quan nền tảng</h1>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft">Tài chính</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Tổng giá trị giao dịch" value={usd(t.gmv)} />
        <Stat label="Hoa hồng nền tảng" value={usd(t.commission)} />
        <Stat label="Doanh thu đối tác" value={usd(t.merchantRevenue)} />
        <Stat label="Thưởng giới thiệu đã ghi" value={usd(t.referralPaid)} />
        <Stat label="Doanh thu ròng DubaiWay" value={usd(t.netRevenue)} highlight />
        <Stat label="Đơn huỷ / hoàn tiền" value={String(t.cancelledCount)} />
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Kiểm tra sổ sách: doanh thu đối tác + hoa hồng = tổng giao dịch
        ({usd(t.merchantRevenue)} + {usd(t.commission)} = {usd(t.merchantRevenue + t.commission)}).
        Thưởng + ròng = hoa hồng ({usd(t.referralPaid)} + {usd(t.netRevenue)} = {usd(t.referralPaid + t.netRevenue)}).
      </p>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-soft">Cần xử lý</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Đối tác chờ duyệt" value={String(pendingMerchants)} urgent={pendingMerchants > 0} />
        <Stat label="Dịch vụ chờ duyệt" value={String(pendingServices)} urgent={pendingServices > 0} />
        <Stat label="Yêu cầu rút tiền" value={String(withdrawals.filter((w) => w.status === 'requested').length)} />
        <Stat label="Thưởng chờ xem xét" value={String(rewards.filter((r) => r.status === 'fraud_review').length)} />
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-soft">Hoạt động</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Đơn hàng" value={String(t.bookingCount)} />
        <Stat label="Đối tác đã duyệt" value={String(merchants.filter((m) => m.status === 'approved').length)} />
        <Stat label="Dịch vụ đang bán" value={String(services.filter((s) => s.status === 'active').length)} />
        <Stat label="Lượt giới thiệu có thưởng" value={String(rewards.length)} />
      </div>
    </>
  );
}

function Stat({ label, value, highlight, urgent }: {
  label: string; value: string; highlight?: boolean; urgent?: boolean;
}) {
  const cls = urgent
    ? 'border-amber-300 bg-amber-50'
    : highlight
      ? 'border-champagne bg-champagne/[0.05]'
      : 'border-mist bg-ivory-100';
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}
