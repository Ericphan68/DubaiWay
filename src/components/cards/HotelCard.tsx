import Image from 'next/image';
import type { Hotel } from '@/types';
import { formatPrice } from '@/lib/format';
import { Stars } from '@/components/ui/Stars';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { IconMapPin, IconCheck } from '@/components/ui/icons';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-midnight/70 px-2.5 py-1 backdrop-blur-sm">
          <Stars count={hotel.stars} size={12} />
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-champagne px-2.5 py-1 text-xs font-bold text-midnight">
          {hotel.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-medium leading-snug text-midnight">
          {hotel.name}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
          <IconMapPin className="h-3.5 w-3.5" /> {hotel.area}, {hotel.city}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {hotel.freeCancellation && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <IconCheck className="h-3.5 w-3.5" /> Hủy miễn phí
            </span>
          )}
          {hotel.breakfastIncluded && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <IconCheck className="h-3.5 w-3.5" /> Gồm bữa sáng
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <ActionBadge action={hotel.action} className="mb-1" />
            <span className="block text-xs text-ink-soft">Giá tham khảo từ</span>
            <span className="font-display text-xl font-semibold text-midnight">
              {formatPrice(hotel.price)}
            </span>
            <span className="text-xs text-ink-soft">{hotel.price.unit}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
