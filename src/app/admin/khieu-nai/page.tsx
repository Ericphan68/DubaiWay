import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listDisputes } from '@/server/services/dispute-store';
import { getMerchant } from '@/server/services/merchant-store';
import { DisputeControls } from '../OpsForms';

export const metadata: Metadata = { title: 'Khiếu nại — Quản trị', robots: { index: false, follow: false } };

const NEXT: Record<string, { value: string; label: string }[]> = {
  open: [
    { value: 'under_review', label: 'Bắt đầu xử lý' },
    { value: 'rejected', label: 'Từ chối' },
  ],
  under_review: [
    { value: 'awaiting_customer', label: 'Chờ khách phản hồi' },
    { value: 'awaiting_merchant', label: 'Chờ đối tác phản hồi' },
    { value: 'resolved', label: 'Giải quyết xong' },
    { value: 'rejected', label: 'Từ chối' },
  ],
  awaiting_customer: [
    { value: 'under_review', label: 'Tiếp tục xử lý' },
    { value: 'resolved', label: 'Giải quyết xong' },
    { value: 'rejected', label: 'Từ chối' },
  ],
  awaiting_merchant: [
    { value: 'under_review', label: 'Tiếp tục xử lý' },
    { value: 'resolved', label: 'Giải quyết xong' },
    { value: 'rejected', label: 'Từ chối' },
  ],
  resolved: [],
  rejected: [],
};

const LABEL: Record<string, { text: string; cls: string }> = {
  open:              { text: 'Mới mở',               cls: 'bg-amber-50 text-amber-800' },
  under_review:      { text: 'Đang xử lý',           cls: 'bg-amber-50 text-amber-800' },
  awaiting_customer: { text: 'Chờ khách',            cls: 'bg-royal/[0.08] text-royal' },
  awaiting_merchant: { text: 'Chờ đối tác',          cls: 'bg-royal/[0.08] text-royal' },
  resolved:          { text: 'Đã giải quyết',        cls: 'bg-emerald-50 text-emerald-700' },
  rejected:          { text: 'Không chấp nhận',      cls: 'bg-mist-200 text-ink-soft' },
};

export default async function AdminDisputesPage() {
  const user = await getSessionUser();
  const canManage = hasPermission(user, 'dispute.manage');
  const disputes = listDisputes();
  const open = disputes.filter((d) => d.status !== 'resolved' && d.status !== 'rejected');

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Khiếu nại</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {open.length} đang mở · {disputes.length} tổng cộng
      </p>

      {!canManage ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được nhưng không có quyền <code>dispute.manage</code> để xử lý.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {disputes.length === 0 ? (
          <EmptyState title="Chưa có khiếu nại nào" body="Đây là dấu hiệu tốt." />
        ) : (
          disputes.map((d) => {
            const st = LABEL[d.status] ?? LABEL.open;
            const merchant = getMerchant(d.merchantId);
            return (
              <article key={d.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-midnight">{d.subject}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {d.reference} · đơn {d.bookingReference} · đối tác {merchant?.displayName ?? '—'} ·{' '}
                      {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{d.description}</p>

                {d.messages.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-mist pt-3">
                    {d.messages.map((m) => (
                      <li key={m.id} className="text-sm">
                        <span className="font-medium text-midnight">
                          {m.senderRole === 'customer' ? 'Khách' : m.senderRole === 'merchant' ? 'Đối tác' : 'DubaiWay'}
                        </span>
                        <span className="ml-2 text-xs text-ink-soft">
                          {new Date(m.createdAt).toLocaleString('vi-VN')}
                        </span>
                        <p className="mt-0.5 text-ink-muted">{m.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {d.resolution ? (
                  <p className="mt-4 rounded-xl bg-ivory-200 px-4 py-3 text-sm text-ink-muted">
                    <strong className="text-midnight">Kết luận:</strong> {d.resolution}
                  </p>
                ) : null}

                {canManage && NEXT[d.status]?.length ? (
                  <DisputeControls disputeId={d.id} options={NEXT[d.status]} />
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
