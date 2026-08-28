import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { formatMoney } from '@/core/money';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { getBookingByReference } from '@/server/services/booking-store';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Đặt dịch vụ thành công',
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ reference: string }> }

export default async function BookingSuccessPage({ params }: Props) {
  const { reference } = await params;
  const booking = getBookingByReference(reference);
  if (!booking) notFound();

  const qrSvg = await QRCode.toString(booking.voucher.qrPayload, {
    type: 'svg', margin: 1, width: 200, errorCorrectionLevel: 'M',
  });

  const dateLabel = new Date(`${booking.serviceDate}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <svg viewBox="0 0 48 48" className="h-9 w-9 text-emerald-500" fill="none" aria-hidden>
              <path d="M14 24.5l6.5 6.5L34 18" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium text-midnight">Đặt dịch vụ thành công</h1>
          <p className="mt-2 text-ink-muted">
            Chúng tôi đã gửi voucher tới <strong className="text-midnight">{booking.contactEmail}</strong>.
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Mã đơn hàng: <strong className="font-mono text-midnight">{booking.reference}</strong>
          </p>
        </div>

        {/* Voucher */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-mist bg-ivory-100">
          <div className="bg-midnight px-6 py-4 text-white">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-champagne-400">
              Voucher DubaiWay
            </p>
            <p className="mt-1 font-display text-lg">{booking.serviceTitle}</p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-[200px_1fr]">
            <div className="mx-auto">
              <div
                className="rounded-xl bg-white p-3 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                aria-label={`Mã QR voucher ${booking.voucher.code}`}
              />
              <p className="mt-2 text-center font-mono text-xs text-ink-muted">{booking.voucher.code}</p>
            </div>

            <dl className="space-y-3 text-sm">
              <Row label="Gói dịch vụ" value={booking.packageName} />
              <Row label="Ngày sử dụng" value={dateLabel} />
              {booking.startTime ? <Row label="Giờ" value={booking.startTime} /> : null}
              <Row
                label="Số khách"
                value={`${booking.adults} người lớn${booking.children > 0 ? `, ${booking.children} trẻ em` : ''}`}
              />
              {booking.voucher.meetingPoint ? (
                <Row label="Điểm tập trung" value={booking.voucher.meetingPoint} />
              ) : null}
              <Row label="Người sử dụng" value={booking.travelers[0]?.fullName ?? '—'} />
              <Row
                label="Tổng đã thanh toán"
                value={formatMoney(booking.financials.customerTotal, 'vi-VN')}
                emphasis
              />
            </dl>
          </div>

          <div className="border-t border-mist bg-ivory-200 px-6 py-4">
            <p className="text-xs leading-relaxed text-ink-soft">
              Xuất trình mã QR này cho đối tác khi sử dụng dịch vụ. Voucher chỉ dùng được
              <strong className="text-ink-muted"> một lần</strong>. Cần hỗ trợ, liên hệ{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="underline underline-offset-2">
                {siteConfig.contact.email}
              </a>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/tai-khoan/don-hang" variant="primary">Xem đơn hàng của tôi</Button>
          <Button href="/danh-muc" variant="outline">Tiếp tục khám phá</Button>
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Đặt nhầm? <Link href="/lien-he" className="underline underline-offset-2">Liên hệ chúng tôi</Link> —
          chính sách huỷ áp dụng theo từng dịch vụ.
        </p>
      </div>
    </Section>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className={emphasis ? 'text-right font-display text-base font-semibold text-midnight' : 'text-right text-midnight'}>
        {value}
      </dd>
    </div>
  );
}
