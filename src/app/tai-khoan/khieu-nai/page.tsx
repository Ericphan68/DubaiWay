import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';
import { listDisputes } from '@/server/services/dispute-store';
import { DisputeReplyForm, OpenDisputeForm } from '../AccountForms';

export const metadata: Metadata = { title: 'Khiếu nại', robots: { index: false, follow: false } };

const STATUS: Record<string, { text: string; cls: string }> = {
  open:              { text: 'Mới mở',              cls: 'bg-amber-50 text-amber-800' },
  under_review:      { text: 'Đang xử lý',          cls: 'bg-amber-50 text-amber-800' },
  awaiting_customer: { text: 'Chờ bạn phản hồi',    cls: 'bg-royal/[0.08] text-royal' },
  awaiting_merchant: { text: 'Chờ đối tác phản hồi',cls: 'bg-royal/[0.08] text-royal' },
  resolved:          { text: 'Đã giải quyết',       cls: 'bg-emerald-50 text-emerald-700' },
  rejected:          { text: 'Không chấp nhận',     cls: 'bg-mist-200 text-ink-soft' },
};

export default async function DisputesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const disputes = listDisputes({ userId: user.id });
  // Chỉ đơn đã thanh toán trở lên mới khiếu nại được.
  const eligible = listBookingsForUser(user.id)
    .filter((b) => ['paid', 'confirmed', 'completed'].includes(b.status))
    .map((b) => ({ reference: b.reference, title: b.serviceTitle }));

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Khiếu nại</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Dịch vụ không đúng như mô tả? Mở khiếu nại trong thời hạn ghi trên trang dịch vụ —
        trong thời gian đó tiền của đối tác chưa được giải ngân.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Khiếu nại của bạn</h2>
        <div className="mt-3 space-y-4">
          {disputes.length === 0 ? (
            <EmptyState title="Bạn chưa có khiếu nại nào" body="Mong là bạn sẽ không cần tới mục này." />
          ) : (
            disputes.map((d) => {
              const st = STATUS[d.status] ?? STATUS.open;
              return (
                <article key={d.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-midnight">{d.subject}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {d.reference} · đơn {d.bookingReference} ·{' '}
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
                            {m.senderRole === 'customer' ? 'Bạn' : m.senderRole === 'merchant' ? 'Đối tác' : 'DubaiWay'}
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

                  {d.status !== 'resolved' && d.status !== 'rejected' ? (
                    <DisputeReplyForm disputeId={d.id} />
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      {eligible.length > 0 ? (
        <section className="mt-10">
          <OpenDisputeForm references={eligible} />
        </section>
      ) : (
        <p className="mt-8 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
          Bạn chưa có đơn hàng nào đủ điều kiện khiếu nại. Chỉ đơn đã thanh toán mới mở khiếu nại được.
        </p>
      )}
    </>
  );
}
