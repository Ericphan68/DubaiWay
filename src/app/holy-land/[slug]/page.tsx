import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { holyLandJourneys } from '@/data/holyland';
import { getHolyLandBySlug, getHolyLandDetail, relatedJourneys } from '@/data/holyland-details';
import { formatPrice, formatDate } from '@/lib/format';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Gallery } from '@/components/tours/Gallery';
import { TourItinerary } from '@/components/tours/TourItinerary';
import { RouteMap } from '@/components/holyland/RouteMap';
import { HolyLandCard } from '@/components/holyland/HolyLandCard';
import { IconClock, IconUsers, IconCheck, IconWhatsapp, IconCalendar } from '@/components/ui/icons';

export function generateStaticParams() {
  return holyLandJourneys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const journey = getHolyLandBySlug(slug);
  if (!journey) return { title: 'Không tìm thấy hành trình' };
  return {
    title: journey.title,
    description: journey.summary,
    openGraph: { title: journey.title, description: journey.summary, images: [journey.image] },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-midnight">{title}</h2>
      <div className="route-line mt-3 w-16" />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function HolyLandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = getHolyLandBySlug(slug);
  if (!journey) notFound();

  const detail = getHolyLandDetail(journey);
  const related = relatedJourneys(journey);
  const waMessage = `${whatsappMessages.holyland} (${journey.title})`;

  return (
    <>
      <div className="bg-ivory-100">
        <div className="shell pt-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Holy Land', href: '/holy-land' },
              { label: journey.title },
            ]}
          />
        </div>
        <div className="shell pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{journey.theme}</Badge>
            <Badge tone="navy">{journey.mode}</Badge>
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-medium text-midnight sm:text-display-md">
            {journey.title}
          </h1>
          <p className="mt-2 max-w-3xl text-ink-muted">{journey.summary}</p>
        </div>
        <div className="shell mt-6">
          <Gallery images={detail.gallery} title={journey.title} />
        </div>
      </div>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_22rem] lg:py-14">
        <div className="min-w-0 space-y-12">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-mist bg-ivory-100 p-5 sm:grid-cols-3">
            <Meta label="Thời lượng" value={`${journey.durationDays} ngày`} Icon={IconClock} />
            <Meta label="Quốc gia" value={journey.countries.join(', ')} Icon={IconUsers} />
            <Meta label="Người dẫn đoàn" value={journey.leader} Icon={IconUsers} />
          </div>

          <Block title="Bản đồ tuyến hành trình">
            <RouteMap stops={journey.stops} />
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {journey.stops.map((stop, i) => (
                <li key={stop.place} className="flex gap-3 rounded-xl bg-mist-200/60 p-4">
                  <span className="font-display text-lg font-semibold text-champagne-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-midnight">{stop.place}</p>
                    <p className="text-xs text-ink-muted">{stop.meaning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Bối cảnh & ý nghĩa">
            <p className="text-pretty leading-relaxed text-ink-muted">{detail.historicalContext}</p>
          </Block>

          <Block title="Lịch trình từng ngày">
            <TourItinerary days={detail.itinerary} />
          </Block>

          <Block title="Chương trình bao gồm">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {detail.includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Câu hỏi thường gặp">
            <Accordion items={detail.faqs} />
          </Block>
        </div>

        {/* Sidebar đăng ký */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-ivory-100 p-5 shadow-card ring-1 ring-mist">
            <span className="text-xs text-ink-soft">Giá tham khảo từ</span>
            <p className="font-display text-2xl font-semibold text-midnight">{formatPrice(journey.price)}</p>
            <span className="text-xs text-ink-soft">{journey.price.unit}</span>

            <div className="mt-4 rounded-xl bg-mist-200/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-midnight">
                <IconCalendar className="h-3.5 w-3.5 text-royal" /> Lịch khởi hành
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {journey.nextDepartures.map((d) => (/\d{4}-\d{2}-\d{2}/.test(d) ? formatDate(d) : d)).join(' · ')}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              <Button href={`/yeu-cau-bao-gia?type=holyland&journey=${journey.slug}`} variant="primary" className="w-full">
                Đăng ký hành trình
              </Button>
              <Button href={`/yeu-cau-bao-gia?type=holyland-private&journey=${journey.slug}`} variant="outline" className="w-full">
                Tư vấn đoàn riêng
              </Button>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1eb757]"
              >
                <IconWhatsapp className="h-4 w-4" /> Nhắn WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-soft">Giá là tham khảo, xác nhận khi đăng ký. Có trưởng đoàn mục vụ đồng hành.</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-ivory-100 py-14">
          <div className="shell">
            <h2 className="font-display text-2xl font-medium text-midnight">Hành trình khác</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((j) => (
                <HolyLandCard key={j.slug} journey={j} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Meta({ label, value, Icon }: { label: string; value: string; Icon: typeof IconClock }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-sm font-medium text-midnight">{value}</p>
      </div>
    </div>
  );
}
