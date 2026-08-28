import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { listAllWithdrawals } from '@/server/services/referral-store';

export const metadata: Metadata = { title: 'Rút tiền — Quản trị', robots: { index: false, follow: false } };

export default async function AdminWithdrawalsPage() {
  const withdrawals = listAllWithdrawals();
  const pending = withdrawals.filter((w) => w.status === 'requested');

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Yêu cầu rút tiền</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {pending.length} yêu cầu đang chờ · {withdrawals.length} tổng cộng
      </p>

      <div className="mt-6">
        {withdrawals.length === 0 ? (
          <EmptyState title="Chưa có yêu cầu rút tiền" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Ngày</Th><Th>Người yêu cầu</Th><Th>Phương thức</Th>
                  <Th className="text-right">Số tiền</Th><Th>Trạng thái</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <Td>{new Date(w.createdAt).toLocaleString('vi-VN')}</Td>
                    <Td className="font-mono text-xs">{w.userId.slice(0, 16)}…</Td>
                    <Td>{w.method === 'bank_transfer' ? 'Chuyển khoản' : w.method}</Td>
                    <Td className="text-right font-medium text-midnight">
                      {formatMoney(fromMinorUnits(w.amountMinor, w.currency), 'vi-VN')}
                    </Td>
                    <Td>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {w.status}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-6 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
        Duyệt và chi trả thực tế cần nối với hệ thống ngân hàng — sẽ bổ sung ở giai đoạn tài chính.
        Hiện tại trang này để bộ phận tài chính theo dõi hàng chờ.
      </p>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
