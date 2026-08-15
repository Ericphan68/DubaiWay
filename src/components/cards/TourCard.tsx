import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/types';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { IconClock, IconMapPin, IconArrowRight } from '@/components/ui/icons';

const segmentLabel: Record<Tour['segment'], string> = {
  saver: 'Tiết kiệm',
  standard: 'Tiêu chuẩn',
  premium: 'Premium',
  luxury: 'Luxury',
  private: 'Private',
};

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/du-lich/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge tone="onImage">{segmentLabel[tour.segment]}</Badge>
          {tour.seatsLeft <= 8 && (
            <Badge tone="gold">Còn {tour.seatsLeft} chỗ</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {tour.durationDays}N{tour.durationNights}Đ
          </span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3.5 w-3.5" />
            {tour.destination}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-lg font-medium leading-snug text-midnight">
          <Link href={`/du-lich/${tour.slug}`} className="hover:text-royal">
            {tour.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-ink-soft">
          Khởi hành: {tour.departureFrom.join(' · ')}
        </p>

        <div className="mt-auto pt-4">
          <ActionBadge action={tour.action} className="mb-2" />
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-xs text-ink-soft">Giá từ</span>
              <span className="font-display text-xl font-semibold text-midnight">
                {formatPrice(tour.price)}
              </span>
              <span className="text-xs text-ink-soft">{tour.price.unit}</span>
            </div>
            <Link
              href={`/du-lich/${tour.slug}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-midnight text-white transition-colors group-hover:bg-royal"
              aria-label={`Xem chi tiết ${tour.title}`}
            >
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
