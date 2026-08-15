import { reviews } from '@/data/reviews';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stars } from '@/components/ui/Stars';
import { IconQuote } from '@/components/ui/icons';

export function Testimonials() {
  return (
    <Section background="mist">
      <SectionHeader
        eyebrow="Khách hàng nói gì"
        title="Những hành trình đã thành kỷ niệm"
        description="Từ gia đình, đoàn hội thánh đến doanh nghiệp — đây là lý do khách quay lại với DubaiWay."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <figure
            key={review.name}
            className="flex h-full flex-col rounded-2xl bg-ivory-100 p-6 shadow-card ring-1 ring-mist"
          >
            <IconQuote className="h-8 w-8 text-champagne" />
            <blockquote className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-ink">
              “{review.quote}”
            </blockquote>
            <Stars count={review.rating} className="mt-4" />
            <figcaption className="mt-3 border-t border-mist pt-3">
              <p className="text-sm font-semibold text-midnight">{review.name}</p>
              <p className="text-xs text-ink-soft">
                {review.role} · {review.location}
              </p>
              <p className="mt-1 text-xs text-champagne-600">{review.product}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
