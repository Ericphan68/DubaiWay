import Link from 'next/link';
import Image from 'next/image';
import { eventTypes, eventCountries } from '@/data/events';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { IconArrowUpRight } from '@/components/ui/icons';

export function EventsSection() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="DubaiWay Events"
        title="Sự kiện quốc tế, lo trọn từ ý tưởng đến sân khấu"
        description="Corporate, MICE, gala, church conference, destination wedding và concert — tại Dubai, Việt Nam, Thái Lan và nhiều nơi khác."
        link={{ label: 'Vào DubaiWay Events', href: '/events' }}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Lưới loại sự kiện */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {eventTypes.slice(0, 6).map((ev) => (
            <Link
              key={ev.slug}
              href={`/events/${ev.slug}`}
              className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl p-4 text-white shadow-card"
            >
              <Image
                src={ev.image}
                alt={ev.title}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
              <p className="relative font-display text-base font-medium leading-tight">{ev.title}</p>
            </Link>
          ))}
        </div>

        {/* Events theo quốc gia */}
        <div className="flex flex-col gap-4">
          {eventCountries.map((country) => (
            <Link
              key={country.slug}
              href={`/events/${country.slug}`}
              className="group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl p-5 text-white shadow-card"
            >
              <Image
                src={country.image}
                alt={country.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 to-midnight/40" />
              <div className="relative">
                <p className="font-display text-lg font-medium">{country.name}</p>
                <p className="text-xs text-white/70">{country.cities.join(' · ')}</p>
              </div>
              <IconArrowUpRight className="relative ml-auto h-5 w-5 text-champagne-400" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button href="/yeu-cau-bao-gia?type=event" variant="primary">
          Yêu cầu báo giá tổ chức sự kiện
        </Button>
      </div>
    </Section>
  );
}
