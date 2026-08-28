import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { listMerchants } from '@/server/services/merchant-store';
import { listReviewsForMerchant } from '@/server/services/review-store';
import { siteConfig } from '@/config/site';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = listMerchants().find((x) => x.slug === slug && x.status === 'approved');
  if (!m) return { title: 'Không tìm thấy đối tác' };
  return {
    title: m.displayName,
    description: m.description,
    alternates: { canonical: `${siteConfig.url}/doi-tac/${slug}` },
  };
}

export default async function MerchantProfilePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();

  // Chỉ đối tác ĐÃ DUYỆT mới có trang công khai.
  const merchant = listMerchants().find((m) => m.slug === slug && m.status === 'approved');
  if (!merchant) notFound();

  const result = await getRepositories().catalog
    .searchServices({ merchantId: merchant.id, pageSize: 48 }, locale)
    .catch(() => ({ items: [], total: 0, page: 1, pageSize: 48 }));

  const reviews = listReviewsForMerchant(merchant.id).filter((r) => !r.isHidden);
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.ratingOverall, 0) / reviews.length) * 10) / 10
    : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: merchant.displayName,
    description: merchant.description,
    address: { '@type': 'PostalAddress', addressLocality: merchant.city, addressCountry: merchant.country },
    url: `${siteConfig.url}/doi-tac/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section>
        <nav aria-label="Đường dẫn" className="text-sm text-ink-soft">
          <Link href="/" className="hover:text-champagne-600">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">{merchant.displayName}</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-midnight sm:text-4xl">
              {merchant.displayName}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                ✓ Đã xác minh giấy tờ
              </span>
              <span>📍 {merchant.city}, {merchant.country}</span>
              <span>{result.total} dịch vụ đang bán</span>
              {reviews.length > 0 ? (
                <span>★ {avgRating.toFixed(1)} · {reviews.length} đánh giá</span>
              ) : null}
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl leading-relaxed text-ink-muted">{merchant.description}</p>

        <div className="mt-6 rounded-2xl border border-mist bg-ivory-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Đối tác này được kiểm tra thế nào
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {merchant.kind === 'business'
              ? 'Doanh nghiệp đã nộp giấy phép kinh doanh, mã số thuế và giấy tờ người đại diện pháp luật. Hồ sơ được đội thẩm định DubaiWay xét duyệt trước khi bất kỳ dịch vụ nào được bán.'
              : 'Cá nhân đã nộp giấy tờ tuỳ thân và giấy phép hành nghề (nếu ngành nghề yêu cầu). Hồ sơ được đội thẩm định DubaiWay xét duyệt trước khi bất kỳ dịch vụ nào được bán.'}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Giấy tờ pháp lý được lưu riêng tư và không công khai, theo quy định bảo vệ dữ liệu.
          </p>
        </div>
      </Section>

      <Section background="white">
        <h2 className="font-display text-2xl font-medium text-midnight">
          Dịch vụ của {merchant.displayName}
        </h2>
        <div className="mt-6">
          {result.items.length === 0 ? (
            <EmptyState
              title="Đối tác này chưa có dịch vụ nào đang bán"
              action={{ label: 'Xem dịch vụ khác', href: '/danh-muc' }}
            />
          ) : (
            <ServiceGrid services={result.items} />
          )}
        </div>
      </Section>

      {reviews.length > 0 ? (
        <Section>
          <h2 className="font-display text-2xl font-medium text-midnight">
            Đánh giá về đối tác này
          </h2>
          <ul className="mt-6 space-y-4">
            {reviews.slice(0, 10).map((r) => (
              <li key={r.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-midnight">{r.authorName}</p>
                  <p className="text-sm text-champagne-600">
                    {'★'.repeat(r.ratingOverall)}
                    <span className="text-mist-400">{'★'.repeat(5 - r.ratingOverall)}</span>
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Đã xác minh qua đơn hàng {r.bookingReference}
                </p>
                <p className="mt-3 leading-relaxed text-ink-muted">{r.comment}</p>
                {r.merchantResponse ? (
                  <div className="mt-4 rounded-xl bg-ivory-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Phản hồi</p>
                    <p className="mt-1 text-sm text-ink-muted">{r.merchantResponse}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
