'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/core/money';
import { QuoteError, createQuote } from '@/server/services/booking-service';
import type { AvailabilitySlot, ServiceDetail } from '@/server/repositories/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Hộp đặt dịch vụ.
 *
 * Giá hiển thị ở đây tính bằng ĐÚNG hàm createQuote mà máy chủ dùng lúc thanh toán,
 * nên con số khách nhìn thấy và con số cuối cùng không bao giờ lệch nhau.
 * Máy chủ vẫn tính lại khi tạo đơn — không tin số nào gửi lên từ trình duyệt.
 */
export function BookingPanel({
  service,
  availability,
}: {
  service: ServiceDetail;
  availability: readonly AvailabilitySlot[];
}) {
  const router = useRouter();
  const [packageId, setPackageId] = useState(service.packages[0]?.id ?? '');
  const [date, setDate] = useState(availability.find((a) => !a.isClosed)?.date ?? '');
  const [adults, setAdults] = useState(Math.max(1, service.minGuests));
  const [children, setChildren] = useState(0);

  const pkg = service.packages.find((p) => p.id === packageId) ?? service.packages[0];
  const slot = availability.find((a) => a.date === date);

  const quote = useMemo(() => {
    if (!pkg) return null;
    try {
      return createQuote({
        pkg,
        guests: { adults, children, infants: 0 },
        hasReferrer: false, // thưởng giới thiệu tính ở máy chủ, không hiện trong giá khách trả
      });
    } catch (err) {
      return err instanceof QuoteError ? err : null;
    }
  }, [pkg, adults, children]);

  const quoteError = quote instanceof QuoteError ? quote.message : null;
  const financials = quote && !(quote instanceof QuoteError) ? quote.financials : null;

  const totalGuests = adults + children;
  const notEnoughSeats = slot ? totalGuests > slot.capacityRemaining : false;
  const canBook = Boolean(pkg && date && financials && !quoteError && !notEnoughSeats);

  if (!pkg) {
    return (
      <div className="rounded-2xl border border-mist bg-ivory-100 p-6">
        <p className="text-sm text-ink-muted">Dịch vụ này chưa mở bán. Vui lòng quay lại sau.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-5 shadow-console sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Từ</p>
      <p className="font-display text-2xl font-semibold text-midnight">
        {formatMoney(pkg.priceGroup && pkg.priceGroup.amount > 0 ? pkg.priceGroup : pkg.priceAdult, 'vi-VN')}
        <span className="ml-1 text-sm font-normal text-ink-soft">
          {pkg.priceGroup && pkg.priceGroup.amount > 0 ? '/ nhóm' : '/ khách'}
        </span>
      </p>

      {/* Chọn gói */}
      {service.packages.length > 1 ? (
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Chọn gói dịch vụ
          </legend>
          <div className="space-y-2">
            {service.packages.map((p) => (
              <label
                key={p.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors duration-200',
                  p.id === packageId ? 'border-champagne bg-champagne/[0.05]' : 'border-mist hover:border-mist-400',
                )}
              >
                <input
                  type="radio"
                  name="package"
                  value={p.id}
                  checked={p.id === packageId}
                  onChange={() => setPackageId(p.id)}
                  className="mt-1 accent-champagne"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-midnight">{p.name}</span>
                  {p.description ? (
                    <span className="block text-xs text-ink-soft">{p.description}</span>
                  ) : null}
                  <span className="mt-1 block text-sm font-semibold text-champagne-600">
                    {formatMoney(p.priceGroup && p.priceGroup.amount > 0 ? p.priceGroup : p.priceAdult, 'vi-VN')}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Chọn ngày */}
      <div className="mt-5">
        <label htmlFor="booking-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Chọn ngày
        </label>
        {availability.length === 0 ? (
          <p className="rounded-xl border border-mist bg-ivory-200 px-3 py-2.5 text-sm text-ink-soft">
            Chưa có lịch trống. Liên hệ để được xếp lịch riêng.
          </p>
        ) : (
          <select
            id="booking-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal"
          >
            {availability.map((a) => (
              <option key={a.id} value={a.date} disabled={a.isClosed}>
                {new Date(`${a.date}T00:00:00`).toLocaleDateString('vi-VN', {
                  weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                })}
                {a.isClosed ? ' — hết chỗ' : ` — còn ${a.capacityRemaining} chỗ`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Số khách */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stepper label="Người lớn" value={adults} onChange={setAdults} min={1} max={service.maxGuests ?? 40} />
        <Stepper
          label="Trẻ em"
          value={children}
          onChange={setChildren}
          min={0}
          max={service.maxGuests ?? 40}
          disabled={!pkg.priceChild}
          hint={!pkg.priceChild ? 'Gói này không nhận trẻ em' : undefined}
        />
      </div>

      {/* Chi tiết giá */}
      {financials ? (
        <dl className="mt-5 space-y-1.5 border-t border-mist pt-4 text-sm">
          <Row label="Tạm tính" value={formatMoney(financials.subtotal, 'vi-VN')} />
          {financials.taxTotal.amount > 0 ? (
            <Row label="Thuế VAT" value={formatMoney(financials.taxTotal, 'vi-VN')} />
          ) : null}
          <Row
            label="Tổng cộng"
            value={formatMoney(financials.customerTotal, 'vi-VN')}
            emphasis
          />
        </dl>
      ) : null}

      {quoteError ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{quoteError}</p>
      ) : null}
      {notEnoughSeats && slot ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          Ngày này chỉ còn {slot.capacityRemaining} chỗ. Giảm số khách hoặc chọn ngày khác.
        </p>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        className="mt-5 w-full"
        disabled={!canBook}
        onClick={() => {
          const q = new URLSearchParams({
            pkg: packageId, date, adults: String(adults), children: String(children),
          });
          router.push(`/dat-cho/${service.slug}?${q.toString()}`);
        }}
      >
        Đặt ngay
      </Button>

      <p className="mt-3 text-center text-xs text-ink-soft">
        {service.freeCancellation ? 'Huỷ miễn phí theo chính sách của dịch vụ. ' : ''}
        Bạn chưa bị trừ tiền ở bước này.
      </p>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between', emphasis && 'border-t border-mist pt-2')}>
      <dt className={cn('text-ink-muted', emphasis && 'font-medium text-midnight')}>{label}</dt>
      <dd className={cn('font-medium text-midnight', emphasis && 'font-display text-lg font-semibold')}>{value}</dd>
    </div>
  );
}

function Stepper({
  label, value, onChange, min, max, disabled, hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <div className={cn('flex h-11 items-center justify-between rounded-xl border border-mist px-2', disabled && 'opacity-50')}>
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-7 w-7 rounded-full text-midnight transition-colors hover:bg-mist-200 disabled:opacity-40"
        >−</button>
        <span className="text-sm font-medium text-midnight" aria-live="polite">{value}</span>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-7 w-7 rounded-full text-midnight transition-colors hover:bg-mist-200 disabled:opacity-40"
        >+</button>
      </div>
      {hint ? <p className="mt-1 text-[0.7rem] text-ink-soft">{hint}</p> : null}
    </div>
  );
}
