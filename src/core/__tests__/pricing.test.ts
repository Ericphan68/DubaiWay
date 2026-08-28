import { describe, expect, it } from 'vitest';
import { formatMoney, fromMajorUnits, money } from '../money';
import {
  DEFAULT_COMMISSION_CONFIG,
  computeBookingFinancials,
  computeRefundAdjustment,
} from '../pricing';

/** 1 USD = 100 fils. Helper cho dễ đọc test. */
const usd = (v: number) => fromMajorUnits(v, 'USD');

describe('Ví dụ chuẩn trong yêu cầu: đơn 1.000 USD', () => {
  const fin = computeBookingFinancials({
    currency: 'USD',
    lines: [{ label: 'Người lớn', unitPrice: usd(1000), quantity: 1 }],
    hasReferrer: true,
  });

  it('khách trả 1.000 USD', () => {
    expect(fin.customerTotal).toEqual(usd(1000));
    expect(formatMoney(fin.customerTotal, 'en-AE')).toContain('1,000.00');
  });

  it('hoa hồng DubaiWay = 100 USD (10%)', () => {
    expect(fin.platformCommission).toEqual(usd(100));
  });

  it('Merchant nhận 900 USD', () => {
    expect(fin.merchantRevenue).toEqual(usd(900));
  });

  it('người giới thiệu nhận 30 USD = 30% CỦA HOA HỒNG, không phải 30% đơn hàng', () => {
    expect(fin.referralReward).toEqual(usd(30));
    // 30% của giá trị đơn hàng sẽ là 300 USD — phải KHÁC
    expect(fin.referralReward).not.toEqual(usd(300));
  });

  it('DubaiWay thực giữ 70 USD', () => {
    expect(fin.platformNetRevenue).toEqual(usd(70));
  });

  it('sổ sách cân: merchant + hoa hồng = khách trả', () => {
    expect(fin.merchantRevenue.amount + fin.platformCommission.amount).toBe(fin.customerTotal.amount);
  });

  it('sổ sách cân: thưởng + nền tảng giữ = hoa hồng', () => {
    expect(fin.referralReward.amount + fin.platformNetRevenue.amount).toBe(fin.platformCommission.amount);
  });
});

describe('Không có người giới thiệu', () => {
  it('thưởng = 0, nền tảng giữ trọn hoa hồng', () => {
    const fin = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'Người lớn', unitPrice: usd(1000), quantity: 1 }],
      hasReferrer: false,
    });
    expect(fin.referralReward.amount).toBe(0);
    expect(fin.platformNetRevenue).toEqual(usd(100));
  });
});

describe('Nhiều dòng giá, giảm giá, thuế và phí', () => {
  const fin = computeBookingFinancials({
    currency: 'USD',
    lines: [
      { label: 'Người lớn', unitPrice: usd(350), quantity: 2 }, // 700
      { label: 'Trẻ em', unitPrice: usd(175), quantity: 2 }, // 350
    ],
    discounts: [usd(50)],
    taxes: [usd(50)], // VAT 5% thu hộ
    fees: [usd(20)], // phí dịch vụ nền tảng
    hasReferrer: true,
  });

  it('tạm tính 1.050, sau giảm giá 1.000', () => {
    expect(fin.subtotal).toEqual(usd(1050));
    expect(fin.discountTotal).toEqual(usd(50));
  });

  it('khách trả = 1.000 + 50 thuế + 20 phí = 1.070', () => {
    expect(fin.customerTotal).toEqual(usd(1070));
  });

  it('hoa hồng tính trên 1.000 (sau giảm giá, chưa gồm thuế/phí) = 100', () => {
    expect(fin.commissionBaseAmount).toEqual(usd(1000));
    expect(fin.platformCommission).toEqual(usd(100));
  });

  it('thuế thu hộ KHÔNG vào doanh thu merchant', () => {
    expect(fin.merchantRevenue).toEqual(usd(900));
  });

  it('phí nền tảng là nguồn thu riêng, không chia cho merchant', () => {
    expect(fin.platformFeeRevenue).toEqual(usd(20));
  });

  it('thưởng giới thiệu = 30 USD', () => {
    expect(fin.referralReward).toEqual(usd(30));
  });
});

describe('Tỷ lệ có thể cấu hình, không ghi cứng', () => {
  it('đổi hoa hồng sang 15% và thưởng sang 20%', () => {
    const fin = computeBookingFinancials(
      { currency: 'USD', lines: [{ label: 'x', unitPrice: usd(1000), quantity: 1 }], hasReferrer: true },
      { commissionRateBps: 1500, referralShareBps: 2000, commissionBase: 'subtotal_after_discount' },
    );
    expect(fin.platformCommission).toEqual(usd(150));
    expect(fin.merchantRevenue).toEqual(usd(850));
    expect(fin.referralReward).toEqual(usd(30)); // 20% của 150
    expect(fin.platformNetRevenue).toEqual(usd(120));
  });

  it('đổi cơ sở tính hoa hồng sang tổng khách trả', () => {
    const fin = computeBookingFinancials(
      {
        currency: 'USD',
        lines: [{ label: 'x', unitPrice: usd(1000), quantity: 1 }],
        taxes: [usd(50)],
        hasReferrer: false,
      },
      { ...DEFAULT_COMMISSION_CONFIG, commissionBase: 'customer_total' },
    );
    expect(fin.commissionBaseAmount).toEqual(usd(1050));
    expect(fin.platformCommission).toEqual(usd(105));
  });

  it('tỷ lệ được snapshot vào kết quả để lưu theo booking', () => {
    const fin = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'x', unitPrice: usd(100), quantity: 1 }],
    });
    expect(fin.commissionRateBps).toBe(1000);
    expect(fin.referralShareBps).toBe(3000);
    expect(fin.commissionBase).toBe('subtotal_after_discount');
  });
});

describe('Làm tròn với số lẻ', () => {
  it('đơn 333,33 USD: hoa hồng 33,33 và merchant 300,00 — tổng vẫn khớp', () => {
    const fin = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'x', unitPrice: usd(333.33), quantity: 1 }],
      hasReferrer: true,
    });
    expect(fin.platformCommission.amount).toBe(3333); // 33.333 fils → 3333
    expect(fin.merchantRevenue.amount).toBe(33333 - 3333);
    expect(fin.merchantRevenue.amount + fin.platformCommission.amount).toBe(fin.customerTotal.amount);
    expect(fin.referralReward.amount + fin.platformNetRevenue.amount).toBe(fin.platformCommission.amount);
  });

  it('đơn rất nhỏ 0,01 USD không làm âm tiền merchant', () => {
    const fin = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'x', unitPrice: money(1, 'USD'), quantity: 1 }],
      hasReferrer: true,
    });
    expect(fin.platformCommission.amount).toBe(0);
    expect(fin.merchantRevenue.amount).toBe(1);
    expect(fin.referralReward.amount).toBe(0);
  });
});

describe('Giảm giá không được lớn hơn tiền hàng', () => {
  it('báo lỗi', () => {
    expect(() =>
      computeBookingFinancials({
        currency: 'USD',
        lines: [{ label: 'x', unitPrice: usd(100), quantity: 1 }],
        discounts: [usd(200)],
      }),
    ).toThrow(/giảm giá lớn hơn/i);
  });
});

describe('Hoàn tiền — bút toán đảo', () => {
  const fin = computeBookingFinancials({
    currency: 'USD',
    lines: [{ label: 'x', unitPrice: usd(1000), quantity: 1 }],
    hasReferrer: true,
  });

  it('hoàn toàn bộ: thu hồi đúng bằng số đã ghi nhận', () => {
    const adj = computeRefundAdjustment(fin, usd(1000));
    expect(adj.commissionReversal).toEqual(usd(-100));
    expect(adj.merchantRevenueReversal).toEqual(usd(-900));
    expect(adj.referralRewardReversal).toEqual(usd(-30));
    expect(adj.platformNetRevenueReversal).toEqual(usd(-70));
  });

  it('sau khi hoàn toàn bộ, mọi số dư về 0', () => {
    const adj = computeRefundAdjustment(fin, usd(1000));
    expect(fin.platformCommission.amount + adj.commissionReversal.amount).toBe(0);
    expect(fin.merchantRevenue.amount + adj.merchantRevenueReversal.amount).toBe(0);
    expect(fin.referralReward.amount + adj.referralRewardReversal.amount).toBe(0);
  });

  it('hoàn 50%: thu hồi đúng một nửa', () => {
    const adj = computeRefundAdjustment(fin, usd(500));
    expect(adj.commissionReversal).toEqual(usd(-50));
    expect(adj.merchantRevenueReversal).toEqual(usd(-450));
    expect(adj.referralRewardReversal).toEqual(usd(-15));
    expect(adj.platformNetRevenueReversal).toEqual(usd(-35));
  });

  it('không có referrer thì không thu hồi thưởng', () => {
    const noRef = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'x', unitPrice: usd(1000), quantity: 1 }],
      hasReferrer: false,
    });
    const adj = computeRefundAdjustment(noRef, usd(1000));
    expect(adj.referralRewardReversal.amount).toBe(0);
  });

  it('không cho hoàn quá số khách đã trả', () => {
    expect(() => computeRefundAdjustment(fin, usd(1001))).toThrow(/hoàn nhiều hơn/);
  });

  it('không cho hoàn số âm', () => {
    expect(() => computeRefundAdjustment(fin, money(-1, 'USD'))).toThrow(/không âm/);
  });
});

describe('VND — tiền không có đơn vị lẻ', () => {
  it('đơn 25.000.000đ: hoa hồng 2.500.000, merchant 22.500.000, thưởng 750.000', () => {
    const fin = computeBookingFinancials({
      currency: 'VND',
      lines: [{ label: 'Tour', unitPrice: fromMajorUnits(25_000_000, 'VND'), quantity: 1 }],
      hasReferrer: true,
    });
    expect(fin.platformCommission.amount).toBe(2_500_000);
    expect(fin.merchantRevenue.amount).toBe(22_500_000);
    expect(fin.referralReward.amount).toBe(750_000);
    expect(fin.platformNetRevenue.amount).toBe(1_750_000);
  });
});
