import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tours, getTourBySlug, relatedTours, segmentLabels, formatLabels } from '@/data/tours';
import { getTourDetail } from '@/data/tour-details';
import { formatDate } from '@/lib/format';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { Accordion } from '@/components/ui/Accordion';
import { TourCard } from '@/components/cards/TourCard';
import { Gallery } from '@/components/tours/Gallery';
import { BookingBox } from '@/components/tours/BookingBox';
import { TourItinerary } from '@/components/tours/TourItinerary';
import { TourReviews } from '@/components/tours/TourReviews';
import {
  IconClock,
  IconMapPin,
  IconCalendar,
  IconCheck,
  IconClose,
  IconBed,
  IconCar,
  IconPassport,
  IconUsers,
} from '@/components/ui/icons';

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTourBySlug(slug);
  if (!tour) return { title: 'Không tìm thấy tour' };
  return {
    title: tour.title,
    description: tour.summary,
    openGraph: { title: tour.title, description: tour.summary, images: [tour.image] },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-medium text-midnight">{title}</h2>
      <div className="route-line mt-3 w-16" />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = getTourBySlug(slug);
  if (!tour) notFound();

  const detail = getTourDetail(tour);
  const related = relatedTours(tour);

  const facts = [
    { icon: IconClock, label: 'Thời lượng', value: tour.durationDays > 1 ? `${tour.durationDays} ngày ${tour.durationNights} đêm` : 'Trong ngày' },
    { icon: IconMapPin, label: 'Điểm đến', value: tour.destination },
    { icon: IconUsers, label: 'Loại tour', value: formatLabels[tour.format] },
    { icon: IconCalendar, label: 'Khởi hành', value: tour.departureFrom.join(', ') },
  ];

  return (
    <>
      <div className="bg-ivory-100">
        <div className="shell pt-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Du lịch', href: '/du-lich' },
              { label: tour.title },
            ]}
          />
        </div>

        {/* Tiêu đề + meta */}
        <div className="shell pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{segmentLabels[tour.segment]}</Badge>
            <Badge tone="navy">{formatLabels[tour.format]}</Badge>
            <ActionBadge action={tour.action} />
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-medium text-midnight sm:text-display-md">
            {tour.title}
          </h1>
          <p className="mt-2 max-w-3xl text-ink-muted">{tour.summary}</p>
        </div>

        {/* Gallery */}
        <div className="shell mt-6">
          <Gallery images={detail.gallery} title={tour.title} />
        </div>
      </div>

      {/* Nội dung + booking */}
      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_22rem] lg:py-14">
        <div className="min-w-0 space-y-12">
          {/* Facts */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-mist bg-ivory-100 p-5 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                <div>
                  <p className="text-xs text-ink-soft">{f.label}</p>
                  <p className="text-sm font-medium text-midnight">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Section id="highlights" title="Điểm nổi bật">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 rounded-xl bg-mist-200/60 px-4 py-3 text-sm text-ink">
                  <span className="route-dot shrink-0" /> {h}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="itinerary" title="Lịch trình từng ngày">
            <TourItinerary days={detail.itinerary} />
          </Section>

          <Section id="services" title="Khách sạn, ăn uống & di chuyển">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: IconBed, label: 'Khách sạn', value: detail.hotels },
                { icon: IconUsers, label: 'Ăn uống', value: detail.meals },
                { icon: IconCar, label: 'Phương tiện', value: detail.transport },
                { icon: IconPassport, label: 'Visa', value: detail.visa },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-midnight">
                    <item.icon className="h-4 w-4 text-champagne-600" /> {item.label}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="includes" title="Bao gồm & không bao gồm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-emerald-700">Giá bao gồm</p>
                <ul className="space-y-2">
                  {detail.includes.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Không bao gồm</p>
                <ul className="space-y-2">
                  {detail.excludes.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <IconClose className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="policy" title="Chính sách trẻ em & hủy tour">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <p className="text-sm font-semibold text-midnight">Chính sách trẻ em</p>
                <p className="mt-2 text-sm text-ink-muted">{detail.childPolicy}</p>
              </div>
              <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <p className="text-sm font-semibold text-midnight">Chính sách hủy</p>
                <p className="mt-2 text-sm text-ink-muted">{detail.cancellationPolicy}</p>
              </div>
            </div>
          </Section>

          <Section id="faq" title="Câu hỏi thường gặp">
            <Accordion items={detail.faqs} />
          </Section>

          <Section id="reviews" title="Đánh giá từ khách">
            <TourReviews reviews={detail.reviews} />
          </Section>
        </div>

        {/* Booking box dính */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <BookingBox tour={tour} />
          <p className="mt-3 px-1 text-xs text-ink-soft">
            Lịch khởi hành gần nhất:{' '}
            {tour.nextDepartures
              .map((d) => (/\d{4}-\d{2}-\d{2}/.test(d) ? formatDate(d) : d))
              .join(' · ')}
          </p>
        </div>
      </div>

      {/* Tour liên quan */}
      {related.length > 0 && (
        <section className="bg-ivory-100 py-14">
          <div className="shell">
            <h2 className="font-display text-2xl font-medium text-midnight">Tour liên quan</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard key={t.slug} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
