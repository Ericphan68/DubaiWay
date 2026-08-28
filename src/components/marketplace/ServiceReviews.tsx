import { listReviewsForService, ratingSummary } from '@/server/services/review-store';

/**
 * Đánh giá thật của khách trên trang dịch vụ.
 *
 * Chỉ hiện đánh giá gắn với booking đã hoàn thành. Chưa có đánh giá nào thì nói thẳng
 * là chưa có, không bịa lời khen để lấp chỗ trống.
 */
export function ServiceReviews({ serviceSlug }: { serviceSlug: string }) {
  const reviews = listReviewsForService(serviceSlug);
  const summary = ratingSummary(serviceSlug);

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-medium text-midnight">
        Đánh giá của khách
        {summary.count > 0 ? (
          <span className="ml-3 text-base font-normal text-ink-muted">
            {summary.average.toFixed(1)} / 5 · {summary.count} đánh giá
          </span>
        ) : null}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-3 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-muted">
          Dịch vụ này chưa có đánh giá nào. Chúng tôi chỉ đăng đánh giá từ khách đã thực sự
          sử dụng dịch vụ — nên khi có, bạn biết đó là thật.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.slice(0, 10).map((r) => (
            <li key={r.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-midnight">{r.authorName}</p>
                <p className="text-sm text-champagne-600" aria-label={`${r.ratingOverall} trên 5 sao`}>
                  {'★'.repeat(r.ratingOverall)}
                  <span className="text-mist-400">{'★'.repeat(5 - r.ratingOverall)}</span>
                </p>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">
                Đã xác minh qua đơn hàng {r.bookingReference} ·{' '}
                {new Date(r.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">{r.comment}</p>

              {r.merchantResponse ? (
                <div className="mt-4 rounded-xl bg-ivory-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Phản hồi từ đối tác
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{r.merchantResponse}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
