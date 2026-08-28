/**
 * Nghiệp vụ đặt dịch vụ.
 *
 * Đây là nơi DUY NHẤT quyết định số tiền của một booking. Không component nào,
 * không route nào được tự nhân giá — tất cả đi qua đây để bảo đảm mọi đơn hàng
 * đều có ảnh chụp tài chính đầy đủ và cân sổ.
 */
import {
  type CurrencyCode, type Money, applyRateBps, money, multiply, zero,
} from '@/core/money';
import {
  type BookingFinancials, type CommissionConfig, type PriceLine,
  DEFAULT_COMMISSION_CONFIG, computeBookingFinancials,
} from '@/core/pricing';
import type { ServicePackageSummary } from '@/server/repositories/types';

export interface GuestCounts {
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
}

export interface QuoteRequest {
  readonly pkg: ServicePackageSummary;
  readonly guests: GuestCounts;
  /** Giảm giá đã xác thực từ coupon. Không nhận số tuỳ ý từ client. */
  readonly discount?: Money;
  readonly hasReferrer: boolean;
  readonly commission?: CommissionConfig;
}

export class QuoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuoteError';
  }
}

/** Tổng số khách tính vào sức chứa. Trẻ sơ sinh không chiếm chỗ. */
export function billableGuests(g: GuestCounts): number {
  return g.adults + g.children;
}

/**
 * Dựng các dòng giá từ một gói dịch vụ.
 * Gói bán theo nhóm (yacht, xe đưa đón) tính trọn gói, không nhân đầu người.
 */
export function buildPriceLines(pkg: ServicePackageSummary, guests: GuestCounts): PriceLine[] {
  const currency = pkg.priceAdult.currency;

  if (pkg.priceGroup && pkg.priceGroup.amount > 0) {
    const capacity = pkg.groupSize ?? pkg.maxGuests ?? billableGuests(guests);
    if (capacity <= 0) throw new QuoteError('Gói theo nhóm thiếu thông tin sức chứa');
    // Vượt sức chứa một xe/thuyền thì tính thêm suất, làm tròn LÊN.
    const units = Math.max(1, Math.ceil(billableGuests(guests) / capacity));
    return [{ label: pkg.name, unitPrice: pkg.priceGroup, quantity: units }];
  }

  const lines: PriceLine[] = [];
  if (guests.adults > 0) {
    lines.push({ label: 'Người lớn', unitPrice: pkg.priceAdult, quantity: guests.adults });
  }
  if (guests.children > 0) {
    if (!pkg.priceChild) throw new QuoteError('Gói này không nhận trẻ em');
    lines.push({ label: 'Trẻ em', unitPrice: pkg.priceChild, quantity: guests.children });
  }
  if (lines.length === 0) {
    lines.push({ label: 'Người lớn', unitPrice: zero(currency), quantity: 0 });
  }
  return lines;
}

export function validateGuests(pkg: ServicePackageSummary, guests: GuestCounts): void {
  const total = billableGuests(guests);
  if (total <= 0) throw new QuoteError('Cần ít nhất một khách');
  if (total < pkg.minGuests) {
    throw new QuoteError(`Gói này yêu cầu tối thiểu ${pkg.minGuests} khách`);
  }
  if (pkg.maxGuests !== null && total > pkg.maxGuests) {
    throw new QuoteError(`Gói này nhận tối đa ${pkg.maxGuests} khách`);
  }
  if (guests.adults < 0 || guests.children < 0 || guests.infants < 0) {
    throw new QuoteError('Số khách không được âm');
  }
}

export interface Quote {
  readonly lines: readonly PriceLine[];
  readonly financials: BookingFinancials;
  readonly currency: CurrencyCode;
}

/**
 * Tính báo giá đầy đủ cho một lựa chọn của khách.
 * Thuế tính trên tiền hàng SAU giảm giá — đúng cách VAT vận hành ở UAE.
 */
export function createQuote(req: QuoteRequest): Quote {
  validateGuests(req.pkg, req.guests);

  const lines = buildPriceLines(req.pkg, req.guests);
  const currency = lines[0].unitPrice.currency;

  const subtotal = lines.reduce(
    (acc, l) => acc + multiply(l.unitPrice, l.quantity).amount,
    0,
  );
  const discount = req.discount ?? zero(currency);
  if (discount.currency !== currency) {
    throw new QuoteError('Giảm giá khác loại tiền với dịch vụ');
  }
  if (discount.amount > subtotal) {
    throw new QuoteError('Giảm giá lớn hơn giá trị đơn hàng');
  }

  const taxable = money(subtotal - discount.amount, currency);
  const tax = applyRateBps(taxable, req.pkg.taxRateBps);

  const financials = computeBookingFinancials(
    {
      currency,
      lines,
      discounts: discount.amount > 0 ? [discount] : [],
      taxes: tax.amount > 0 ? [tax] : [],
      hasReferrer: req.hasReferrer,
    },
    req.commission ?? DEFAULT_COMMISSION_CONFIG,
  );

  return { lines, financials, currency };
}

/**
 * Số tiền hoàn theo chính sách huỷ của dịch vụ.
 * Bậc nào có `hoursBefore` lớn nhất mà vẫn ≤ thời gian còn lại thì áp dụng bậc đó.
 */
export function refundRateBps(
  tiers: readonly { hoursBefore: number; refundBps: number }[],
  hoursUntilService: number,
): number {
  if (tiers.length === 0) return 0;
  const applicable = [...tiers]
    .sort((a, b) => b.hoursBefore - a.hoursBefore)
    .find((t) => hoursUntilService >= t.hoursBefore);
  return applicable?.refundBps ?? 0;
}

export function computeCancellationRefund(
  customerTotal: Money,
  tiers: readonly { hoursBefore: number; refundBps: number }[],
  hoursUntilService: number,
): { rateBps: number; amount: Money } {
  const rateBps = refundRateBps(tiers, hoursUntilService);
  return { rateBps, amount: applyRateBps(customerTotal, rateBps) };
}
