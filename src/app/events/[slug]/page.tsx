import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  eventTypes,
  eventCountries,
  eventServices,
  eventProcess,
  getEventCountry,
  getEventType,
} from '@/data/events';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { EventForm } from '@/components/events/EventForm';
import { IconCheck, IconArrowUpRight } from '@/components/ui/icons';

export function generateStaticParams() {
  return [...eventCountries, ...eventTypes].map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getEventCountry(slug);
  if (country) return { title: country.name, description: country.intro };
  const type = getEventType(slug);
  if (type) return { title: `${type.title} — DubaiWay Events`, description: type.summary };
  return { title: 'Không tìm thấy' };
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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getEventCountry(slug);
  const type = !country ? getEventType(slug) : undefined;
  if (!country && !type) notFound();

  const title = country ? country.name : type!.title;
  const intro = country ? country.intro : type!.summary;
  const image = country ? country.image : type!.image;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-midnight text-white">
        <div className="absolute inset-0 -z-10">
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/75 to-midnight/40" />
        </div>
        <div className="shell py-10 sm:py-14">
          <div className="[&_a:hover]:text-champagne-400 [&_span]:text-white/50 [&_[aria-current]]:text-white">
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Events', href: '/events' }, { label: title }]} />
          </div>
          <span className="eyebrow mt-5 text-champagne-400"><span className="route-dot" /> DubaiWay Events</span>
          <h1 className="mt-3 max-w-3xl text-display-md font-medium text-balance">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/75">{intro}</p>
          {country && <p className="mt-4 text-sm text-champagne-400">{country.cities.join(' · ')}</p>}
        </div>
      </section>

      <div className="shell space-y-14 py-12 lg:py-16">
        {country ? (
          <>
            <Block title="Loại địa điểm hỗ trợ">
              <div className="flex flex-wrap gap-2.5">
                {country.venueTypes.map((v) => (
                  <span key={v} className="rounded-full border border-mist-400 bg-ivory-100 px-4 py-2 text-sm text-ink-muted">{v}</span>
                ))}
              </div>
            </Block>

            <Block title="Dịch vụ tại điểm đến">
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {eventServices.slice(0, 12).map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-ink-muted">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" /> {s}
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Dự án tiêu biểu">
              <div className="grid gap-6 sm:grid-cols-2">
                {country.caseStudies.map((cs) => (
                  <article key={cs.title} className="rounded-2xl border border-mist bg-ivory-100 p-6">
                    <span className="text-xs font-semibold uppercase tracking-wide text-champagne-600">{cs.scale}</span>
                    <h3 className="mt-2 font-display text-lg font-medium text-midnight">{cs.title}</h3>
                    <p className="mt-1.5 text-sm text-ink-muted">{cs.detail}</p>
                  </article>
                ))}
              </div>
            </Block>
          </>
        ) : (
          <>
            <Block title="DubaiWay hỗ trợ những gì">
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {eventServices.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-ink-muted">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" /> {s}
                  </li>
                ))}
              </ul>
            </Block>
            <Block title="Phạm vi tổ chức">
              <div className="grid gap-4 sm:grid-cols-3">
                {eventCountries.map((c) => (
                  <a key={c.slug} href={`/events/${c.slug}`} className="group flex items-center justify-between rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-royal/30">
                    <span className="font-display text-lg font-medium text-midnight">{c.name}</span>
                    <IconArrowUpRight className="h-5 w-5 text-champagne-600" />
                  </a>
                ))}
              </div>
            </Block>
          </>
        )}

        {/* Quy trình */}
        <Block title="Quy trình thực hiện">
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {eventProcess.map((item, i) => (
              <li key={item.step} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <span className="font-display text-2xl font-semibold text-champagne-600">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-medium text-midnight">{item.step}</h3>
                <p className="mt-1 text-sm text-ink-muted">{item.desc}</p>
              </li>
            ))}
          </ol>
        </Block>
      </div>

      {/* Form báo giá */}
      <section className="bg-mist-200/50 py-14">
        <div className="shell">
          <div className="max-w-2xl">
            <h2 className="text-display-md font-medium text-midnight">Yêu cầu báo giá {title}</h2>
            <p className="mt-2 text-ink-muted">Chia sẻ nhu cầu, DubaiWay Events sẽ gửi đề xuất và báo giá chi tiết.</p>
          </div>
          <div className="mt-8">
            <EventForm defaultCountry={country ? country.cities[0] : undefined} />
          </div>
          <div className="mt-6">
            <Button href={`/yeu-cau-bao-gia?type=event`} variant="outline">Hoặc dùng form yêu cầu chung</Button>
          </div>
        </div>
      </section>
    </>
  );
}
