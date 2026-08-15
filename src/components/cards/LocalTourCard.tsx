import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/types';
import { formatPrice } from '@/lib/format';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Badge } from '@/components/ui/Badge';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { IconClock, IconMapPin, IconUsers, IconCheck, IconWhatsapp } from '@/components/ui/icons';

/** Card cho tour tại điểm đến: nêu rõ điểm tập trung, đón khách sạn, giá NL/TE. */
export function LocalTourCard({ tour }: { tour: Tour }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover sm:flex-row">
      <Link href={`/du-lich/${tour.slug}`} className="relative block aspect-[16/10] shrink-0 overflow-hidden sm:aspect-auto sm:w-64">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 100vw, 16rem"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="onImage">{tour.startTime ? `Bắt đầu ${tour.startTime}` : 'Tour tại điểm đến'}</Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {tour.durationDays > 1 ? `${tour.durationDays}N${tour.durationNights}Đ` : 'Trong ngày'}
          </span>
          {tour.languages && (
            <span className="inline-flex items-center gap-1">
              <IconUsers className="h-3.5 w-3.5" /> {tour.languages.join(', ')}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-midnight">
          <Link href={`/du-lich/${tour.slug}`} className="hover:text-royal">{tour.title}</Link>
        </h3>

        <ul className="mt-2 space-y-1 text-xs text-ink-muted">
          {tour.meetingPoint && (
            <li className="inline-flex items-center gap-1.5">
              <IconMapPin className="h-3.5 w-3.5 text-royal" /> {tour.meetingPoint}
            </li>
          )}
          <li className="inline-flex items-center gap-1.5">
            <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
            {tour.hotelPickup ? 'Có đón tại khách sạn' : 'Tự đến điểm tập trung'}
          </li>
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <ActionBadge action={tour.action} className="mb-1" />
            <div className="flex items-baseline gap-3">
              <span>
                <span className="block text-[0.65rem] text-ink-soft">Người lớn từ</span>
                <span className="font-display text-lg font-semibold text-midnight">{formatPrice(tour.price)}</span>
              </span>
              {tour.childPrice && (
                <span className="text-xs text-ink-soft">
                  Trẻ em: {tour.childPrice.from > 0 ? formatPrice(tour.childPrice) : tour.childPrice.unit}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {tour.action === 'book' ? (
              <Link
                href={`/yeu-cau-bao-gia?tour=${tour.slug}&type=book`}
                className="inline-flex h-10 items-center rounded-full bg-royal px-4 text-sm font-medium text-white transition-colors hover:bg-royal-600"
              >
                Đặt trực tuyến
              </Link>
            ) : (
              <Link
                href={`/yeu-cau-bao-gia?tour=${tour.slug}`}
                className="inline-flex h-10 items-center rounded-full bg-royal px-4 text-sm font-medium text-white transition-colors hover:bg-royal-600"
              >
                Yêu cầu báo giá
              </Link>
            )}
            <a
              href={whatsappLink(`${whatsappMessages.tours} (${tour.title})`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nhắn nhân viên"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-midnight/15 text-[#25D366] transition-colors hover:bg-mist-200"
            >
              <IconWhatsapp className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
