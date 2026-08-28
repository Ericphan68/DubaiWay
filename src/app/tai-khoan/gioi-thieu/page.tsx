import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import {
  countReferred, getOrCreateReferralCode, listRewards, listWithdrawals, walletSummary,
} from '@/server/services/referral-store';
import { siteConfig } from '@/config/site';
import { CopyLink, WithdrawForm } from './ReferralTools';

export const metadata: Metadata = {
  title: 'Chương trình giới thiệu',
  robots: { index: false, follow: false },
};

const REWARD_LABEL: Record<string, { text: string; cls: string }> = {
  pending:              { text: 'Đang chờ',        cls: 'bg-amber-50 text-amber-800' },
  held:                 { text: 'Chờ hết hạn khiếu nại', cls: 'bg-amber-50 text-amber-800' },
  available:            { text: 'Rút được',        cls: 'bg-emerald-50 text-emerald-700' },
  withdrawal_requested: { text: 'Đang xử lý rút',  cls: 'bg-royal/[0.08] text-royal' },
  paid:                 { text: 'Đã trả',          cls: 'bg-mist-200 text-ink-soft' },
  cancelled:            { text: 'Đã huỷ',          cls: 'bg-mist-200 text-ink-soft' },
  reversed:             { text: 'Đã thu hồi',      cls: 'bg-red-50 text-red-700' },
  fraud_review:         { text: 'Đang xem xét',    cls: 'bg-red-50 text-red-700' },
};

export default async function ReferralPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const code = getOrCreateReferralCode(user.id);
  const link = `${siteConfig.url}/dang-ky?ref=${code}`;
  const wallet = walletSummary(user.id);
  const rewards = listRewards(user.id);
  const withdrawals = listWithdrawals(user.id);
  const referredCount = countReferred(user.id);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Chương trình giới thiệu</h1>

      {/* Giải thích cách tính — nói thẳng 30% là của HOA HỒNG */}
      <div className="mt-4 rounded-2xl border border-mist bg-ivory-200 p-5">
        <p className="text-sm leading-relaxed text-ink-muted">
          Bạn nhận <strong className="text-midnight">30% hoa hồng mà DubaiWay thực nhận</strong> từ
          mỗi giao dịch hợp lệ của người bạn giới thiệu.
        </p>
        <div className="mt-3 rounded-xl bg-ivory-100 p-4 font-mono text-sm">
          <p className="text-ink-muted">Ví dụ đơn hàng 1.000 AED:</p>
          <p className="mt-2 text-midnight">Đối tác nhận<span className="float-right">900,00 AED</span></p>
          <p className="text-midnight">Hoa hồng DubaiWay<span className="float-right">100,00 AED</span></p>
          <p className="mt-1 border-t border-mist pt-1 font-semibold text-champagne-600">
            Bạn nhận<span className="float-right">30,00 AED</span>
          </p>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          30% tính trên hoa hồng, không phải trên giá trị đơn hàng. Chương trình
          <strong className="text-ink-muted"> chỉ có một tầng</strong>: bạn nhận thưởng từ người bạn
          giới thiệu trực tiếp, không nhận từ người mà họ giới thiệu tiếp.{' '}
          <Link href="/dieu-khoan" className="underline underline-offset-2">Xem điều khoản đầy đủ</Link>.
        </p>
      </div>

      {/* Mã và link */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Mã giới thiệu của bạn</h2>
        <p className="mt-2 inline-block rounded-xl bg-champagne/[0.1] px-4 py-2 font-mono text-lg font-semibold tracking-wider text-champagne-600">
          {code}
        </p>
        <div className="mt-3"><CopyLink url={link} /></div>
        <p className="mt-2 text-sm text-ink-soft">
          Đã giới thiệu <strong className="text-midnight">{referredCount}</strong> người.
        </p>
      </section>

      {/* Ví */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Ví thưởng</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Rút được" value={formatMoney(wallet.available, 'vi-VN')} highlight />
          <Stat label="Đang chờ" value={formatMoney(wallet.pending, 'vi-VN')} />
          <Stat label="Đã rút" value={formatMoney(wallet.withdrawn, 'vi-VN')} />
          <Stat label="Tổng tích luỹ" value={formatMoney(wallet.lifetime, 'vi-VN')} />
        </div>

        {wallet.available.amount > 0 ? (
          <WithdrawForm availableMajor={wallet.available.amount / 100} />
        ) : (
          <p className="mt-3 text-sm text-ink-soft">
            Thưởng chuyển sang “rút được” sau khi người bạn giới thiệu đã dùng dịch vụ và hết thời hạn
            khiếu nại. Số tiền rút tối thiểu là 100 AED.
          </p>
        )}
      </section>

      {/* Lịch sử thưởng */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Lịch sử thưởng</h2>
        <div className="mt-3">
          {rewards.length === 0 ? (
            <EmptyState
              title="Chưa có thưởng nào"
              body="Chia sẻ link giới thiệu của bạn. Khi người được giới thiệu hoàn tất giao dịch, thưởng sẽ hiện ở đây."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-mist">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-ivory-200 text-left">
                  <tr>
                    <Th>Đơn hàng</Th><Th>Hoa hồng nền tảng</Th>
                    <Th>Bạn nhận</Th><Th>Trạng thái</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist bg-ivory-100">
                  {rewards.map((r) => {
                    const s = REWARD_LABEL[r.status] ?? REWARD_LABEL.pending;
                    return (
                      <tr key={r.id}>
                        <Td className="font-mono">{r.bookingReference}</Td>
                        <Td>{(r.commissionMinor / 100).toLocaleString('vi-VN')} AED</Td>
                        <Td className="font-medium text-midnight">
                          {(r.amountMinor / 100).toLocaleString('vi-VN')} AED
                          <span className="ml-1 text-xs text-ink-soft">({r.shareBps / 100}%)</span>
                        </Td>
                        <Td>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                            {s.text}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {withdrawals.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium text-midnight">Yêu cầu rút tiền</h2>
          <ul className="mt-3 space-y-2">
            {withdrawals.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-xl border border-mist bg-ivory-100 px-4 py-3 text-sm">
                <span className="text-ink-muted">
                  {new Date(w.createdAt).toLocaleDateString('vi-VN')} · {w.method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : w.method}
                </span>
                <span className="font-medium text-midnight">
                  {(w.amountMinor / 100).toLocaleString('vi-VN')} AED
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {w.status === 'requested' ? 'Đang chờ duyệt' : w.status}
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-champagne bg-champagne/[0.05]' : 'border-mist bg-ivory-100'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
