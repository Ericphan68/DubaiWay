import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { listAllRewards } from '@/server/services/referral-store';

export const metadata: Metadata = { title: 'Giới thiệu — Quản trị', robots: { index: false, follow: false } };

export default async function AdminReferralPage() {
  const rewards = listAllRewards();
  const total = rewards.reduce((s, r) => s + r.amountMinor, 0);
  const commissionBase = rewards.reduce((s, r) => s + r.commissionMinor, 0);
  const aed = (m: number) => formatMoney(fromMinorUnits(m, 'AED'), 'vi-VN');

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Chương trình giới thiệu</h1>

      <div className="mt-4 rounded-2xl border border-mist bg-ivory-200 p-4 text-sm text-ink-muted">
        <p>
          Chương trình <strong className="text-midnight">một tầng</strong>: mỗi người có tối đa một
          người giới thiệu trực tiếp. A giới thiệu B, B giới thiệu C — A không nhận gì từ giao dịch của C.
        </p>
        <p className="mt-1">
          Thưởng = hoa hồng nền tảng × tỷ lệ chia. Không tính trên giá trị đơn hàng.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Số lượt thưởng" value={String(rewards.length)} />
        <Stat label="Hoa hồng liên quan" value={aed(commissionBase)} />
        <Stat label="Tổng thưởng đã ghi" value={aed(total)} />
      </div>

      <h2 className="mt-8 font-display text-lg font-medium text-midnight">Danh sách thưởng</h2>
      <div className="mt-3">
        {rewards.length === 0 ? (
          <EmptyState title="Chưa có khoản thưởng nào" body="Thưởng phát sinh khi người được giới thiệu đặt dịch vụ." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Đơn hàng</Th><Th>Người giới thiệu</Th><Th>Người được giới thiệu</Th>
                  <Th className="text-right">Hoa hồng</Th><Th className="text-right">Tỷ lệ</Th>
                  <Th className="text-right">Thưởng</Th><Th>Trạng thái</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {rewards.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-mono text-xs">{r.bookingReference}</Td>
                    <Td className="font-mono text-xs">{r.referrerUserId.slice(0, 12)}…</Td>
                    <Td className="font-mono text-xs">{r.referredUserId.slice(0, 12)}…</Td>
                    <Td className="text-right">{aed(r.commissionMinor)}</Td>
                    <Td className="text-right">{r.shareBps / 100}%</Td>
                    <Td className="text-right font-medium text-midnight">{aed(r.amountMinor)}</Td>
                    <Td>{r.status}</Td>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}
function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
