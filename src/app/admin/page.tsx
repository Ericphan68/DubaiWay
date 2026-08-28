import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { platformTotals } from '@/server/services/booking-store';
import { listAllRewards, listAllWithdrawals } from '@/server/services/referral-store';
import { listMerchants, listServices } from '@/server/services/merchant-store';
import { ConsolePageHeader } from '@/components/layout/ConsoleShell';
import { ActionQueue, ConsoleStat, MoneyFlow, StatRow } from '@/components/console';

export const metadata: Metadata = { title: 'Quản trị', robots: { index: false, follow: false } };

export default async function AdminDashboard() {
  const t = platformTotals();
  const merchants = listMerchants();
  const services = listServices();
  const rewards = listAllRewards();
  const withdrawals = listAllWithdrawals();

  const usd = (minor: number) => formatMoney(fromMinorUnits(minor, 'USD'), 'vi-VN');
  const pending = (status: string) => status === 'submitted' || status === 'under_review';

  const pendingMerchants = merchants.filter((m) => pending(m.status)).length;
  const pendingServices = services.filter((s) => pending(s.status)).length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'requested').length;
  const pendingRewards = rewards.filter((r) => r.status === 'fraud_review').length;

  // Sổ sách phải khớp tuyệt đối vì tất cả đều là số nguyên đơn vị nhỏ nhất.
  // Lệch một xu cũng là lỗi, không phải sai số làm tròn.
  const balanced =
    t.merchantRevenue + t.commission === t.gmv
    && t.referralPaid + t.netRevenue === t.commission;

  return (
    <>
      <ConsolePageHeader
        title="Tổng quan nền tảng"
        description="Việc đang chờ, dòng tiền và tình hình hoạt động của sàn."
      />

      <ActionQueue
        emptyLabel="Không có việc nào đang chờ duyệt."
        items={[
          { count: pendingMerchants, label: 'hồ sơ đối tác chờ bạn duyệt', href: '/admin/merchant' },
          { count: pendingServices, label: 'dịch vụ chờ bạn duyệt', href: '/admin/dich-vu' },
          { count: pendingWithdrawals, label: 'yêu cầu rút tiền chờ xử lý', href: '/admin/rut-tien' },
          { count: pendingRewards, label: 'khoản thưởng cần xem xét gian lận', href: '/admin/gioi-thieu' },
        ]}
      />

      <h2 className="mb-3 mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Tiền chảy đi đâu
      </h2>
      <MoneyFlow
        gmv={usd(t.gmv)}
        merchantRevenue={usd(t.merchantRevenue)}
        commission={usd(t.commission)}
        referralPaid={usd(t.referralPaid)}
        netRevenue={usd(t.netRevenue)}
        balanced={balanced}
      />

      <h2 className="mb-3 mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Hoạt động
      </h2>
      <StatRow>
        <ConsoleStat label="Đơn hàng" value={t.bookingCount} />
        <ConsoleStat
          label="Đối tác đang bán"
          value={merchants.filter((m) => m.status === 'approved').length}
          hint={`${merchants.length} hồ sơ tất cả`}
        />
        <ConsoleStat
          label="Dịch vụ đang bán"
          value={services.filter((s) => s.status === 'active').length}
          hint={`${services.length} dịch vụ tất cả`}
        />
        <ConsoleStat
          label="Đơn huỷ / hoàn tiền"
          value={t.cancelledCount}
          hint={rewards.length > 0 ? `${rewards.length} lượt giới thiệu có thưởng` : undefined}
        />
      </StatRow>
    </>
  );
}
