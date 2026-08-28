import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listAllBookings } from '@/server/services/booking-store';
import { getReviewForBooking } from '@/server/services/review-store';
import { HideReviewForm } from '../OpsForms';

export const metadata: Metadata = { title: 'Đánh giá — Quản trị', robots: { index: false, follow: false } };

export default async function AdminReviewsPage() {
  const user = await getSessionUser();
  const canModerate = hasPermission(user, 'review.moderate');

  // Lấy đánh giá qua danh sách đơn hàng để có ngữ cảnh đầy đủ.
  const reviews = listAllBookings()
    .map((b) => ({ booking: b, review: getReviewForBooking(b.reference) }))
    .filter((x): x is { booking: typeof x.booking; review: NonNullable<typeof x.review> } => x.review !== null);

  const visible = reviews.filter((x) => !x.review.isHidden);
  const hidden = reviews.filter((x) => x.review.isHidden);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Kiểm duyệt đánh giá</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {visible.length} đang hiển thị · {hidden.length} đã ẩn
      </p>

      <p className="mt-4 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
        Chỉ ẩn đánh giá vi phạm quy tắc nội dung: xúc phạm, lộ thông tin cá nhân, hoặc không liên quan
        tới dịch vụ. <strong className="text-ink-muted">Không ẩn đánh giá chỉ vì điểm thấp.</strong>{' '}
        Mọi lần ẩn đều bắt buộc nêu lý do và được ghi vào nhật ký hệ thống.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Đang hiển thị</h2>
        <div className="mt-3 space-y-4">
          {visible.length === 0 ? (
            <EmptyState title="Chưa có đánh giá nào" />
          ) : (
            visible.map(({ booking, review }) => (
              <article key={review.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-midnight">
                    {review.authorName}
                    <span className="ml-2 font-normal text-sm text-ink-soft">
                      về {booking.serviceTitle}
                    </span>
                  </p>
                  <p className="text-sm text-champagne-600">
                    {'★'.repeat(review.ratingOverall)}
                    <span className="text-mist-400">{'★'.repeat(5 - review.ratingOverall)}</span>
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Đơn {review.bookingReference} · {new Date(review.createdAt).toLocaleString('vi-VN')}
                </p>
                <p className="mt-3 leading-relaxed text-ink-muted">{review.comment}</p>
                {review.merchantResponse ? (
                  <p className="mt-3 rounded-xl bg-ivory-200 p-3 text-sm text-ink-muted">
                    <strong className="text-midnight">Đối tác phản hồi:</strong> {review.merchantResponse}
                  </p>
                ) : null}
                {canModerate ? <HideReviewForm reviewId={review.id} /> : null}
              </article>
            ))
          )}
        </div>
      </section>

      {hidden.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-medium text-midnight">Đã ẩn</h2>
          <ul className="mt-3 space-y-2">
            {hidden.map(({ review }) => (
              <li key={review.id} className="rounded-2xl border border-mist bg-ivory-200 p-4 text-sm">
                <p className="text-ink-muted line-through">{review.comment}</p>
                <p className="mt-1 text-xs text-red-700">Lý do ẩn: {review.hiddenReason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
