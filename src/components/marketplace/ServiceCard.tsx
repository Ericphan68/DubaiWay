import Link from 'next/link';
import { formatDisplayPrice } from './Price';
import { DEFAULT_DISPLAY_CURRENCY, getCurrencyOption, type CurrencyOption } from '@/config/locales';
import type { ServiceSummary } from '@/server/repositories/types';
import { cn } from '@/lib/utils';
import { getDictionary, INTL_LOCALES, type Locale } from '@/i18n';
import { getLocale } from '@/server/locale';
import { getDisplayCurrency } from '@/server/currency';

/** Định dạng thời lượng cho người đọc: 360 phút → "6 giờ" / "6 hours". */
export function formatDuration(minutes: number | null, locale: Locale = 'vi'): string | null {
  if (!minutes) return null;
  const u = locale === 'en'
    ? { min: 'min', hour: 'hours', day: 'days' }
    : { min: 'phút', hour: 'giờ', day: 'ngày' };
  if (minutes < 60) return `${minutes} ${u.min}`;
  const hours = minutes / 60;
  if (hours >= 24) return `${Math.round(hours / 24)} ${u.day}`;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${u.hour}`;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-champagne-600" aria-label={`${value.toFixed(1)} trên 5 sao`}>
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
      </svg>
      <span className="text-sm font-semibold text-midnight">{value.toFixed(1)}</span>
    </span>
  );
}

export function ServiceCard({
  service, locale = 'vi', currency, className,
}: {
  service: ServiceSummary;
  locale?: Locale;
  /** Tiền tệ hiển thị. Không truyền thì dùng tiền quyết toán mặc định. */
  currency?: CurrencyOption;
  className?: string;
}) {
  const cur = currency ?? (getCurrencyOption(DEFAULT_DISPLAY_CURRENCY) as CurrencyOption);
  const t = getDictionary(locale);
  const intl = INTL_LOCALES[locale];
  const duration = formatDuration(service.durationMinutes, locale);

  return (
    <article className={cn('group overflow-hidden rounded-2xl border border-mist bg-ivory-100 transition-shadow duration-300 ease-dubaiway hover:shadow-lg', className)}>
      <Link href={`/dich-vu/${service.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist-200">
          {service.coverImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={service.coverImageUrl}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mist-200 to-ivory-200">
              <span className="font-display text-3xl text-mist-400">DW</span>
            </div>
          )}
          {service.isFeatured ? (
            <span className="absolute left-3 top-3 rounded-full bg-champagne px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-white">
              {t.common.featured}
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">
            {service.city ?? 'Dubai'}
            {duration ? <> · {duration}</> : null}
          </p>

          <h3 className="mt-1.5 line-clamp-2 font-display text-[1.05rem] font-medium leading-snug text-midnight">
            {service.title}
          </h3>

          {service.ratingCount > 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
              <Stars value={service.ratingAvg} />
              <span>({service.ratingCount.toLocaleString(intl)} {t.common.reviews})</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">{t.common.noReviews}</p>
          )}

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {service.instantConfirmation ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-700">
                {t.service.instantConfirmation}
              </span>
            ) : null}
            {service.freeCancellation ? (
              <span className="rounded-full bg-royal/[0.07] px-2 py-0.5 text-[0.68rem] font-medium text-royal">
                {t.service.freeCancellation}
              </span>
            ) : null}
            {service.pickupAvailable ? (
              <span className="rounded-full bg-champagne-200/50 px-2 py-0.5 text-[0.68rem] font-medium text-champagne-600">
                {t.service.pickupAvailable}
              </span>
            ) : null}
          </div>

          {service.priceFrom ? (
            <p className="mt-3 border-t border-mist pt-3">
              <span className="text-xs text-ink-soft">{t.common.from} </span>
              <span className="font-display text-lg font-semibold text-midnight">
                {formatDisplayPrice(service.priceFrom, cur, locale).text}
              </span>
              <span className="text-xs text-ink-soft"> / {t.common.perPerson}</span>
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

/**
 * Lưới dịch vụ. Là server component nên tự đọc ngôn ngữ + tiền tệ từ cookie,
 * các trang gọi nó không phải truyền thủ công. Vẫn cho phép truyền đè khi cần.
 */
export async function ServiceGrid({
  services, locale, currency,
}: {
  services: readonly ServiceSummary[];
  locale?: Locale;
  currency?: CurrencyOption;
}) {
  const loc = locale ?? (await getLocale());
  const cur = currency ?? (await getDisplayCurrency());
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} locale={loc} currency={cur} />
      ))}
    </div>
  );
}
