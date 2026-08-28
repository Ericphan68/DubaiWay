import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listReviewsForMerchant } from '@/server/services/review-store';
import { RespondForm } from './RespondForm';

export const metadata: Metadata = { title: 'Đánh giá — Đối tác', robots: { index: false, follow: false } };

export default async function MerchantReviewsPage() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  const reviews = merchant ? listReviewsForMerchant(merchant.id) : [];
  const visible = reviews.filter((r) => !r.isHidden);
  const avg = visible.length > 0
    ? Math.round((visible.reduce((s, r) => s + r.ratingOverall, 0) / visible.length) * 10) / 10
    : 0;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Đánh giá của khách</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {visible.length > 0
          ? `${avg.toFixed(1)} / 5 · ${visible.length} đánh giá`
          : 'Chưa có đánh giá nào'}
      </p>

      <p className="mt-4 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
        Bạn được phản hồi công khai mọi đánh giá, nhưng không sửa hay xoá được đánh giá của khách.
        Nếu một đánh giá vi phạm quy tắc nội dung, báo cho DubaiWay để xem xét.
      </p>

      <div className="mt-6 space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            title="Chưa có đánh giá nào"
            body="Khách chỉ đánh giá được sau khi đã sử dụng dịch vụ và đơn hàng chuyển sang hoàn thành."
          />
        ) : (
          visible.map((r) => (
            <article key={r.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-midnight">{r.authorName}</p>
                <p className="text-sm text-champagne-600">
                  {'★'.repeat(r.ratingOverall)}
                  <span className="text-mist-400">{'★'.repeat(5 - r.ratingOverall)}</span>
                </p>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">
                Đơn {r.bookingReference} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">{r.comment}</p>

              {r.merchantResponse ? (
                <div className="mt-4 rounded-xl bg-ivory-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Phản hồi của bạn
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{r.merchantResponse}</p>
                </div>
              ) : (
                <RespondForm reviewId={r.id} />
              )}
            </article>
          ))
        )}
      </div>
    </>
  );
}
