import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { eventTypes, eventServices, eventCountries, eventProcess } from '@/data/events';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { EventForm } from '@/components/events/EventForm';
import { IconArrowUpRight } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'DubaiWay Events — Tổ chức sự kiện quốc tế',
  description:
    'Corporate, MICE, gala, church conference, destination wedding và concert tại Dubai, Việt Nam, Thái Lan và nhiều nơi. Lo trọn từ ý tưởng đến sân khấu.',
};

const scope = ['Dubai & UAE', 'Việt Nam', 'Thái Lan', 'Singapore', 'Malaysia', 'Trung Đông', 'Châu Âu'];

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="DubaiWay Events"
        title="Sự kiện quốc tế, lo trọn từ ý tưởng đến sân khấu"
        description="Một business unit chuyên trách: concept, địa điểm, hậu cần, sân khấu và khách mời — trong nước và quốc tế."
        image={img(photo.event, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Events' }]}
      />

      {/* Phạm vi */}
      <section className="border-b border-mist bg-ivory-100">
        <div className="shell flex flex-wrap items-center gap-x-6 gap-y-2 py-5 text-sm">
          <span className="font-semibold text-midnight">Phạm vi hoạt động:</span>
          {scope.map((s) => (
            <span key={s} className="text-ink-muted">{s}</span>
          ))}
        </div>
      </section>

      {/* Loại sự kiện */}
      <section className="shell py-14">
        <div className="max-w-2xl">
          <span className="eyebrow text-champagne-600"><span className="route-dot" /> Loại hình sự kiện</span>
          <h2 className="mt-3 text-display-md font-medium text-midnight">DubaiWay tổ chức những gì</h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventTypes.map((ev) => (
            <Link
              key={ev.slug}
              href={`/events/${ev.slug}`}
              className="group relative flex min-h-[14rem] flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card"
            >
              <Image
                src={ev.image}
                alt={ev.title}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/45 to-transparent" />
              <div className="relative">
                <p className="font-display text-lg font-medium">{ev.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/75">{ev.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dịch vụ trọn gói */}
      <section className="bg-mist-200/50 py-14">
        <div className="shell">
          <div className="max-w-2xl">
            <span className="eyebrow text-champagne-600"><span className="route-dot" /> Dịch vụ trọn gói</span>
            <h2 className="mt-3 text-display-md font-medium text-midnight">Mọi mảnh ghép của một sự kiện</h2>
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {eventServices.map((s) => (
              <span key={s} className="rounded-full border border-mist-400 bg-ivory-100 px-4 py-2 text-sm text-ink-muted">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Events theo quốc gia */}
      <section className="shell py-14">
        <div className="max-w-2xl">
          <span className="eyebrow text-champagne-600"><span className="route-dot" /> Theo điểm đến</span>
          <h2 className="mt-3 text-display-md font-medium text-midnight">Events theo quốc gia</h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {eventCountries.map((c) => (
            <Link
              key={c.slug}
              href={`/events/${c.slug}`}
              className="group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-card"
            >
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
              <div className="relative">
                <p className="font-display text-xl font-medium">{c.name}</p>
                <p className="mt-1 text-sm text-white/75">{c.cities.join(' · ')}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-champagne-400">
                  Xem chi tiết <IconArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quy trình */}
      <section className="bg-midnight py-14">
        <div className="shell">
          <div className="max-w-2xl text-white">
            <span className="eyebrow text-champagne-400"><span className="route-dot" /> Quy trình</span>
            <h2 className="mt-3 text-display-md font-medium">Từ ý tưởng đến sự kiện hoàn hảo</h2>
          </div>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {eventProcess.map((item, i) => (
              <li key={item.step} className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
                <span className="font-display text-3xl font-semibold text-champagne-400">{String(i + 1).padStart(2, '0')}</span>
                <div className="route-line mt-3 w-10" />
                <h3 className="mt-3 font-display text-lg font-medium text-white">{item.step}</h3>
                <p className="mt-1.5 text-sm text-white/65">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form */}
      <section className="shell py-14">
        <div className="max-w-2xl">
          <span className="eyebrow text-champagne-600"><span className="route-dot" /> Bắt đầu</span>
          <h2 className="mt-3 text-display-md font-medium text-midnight">Nhận tư vấn & báo giá sự kiện</h2>
          <p className="mt-2 text-ink-muted">Điền thông tin, đội ngũ DubaiWay Events sẽ liên hệ với đề xuất phù hợp.</p>
        </div>
        <div className="mt-8">
          <EventForm />
        </div>
      </section>
    </>
  );
}
