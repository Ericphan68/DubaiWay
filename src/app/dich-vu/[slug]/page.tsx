import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { BookingPanel } from '@/components/marketplace/BookingPanel';
import { ServiceCard, formatDuration } from '@/components/marketplace/ServiceCard';
import { ServiceReviews } from '@/components/marketplace/ServiceReviews';
import { FavoriteButton } from '@/app/tai-khoan/AccountForms';
import { getSessionUser } from '@/server/auth';
import { isFavorite } from '@/server/services/customer-store';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { getDisplayCurrency } from '@/server/currency';
import { siteConfig } from '@/config/site';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const service = await getRepositories().catalog.getServiceBySlug(slug, locale).catch(() => null);
  if (!service) return { title: 'Không tìm thấy dịch vụ' };
  return {
    title: service.title,
    description: service.summary ?? undefined,
    alternates: { canonical: `${siteConfig.url}/dich-vu/${slug}` },
    openGraph: {
      title: service.title,
      description: service.summary ?? undefined,
      url: `${siteConfig.url}/dich-vu/${slug}`,
      type: 'website',
    },
  };
}

/** Khoảng ngày hiển thị lịch còn chỗ: 60 ngày kể từ hôm nay. */
function availabilityRange(): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now);
  to.setDate(to.getDate() + 60);
  return { from: now.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const currency = await getDisplayCurrency();
  const repo = getRepositories();

  const service = await repo.catalog.getServiceBySlug(slug, locale).catch(() => null);
  if (!service) notFound();

  const user = await getSessionUser();
  const favorited = user ? isFavorite(user.id, service.slug) : false;

  const { from, to } = availabilityRange();
  const [availability, related] = await Promise.all([
    repo.catalog.listAvailability(service.id, from, to).catch(() => []),
    repo.catalog.listRelatedServices(service.id, locale, 4).catch(() => []),
  ]);

  const duration = formatDuration(service.durationMinutes);

  // Dữ liệu có cấu trúc cho Google — giúp hiện giá và điểm đánh giá trên kết quả tìm kiếm.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: service.title,
    description: service.summary ?? undefined,
    brand: { '@type': 'Organization', name: service.merchant.name },
    ...(service.priceFrom
      ? {
          offers: {
            '@type': 'Offer',
            price: (service.priceFrom.amount / 100).toFixed(2),
            priceCurrency: service.priceFrom.currency,
            availability: 'https://schema.org/InStock',
            url: `${siteConfig.url}/dich-vu/${slug}`,
          },
        }
      : {}),
    ...(service.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: service.ratingAvg.toFixed(1),
            reviewCount: service.ratingCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section className="pb-0">
        {/* Đường dẫn phân cấp */}
        <nav aria-label="Đường dẫn" className="text-sm text-ink-soft">
          <Link href="/" className="hover:text-champagne-600">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/danh-muc/${service.categorySlug}`} className="hover:text-champagne-600">
            {service.categorySlug}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">{service.title}</span>
        </nav>

        <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-midnight sm:text-4xl">
          {service.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
          {service.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-champagne" fill="currentColor" aria-hidden>
                <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
              </svg>
              <strong className="text-midnight">{service.ratingAvg.toFixed(1)}</strong>
              <span>({service.ratingCount.toLocaleString('vi-VN')} đánh giá)</span>
            </span>
          ) : null}
          {service.city ? <span>📍 {service.city}</span> : null}
          {duration ? <span>⏱ {duration}</span> : null}
          <Link
            href={service.merchant.slug ? `/doi-tac/${service.merchant.slug}` : '#'}
            className="inline-flex items-center gap-1.5 hover:text-champagne-600"
          >
            <span>Cung cấp bởi <strong className="text-midnight">{service.merchant.name}</strong></span>
            {service.merchant.isVerified ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-700">
                Đã xác minh
              </span>
            ) : null}
          </Link>
        </div>
      </Section>

      <Section className="pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {/* Bộ sưu tập ảnh */}
            <div className="overflow-hidden rounded-2xl bg-mist-200">
              {service.media.length > 0 ? (
                <div className="grid gap-1 sm:grid-cols-2">
                  {service.media.slice(0, 4).map((m, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={m.url}
                      src={m.url}
                      alt={m.altText ?? service.title}
                      className={i === 0 ? 'aspect-[16/10] w-full object-cover sm:col-span-2' : 'aspect-[4/3] w-full object-cover'}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-mist-200 to-ivory-200">
                  <span className="font-display text-5xl text-mist-400">DubaiWay</span>
                </div>
              )}
            </div>

            {service.summary ? (
              <p className="mt-6 text-lg leading-relaxed text-ink-muted">{service.summary}</p>
            ) : null}

            {service.highlights.length > 0 ? (
              <Block title="Điểm nổi bật">
                <ul className="space-y-2">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-ink-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" aria-hidden />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {service.description ? (
              <Block title="Mô tả chi tiết">
                <p className="whitespace-pre-line leading-relaxed text-ink-muted">{service.description}</p>
              </Block>
            ) : null}

            {service.itinerary.length > 0 ? (
              <Block title="Lịch trình">
                <ol className="space-y-4">
                  {service.itinerary.map((d) => (
                    <li key={`${d.dayNumber}-${d.title}`} className="border-l-2 border-champagne-200 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-champagne-600">
                        Ngày {d.dayNumber}{d.startTime ? ` · ${d.startTime}` : ''}
                      </p>
                      <p className="mt-0.5 font-medium text-midnight">{d.title}</p>
                      {d.description ? <p className="mt-1 text-sm text-ink-muted">{d.description}</p> : null}
                    </li>
                  ))}
                </ol>
              </Block>
            ) : null}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {service.included.length > 0 ? (
                <div>
                  <h2 className="font-display text-lg font-medium text-midnight">Giá đã bao gồm</h2>
                  <ul className="mt-3 space-y-1.5">
                    {service.included.map((x) => (
                      <li key={x} className="flex gap-2 text-sm text-ink-muted">
                        <span className="text-emerald-600" aria-hidden>✓</span><span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {service.excluded.length > 0 ? (
                <div>
                  <h2 className="font-display text-lg font-medium text-midnight">Không bao gồm</h2>
                  <ul className="mt-3 space-y-1.5">
                    {service.excluded.map((x) => (
                      <li key={x} className="flex gap-2 text-sm text-ink-muted">
                        <span className="text-ink-soft" aria-hidden>✕</span><span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <Block title="Thông tin cần biết">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {service.meetingPoint ? <Fact label="Điểm tập trung" value={service.meetingPoint} /> : null}
                {service.address ? <Fact label="Địa chỉ" value={service.address} /> : null}
                {service.languages.length > 0 ? (
                  <Fact label="Ngôn ngữ phục vụ" value={service.languages.map(langLabel).join(', ')} />
                ) : null}
                {duration ? <Fact label="Thời lượng" value={duration} /> : null}
                <Fact label="Số khách" value={`${service.minGuests}–${service.maxGuests ?? '∞'} người`} />
                <Fact label="Đặt trước tối thiểu" value={`${service.bookingCutoffHours} giờ`} />
                {service.guestRequirements ? <Fact label="Yêu cầu với khách" value={service.guestRequirements} /> : null}
                {service.healthRequirements ? <Fact label="Lưu ý sức khoẻ" value={service.healthRequirements} /> : null}
                {service.usageTerms ? <Fact label="Điều kiện sử dụng" value={service.usageTerms} /> : null}
              </dl>
            </Block>

            {service.policies ? (
              <Block title="Chính sách huỷ và hoàn tiền">
                {service.policies.cancellationText ? (
                  <p className="text-ink-muted">{service.policies.cancellationText}</p>
                ) : null}
                {service.policies.cancellationTiers.length > 0 ? (
                  <ul className="mt-3 space-y-1.5">
                    {service.policies.cancellationTiers.map((t) => (
                      <li key={t.hoursBefore} className="text-sm text-ink-muted">
                        Huỷ trước <strong className="text-midnight">{t.hoursBefore} giờ</strong> — hoàn{' '}
                        <strong className="text-midnight">{t.refundBps / 100}%</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-soft">Dịch vụ này không áp dụng hoàn tiền khi huỷ.</p>
                )}
                <p className="mt-3 text-sm text-ink-soft">
                  Thời hạn khiếu nại sau khi sử dụng: {service.policies.disputeWindowHours} giờ.
                </p>
              </Block>
            ) : null}

            <ServiceReviews serviceSlug={service.slug} />

            {service.latitude && service.longitude ? (
              <Block title="Vị trí">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm text-royal underline-offset-4 hover:underline"
                >
                  Xem trên Google Maps ({service.latitude.toFixed(4)}, {service.longitude.toFixed(4)})
                </a>
              </Block>
            ) : null}
          </div>

          {/* Hộp đặt dịch vụ — dính khi cuộn trên desktop */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingPanel service={service} availability={availability} />

            {/* Lưu yêu thích và chia sẻ */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {user ? (
                <FavoriteButton slug={service.slug} isFavorite={favorited} />
              ) : (
                <Link
                  href={`/dang-nhap?next=/dich-vu/${service.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-mist px-4 py-2 text-sm text-ink-muted transition-colors hover:border-champagne hover:text-champagne-600"
                >
                  <span aria-hidden>♡</span> Đăng nhập để lưu
                </Link>
              )}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${service.title} — ${siteConfig.url}/dich-vu/${service.slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-mist px-4 py-2 text-sm text-ink-muted transition-colors hover:border-champagne hover:text-champagne-600"
              >
                Chia sẻ
              </a>
            </div>
          </aside>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section background="white">
          <h2 className="font-display text-2xl font-medium text-midnight">Dịch vụ liên quan</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((s) => <ServiceCard key={s.id} service={s} locale={locale} currency={currency} />)}
          </div>
        </Section>
      ) : null}
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-medium text-midnight">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink-muted">{value}</dd>
    </div>
  );
}

const LANG_LABELS: Record<string, string> = {
  en: 'Tiếng Anh', ar: 'Tiếng Ả Rập', vi: 'Tiếng Việt', ru: 'Tiếng Nga', zh: 'Tiếng Trung',
};
function langLabel(code: string): string {
  return LANG_LABELS[code] ?? code.toUpperCase();
}
