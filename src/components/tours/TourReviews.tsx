import type { TourReview } from '@/types';
import { formatDate } from '@/lib/format';
import { Stars } from '@/components/ui/Stars';

export function TourReviews({ reviews }: { reviews: TourReview[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="font-display text-3xl font-semibold text-midnight">{avg.toFixed(1)}</span>
        <div>
          <Stars count={Math.round(avg)} />
          <p className="text-xs text-ink-soft">{reviews.length} đánh giá từ khách đã đi</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <figure key={review.name + review.date} className="rounded-2xl border border-mist bg-ivory-100 p-5">
            <div className="flex items-center justify-between">
              <Stars count={review.rating} size={14} />
              <span className="text-xs text-ink-soft">{formatDate(review.date)}</span>
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-ink">“{review.quote}”</blockquote>
            <figcaption className="mt-3 text-xs text-ink-muted">
              <span className="font-semibold text-midnight">{review.name}</span> · {review.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
