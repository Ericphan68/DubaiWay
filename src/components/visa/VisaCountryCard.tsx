import Link from 'next/link';
import type { VisaCountry } from '@/types';
import { IconClock, IconArrowRight } from '@/components/ui/icons';

export function VisaCountryCard({ visa }: { visa: VisaCountry }) {
  return (
    <Link
      href={`/visa/${visa.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-mist bg-ivory-100 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl" aria-hidden>{visa.flag}</span>
        {visa.popular && (
          <span className="rounded-full bg-champagne-200/60 px-2 py-0.5 text-[0.65rem] font-semibold text-champagne-600">
            Phổ biến
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-medium text-midnight group-hover:text-royal">
        {visa.country}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{visa.summary}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1"><IconClock className="h-3.5 w-3.5" /> {visa.processingTime}</span>
        <span>Lưu trú: {visa.stayDuration}</span>
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal">
        Xem chi tiết <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
