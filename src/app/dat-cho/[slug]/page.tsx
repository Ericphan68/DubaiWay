import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatMoney } from '@/core/money';
import { Section } from '@/components/ui/Section';
import { ErrorState } from '@/components/states';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { createQuote, QuoteError } from '@/server/services/booking-service';
import { getPaymentGateway } from '@/server/adapters/payment';
import { CheckoutForm } from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Xác nhận đặt dịch vụ',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const num = (v: string | string[] | undefined, fallback: number): number => {
  const n = Number.parseInt(typeof v === 'string' ? v : '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = await getLocale();

  const service = await getRepositories().catalog.getServiceBySlug(slug, locale).catch(() => null);
  if (!service) notFound();

  const packageId = typeof sp.pkg === 'string' ? sp.pkg : service.packages[0]?.id;
  const pkg = service.packages.find((p) => p.id === packageId);
  const date = typeof sp.date === 'string' ? sp.date : '';
  const adults = num(sp.adults, 1);
  const children = num(sp.children, 0);

  if (!pkg || !date) {
    return (
      <Section>
        <ErrorState
          title="Thiếu thông tin đặt chỗ"
          body="Vui lòng quay lại trang dịch vụ và chọn gói cùng ngày sử dụng."
          retryHref={`/dich-vu/${slug}`}
        />
      </Section>
    );
  }

  // Tính lại giá ở máy chủ — đây mới là con số có hiệu lực.
  let quote;
  try {
    quote = createQuote({ pkg, guests: { adults, children, infants: 0 }, hasReferrer: false });
  } catch (err) {
    return (
      <Section>
        <ErrorState
          title="Lựa chọn không hợp lệ"
          body={err instanceof QuoteError ? err.message : undefined}
          retryHref={`/dich-vu/${slug}`}
        />
      </Section>
    );
  }

  const f = quote.financials;
  const gateway = getPaymentGateway();
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <Section>
      <nav aria-label="Đường dẫn" className="text-sm text-ink-soft">
        <Link href={`/dich-vu/${slug}`} className="hover:text-champagne-600">← Quay lại dịch vụ</Link>
      </nav>

      <h1 className="mt-3 font-display text-3xl font-medium text-midnight">Xác nhận đặt dịch vụ</h1>

      {gateway.isSandbox ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Chế độ thử nghiệm.</strong> Chưa cấu hình cổng thanh toán thật nên không có khoản tiền
          nào bị trừ. Đơn hàng vẫn được tạo đầy đủ để bạn xem toàn bộ luồng.
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <CheckoutForm slug={slug} packageId={pkg.id} date={date} adults={adults} childCount={children} />

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-mist bg-ivory-200 p-5 sm:p-6">
            <h2 className="font-display text-lg font-medium text-midnight">Chi tiết đơn hàng</h2>

            <div className="mt-4 border-b border-mist pb-4">
              <p className="font-medium text-midnight">{service.title}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{pkg.name}</p>
              <p className="mt-2 text-sm text-ink-muted">📅 {dateLabel}</p>
              <p className="text-sm text-ink-muted">
                👥 {adults} người lớn{children > 0 ? `, ${children} trẻ em` : ''}
              </p>
              {service.meetingPoint ? (
                <p className="mt-2 text-sm text-ink-soft">📍 {service.meetingPoint}</p>
              ) : null}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              {quote.lines.map((line) => (
                <div key={line.label} className="flex justify-between">
                  <dt className="text-ink-muted">
                    {line.label} × {line.quantity}
                  </dt>
                  <dd className="text-midnight">
                    {formatMoney({ amount: line.unitPrice.amount * line.quantity, currency: line.unitPrice.currency }, 'vi-VN')}
                  </dd>
                </div>
              ))}
              {f.discountTotal.amount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>Giảm giá</dt>
                  <dd>− {formatMoney(f.discountTotal, 'vi-VN')}</dd>
                </div>
              ) : null}
              {f.taxTotal.amount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Thuế VAT</dt>
                  <dd className="text-midnight">{formatMoney(f.taxTotal, 'vi-VN')}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-mist pt-3">
                <dt className="font-medium text-midnight">Tổng cộng</dt>
                <dd className="font-display text-xl font-semibold text-midnight">
                  {formatMoney(f.customerTotal, 'vi-VN')}
                </dd>
              </div>
            </dl>

            {service.policies?.cancellationText ? (
              <p className="mt-4 border-t border-mist pt-4 text-xs leading-relaxed text-ink-soft">
                <strong className="text-ink-muted">Chính sách huỷ:</strong> {service.policies.cancellationText}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </Section>
  );
}
