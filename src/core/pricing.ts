/**
 * Công cụ tính tiền cho một booking: tổng khách trả, hoa hồng nền tảng,
 * doanh thu merchant, thưởng giới thiệu.
 *
 * NGUYÊN TẮC
 * 1. Mọi tỷ lệ lưu bằng basis points (bp) nguyên: 10% = 1000 bp, 30% = 3000 bp.
 * 2. Tỷ lệ KHÔNG ghi cứng ở đây — truyền vào qua CommissionConfig lấy từ platform_settings,
 *    và được snapshot vào từng booking để đổi cấu hình sau này không làm sai lịch sử.
 * 3. Thưởng referral tính trên HOA HỒNG NỀN TẢNG, không phải trên giá trị đơn hàng.
 *    referral_reward = eligible_order_value × commission_rate × referral_share
 * 4. Chỉ một tầng giới thiệu. Hàm ở đây chỉ nhận đúng một người giới thiệu trực tiếp.
 */

import {
  type CurrencyCode,
  type Money,
  add,
  applyRateBps,
  money,
  multiply,
  subtract,
  sum,
  zero,
} from './money';

/** Cơ sở tính hoa hồng. Mặc định: tạm tính sau giảm giá, CHƯA gồm thuế và phí nền tảng. */
export type CommissionBase = 'subtotal_after_discount' | 'customer_total';

export interface CommissionConfig {
  /** Hoa hồng nền tảng, basis points. 1000 = 10%. */
  readonly commissionRateBps: number;
  /** Phần người giới thiệu được hưởng TRÊN HOA HỒNG, basis points. 3000 = 30%. */
  readonly referralShareBps: number;
  readonly commissionBase: CommissionBase;
}

/** Cấu hình mặc định — chỉ dùng khi chưa đọc được platform_settings. */
export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  commissionRateBps: 1000, // 10%
  referralShareBps: 3000, // 30% của hoa hồng
  commissionBase: 'subtotal_after_discount',
};

export interface PriceLine {
  readonly label: string;
  readonly unitPrice: Money;
  readonly quantity: number;
}

export interface QuoteInput {
  readonly currency: CurrencyCode;
  readonly lines: readonly PriceLine[];
  /** Giảm giá (coupon, khuyến mãi). Giá trị dương. */
  readonly discounts?: readonly Money[];
  /** Thuế thu hộ (VAT…). Không thuộc doanh thu của merchant hay nền tảng. */
  readonly taxes?: readonly Money[];
  /** Phí nền tảng thu thêm của khách (phí dịch vụ, phí thanh toán). */
  readonly fees?: readonly Money[];
  /** Có người giới thiệu hợp lệ hay không. Không có thì thưởng = 0. */
  readonly hasReferrer?: boolean;
}

/**
 * Ảnh chụp tài chính của một booking. Toàn bộ các trường này được ghi vào bảng bookings
 * và KHÔNG BAO GIỜ tính lại từ cấu hình hiện hành.
 */
export interface BookingFinancials {
  readonly currency: CurrencyCode;
  /** Tổng tiền hàng trước giảm giá. */
  readonly subtotal: Money;
  readonly discountTotal: Money;
  readonly taxTotal: Money;
  readonly feeTotal: Money;
  /** Số khách thực trả. */
  readonly customerTotal: Money;
  /** Cơ sở dùng để tính hoa hồng (snapshot cả cách tính). */
  readonly commissionBase: CommissionBase;
  readonly commissionBaseAmount: Money;
  readonly commissionRateBps: number;
  readonly platformCommission: Money;
  /** Merchant nhận = cơ sở hoa hồng − hoa hồng. Thuế thu hộ không tính vào đây. */
  readonly merchantRevenue: Money;
  readonly referralShareBps: number;
  readonly referralReward: Money;
  /** Hoa hồng còn lại của nền tảng sau khi trả thưởng giới thiệu. */
  readonly platformNetRevenue: Money;
  /** Phí nền tảng thu của khách — nguồn thu riêng, không chia cho merchant/referrer. */
  readonly platformFeeRevenue: Money;
}

export function computeBookingFinancials(
  input: QuoteInput,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG,
): BookingFinancials {
  const { currency } = input;

  const subtotal = sum(
    input.lines.map((line) => multiply(line.unitPrice, line.quantity)),
    currency,
  );
  const discountTotal = sum(input.discounts ?? [], currency);
  const taxTotal = sum(input.taxes ?? [], currency);
  const feeTotal = sum(input.fees ?? [], currency);

  const subtotalAfterDiscount = subtract(subtotal, discountTotal);
  if (subtotalAfterDiscount.amount < 0) {
    throw new Error('computeBookingFinancials: giảm giá lớn hơn tiền hàng');
  }

  const customerTotal = add(add(subtotalAfterDiscount, taxTotal), feeTotal);

  const commissionBaseAmount =
    config.commissionBase === 'customer_total' ? customerTotal : subtotalAfterDiscount;

  const platformCommission = applyRateBps(commissionBaseAmount, config.commissionRateBps);
  const merchantRevenue = subtract(commissionBaseAmount, platformCommission);

  const referralReward = input.hasReferrer
    ? applyRateBps(platformCommission, config.referralShareBps)
    : zero(currency);

  const platformNetRevenue = subtract(platformCommission, referralReward);

  return {
    currency,
    subtotal,
    discountTotal,
    taxTotal,
    feeTotal,
    customerTotal,
    commissionBase: config.commissionBase,
    commissionBaseAmount,
    commissionRateBps: config.commissionRateBps,
    platformCommission,
    merchantRevenue,
    referralShareBps: config.referralShareBps,
    referralReward,
    platformNetRevenue,
    platformFeeRevenue: feeTotal,
  };
}

/**
 * Tính bút toán điều chỉnh khi hoàn tiền. KHÔNG sửa bản ghi gốc —
 * trả về các giá trị ÂM để ghi thêm một dòng reversal vào sổ cái.
 *
 * Hoàn một phần được chia theo tỷ lệ trên cơ sở tính hoa hồng, nên hoa hồng và
 * thưởng giới thiệu bị thu hồi đúng theo phần đã hoàn.
 */
export interface RefundAdjustment {
  readonly currency: CurrencyCode;
  readonly refundToCustomer: Money;
  readonly commissionReversal: Money;
  readonly merchantRevenueReversal: Money;
  readonly referralRewardReversal: Money;
  readonly platformNetRevenueReversal: Money;
}

export function computeRefundAdjustment(
  original: BookingFinancials,
  refundToCustomer: Money,
): RefundAdjustment {
  if (refundToCustomer.currency !== original.currency) {
    throw new Error('computeRefundAdjustment: sai loại tiền tệ');
  }
  if (refundToCustomer.amount < 0) {
    throw new Error('computeRefundAdjustment: số tiền hoàn phải không âm');
  }
  if (refundToCustomer.amount > original.customerTotal.amount) {
    throw new Error('computeRefundAdjustment: hoàn nhiều hơn số khách đã trả');
  }

  const isFullRefund = refundToCustomer.amount === original.customerTotal.amount;

  // Hoàn toàn bộ: thu hồi đúng bằng số đã ghi nhận, tránh sai lệch do làm tròn.
  if (isFullRefund) {
    return {
      currency: original.currency,
      refundToCustomer,
      commissionReversal: negateMoney(original.platformCommission),
      merchantRevenueReversal: negateMoney(original.merchantRevenue),
      referralRewardReversal: negateMoney(original.referralReward),
      platformNetRevenueReversal: negateMoney(original.platformNetRevenue),
    };
  }

  // Hoàn một phần: tỷ lệ hoàn = refund / customerTotal, áp lên cơ sở hoa hồng.
  const ratioBps = Math.round((refundToCustomer.amount * 10_000) / original.customerTotal.amount);
  const baseReversed = applyRateBps(original.commissionBaseAmount, ratioBps);
  const commissionReversed = applyRateBps(baseReversed, original.commissionRateBps);
  const merchantReversed = subtract(baseReversed, commissionReversed);
  const referralReversed =
    original.referralReward.amount > 0
      ? applyRateBps(commissionReversed, original.referralShareBps)
      : zero(original.currency);
  const platformNetReversed = subtract(commissionReversed, referralReversed);

  return {
    currency: original.currency,
    refundToCustomer,
    commissionReversal: negateMoney(commissionReversed),
    merchantRevenueReversal: negateMoney(merchantReversed),
    referralRewardReversal: negateMoney(referralReversed),
    platformNetRevenueReversal: negateMoney(platformNetReversed),
  };
}

function negateMoney(a: Money): Money {
  return money(-a.amount, a.currency);
}
