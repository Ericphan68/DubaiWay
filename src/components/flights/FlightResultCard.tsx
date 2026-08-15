import type { SampleFlight } from '@/types';
import { formatPrice } from '@/lib/format';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { IconPlane, IconArrowRight, IconArrowUpRight, IconLuggage } from '@/components/ui/icons';

export function FlightResultCard({ flight }: { flight: SampleFlight }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-ivory-100 shadow-card">
      {/* Header tuyến */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist bg-mist-200/50 px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-midnight">
          <span>{flight.fromCity} ({flight.fromCode})</span>
          <IconArrowRight className="h-4 w-4 text-champagne-600" />
          <span>{flight.toCity} ({flight.toCode})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-soft">{flight.cabin}</span>
          <ActionBadge action="partner" />
        </div>
      </div>

      {/* 3 đối tác */}
      <div className="grid divide-y divide-mist md:grid-cols-3 md:divide-x md:divide-y-0">
        {flight.offers.map((offer) => (
          <div key={offer.partner} className="flex flex-col p-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-midnight text-xs font-bold text-champagne-400">
                {offer.logoInitial}
              </span>
              <div>
                <p className="text-sm font-semibold text-midnight">{offer.partner}</p>
                <p className="text-xs text-ink-soft">{offer.airline}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-midnight">
              <span className="font-semibold">{offer.departTime}</span>
              <span className="flex-1 border-t border-dashed border-mist-400" />
              <IconPlane className="h-3.5 w-3.5 text-ink-soft" />
              <span className="flex-1 border-t border-dashed border-mist-400" />
              <span className="font-semibold">{offer.arriveTime}</span>
            </div>
            <p className="mt-1 text-center text-xs text-ink-soft">{offer.duration} · {offer.stops}</p>

            <ul className="mt-3 space-y-1.5 text-xs text-ink-muted">
              <li className="flex items-center gap-1.5"><IconLuggage className="h-3.5 w-3.5 text-royal" /> {offer.baggage}</li>
              <li className="flex items-center gap-1.5"><IconArrowRight className="h-3.5 w-3.5 text-royal" /> {offer.changePolicy}</li>
            </ul>

            <div className="mt-auto pt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold text-midnight">{formatPrice(offer.price)}</span>
                <span className="text-[0.65rem] text-champagne-600">tham khảo</span>
              </div>
              <a
                href={offer.partnerUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-royal text-sm font-medium text-royal transition-colors hover:bg-royal hover:text-white"
              >
                Xem &amp; đặt <IconArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
