import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listBookingsForUser } from '@/server/services/booking-store';
import { getReviewForBooking, listReviewsForUser } from '@/server/services/review-store';
import { ReviewForm } from './ReviewForm';

export const metadata: Metadata = { title: 'Đánh giá của tôi', robots: { index: false, follow: false } };

export default async function MyReviewsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const bookings = listBookingsForUser(user.id);
  // Chỉ đơn đã hoàn thành mới được đánh giá — đúng quy tắc ở tầng dữ liệu.
  const awaiting = bookings.filter((b) => b.status === 'completed' && !getReviewForBooking(b.reference));
  const written = listReviewsForUser(user.id);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Đánh giá của tôi</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Bạn chỉ đánh giá được dịch vụ đã sử dụng xong.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Chờ bạn đánh giá</h2>
        <div className="mt-3 space-y-4">
          {awaiting.length === 0 ? (
            <EmptyState
              title="Không có dịch vụ nào chờ đánh giá"
              body="Sau khi bạn sử dụng xong một dịch vụ, chúng tôi sẽ mời bạn chia sẻ trải nghiệm."
            />
          ) : (
            awaiting.map((b) => (
              <ReviewForm key={b.reference} reference={b.reference} serviceTitle={b.serviceTitle} />
            ))
          )}
        </div>
      </section>

      {written.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-medium text-midnight">Đã đánh giá</h2>
          <ul className="mt-3 space-y-3">
            {written.map((r) => (
              <li key={r.id} className="rounded-2xl border border-mist bg-ivory-100 p-4">
                <p className="text-sm font-medium text-midnight">
                  {'★'.repeat(r.ratingOverall)}
                  <span className="text-mist-400">{'★'.repeat(5 - r.ratingOverall)}</span>
                  <span className="ml-2 font-normal text-ink-soft">{r.bookingReference}</span>
                </p>
                <p className="mt-2 text-sm text-ink-muted">{r.comment}</p>
                {r.merchantResponse ? (
                  <div className="mt-3 rounded-xl bg-ivory-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Phản hồi từ đối tác
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{r.merchantResponse}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
