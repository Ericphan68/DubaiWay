import Link from 'next/link';
import Image from 'next/image';
import type { HolyLandJourney } from '@/types';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { IconClock, IconUsers, IconArrowRight } from '@/components/ui/icons';

export function HolyLandCard({ journey }: { journey: HolyLandJourney }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/holy-land/${journey.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={journey.image}
          alt={journey.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge tone="onImage">{journey.mode}</Badge>
        </div>
        <p className="absolute bottom-3 left-4 right-4 text-xs font-semibold uppercase tracking-eyebrow text-champagne-400">
          {journey.theme}
        </p>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-medium leading-snug text-midnight">
          <Link href={`/holy-land/${journey.slug}`} className="hover:text-royal">{journey.title}</Link>
        </h3>
        <p className="mt-1.5 text-xs text-ink-soft">{journey.countries.join(' · ')}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1"><IconClock className="h-3.5 w-3.5" /> {journey.durationDays} ngày</span>
          <span className="inline-flex items-center gap-1"><IconUsers className="h-3.5 w-3.5" /> {journey.leader}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{journey.summary}</p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="block text-xs text-ink-soft">Giá tham khảo từ</span>
            <span className="font-display text-xl font-semibold text-midnight">{formatPrice(journey.price)}</span>
          </div>
          <Link
            href={`/holy-land/${journey.slug}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-midnight text-white transition-colors group-hover:bg-royal"
            aria-label={`Xem ${journey.title}`}
          >
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
