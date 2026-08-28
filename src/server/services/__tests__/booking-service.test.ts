import { describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import type { ServicePackageSummary } from '@/server/repositories/types';
import {
  QuoteError, buildPriceLines, computeCancellationRefund, createQuote, refundRateBps, validateGuests,
} from '../booking-service';

const usd = (v: number) => fromMajorUnits(v, 'USD');

const safariStandard: ServicePackageSummary = {
  id: 'p1', code: 'standard', name: 'Tiêu chuẩn', description: null,
  priceAdult: usd(150), priceChild: usd(95), priceGroup: null, groupSize: null,
  taxRateBps: 500, minGuests: 1, maxGuests: 40,
};

const yachtCharter: ServicePackageSummary = {
  id: 'p5', code: 'charter2h', name: 'Thuê nguyên thuyền 2 giờ', description: null,
  priceAdult: usd(0), priceChild: null, priceGroup: usd(1450), groupSize: 12,
  taxRateBps: 500, minGuests: 2, maxGuests: 12,
};

describe('Báo giá theo đầu người', () => {
  it('2 người lớn safari = 300 USD tiền hàng, 15 USD thuế, khách trả 315', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 0, infants: 0 }, hasReferrer: false,
    });
    expect(q.financials.subtotal).toEqual(usd(300));
    expect(q.financials.taxTotal).toEqual(usd(15));
    expect(q.financials.customerTotal).toEqual(usd(315));
  });

  it('hoa hồng tính trên 300 (chưa gồm thuế) = 30 USD, merchant nhận 270', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 0, infants: 0 }, hasReferrer: false,
    });
    expect(q.financials.platformCommission).toEqual(usd(30));
    expect(q.financials.merchantRevenue).toEqual(usd(270));
  });

  it('có người giới thiệu: thưởng 9 USD, DubaiWay giữ 21 USD', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 0, infants: 0 }, hasReferrer: true,
    });
    expect(q.financials.referralReward).toEqual(usd(9));
    expect(q.financials.platformNetRevenue).toEqual(usd(21));
  });

  it('2 người lớn + 1 trẻ em = 300 + 95 = 395 USD', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 1, infants: 0 }, hasReferrer: false,
    });
    expect(q.financials.subtotal).toEqual(usd(395));
  });

  it('trẻ sơ sinh không tính tiền và không chiếm chỗ', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 0, infants: 2 }, hasReferrer: false,
    });
    expect(q.financials.subtotal).toEqual(usd(300));
  });

  it('giảm giá áp trước khi tính thuế và hoa hồng', () => {
    const q = createQuote({
      pkg: safariStandard, guests: { adults: 2, children: 0, infants: 0 },
      discount: usd(50), hasReferrer: true,
    });
    expect(q.financials.discountTotal).toEqual(usd(50));
    expect(q.financials.taxTotal).toEqual(usd(12.5));
    expect(q.financials.customerTotal).toEqual(usd(262.5));
    expect(q.financials.platformCommission).toEqual(usd(25));
    expect(q.financials.merchantRevenue).toEqual(usd(225));
    expect(q.financials.referralReward).toEqual(usd(7.5));
  });
});

describe('Báo giá theo nhóm (yacht, xe đưa đón)', () => {
  it('8 khách trong sức chứa 12 → tính 1 suất 1.450 USD, không nhân đầu người', () => {
    const q = createQuote({
      pkg: yachtCharter, guests: { adults: 8, children: 0, infants: 0 }, hasReferrer: false,
    });
    expect(q.financials.subtotal).toEqual(usd(1450));
  });

  it('14 khách vượt sức chứa 12 → tính 2 suất', () => {
    const pkg = { ...yachtCharter, maxGuests: 24 };
    const q = createQuote({
      pkg, guests: { adults: 14, children: 0, infants: 0 }, hasReferrer: false,
    });
    expect(q.financials.subtotal).toEqual(usd(2900));
  });

  it('hoa hồng trên đơn yacht 1.450 = 145 USD, merchant 1.305, thưởng 43,50', () => {
    const q = createQuote({
      pkg: yachtCharter, guests: { adults: 8, children: 0, infants: 0 }, hasReferrer: true,
    });
    expect(q.financials.platformCommission).toEqual(usd(145));
    expect(q.financials.merchantRevenue).toEqual(usd(1305));
    expect(q.financials.referralReward).toEqual(usd(43.5));
  });
});

describe('Kiểm tra số khách', () => {
  it('không cho đặt 0 khách', () => {
    expect(() => validateGuests(safariStandard, { adults: 0, children: 0, infants: 0 })).toThrow(QuoteError);
  });

  it('không cho vượt sức chứa tối đa', () => {
    expect(() => validateGuests(safariStandard, { adults: 41, children: 0, infants: 0 })).toThrow(/tối đa 40/);
  });

  it('không cho dưới số khách tối thiểu', () => {
    expect(() => validateGuests(yachtCharter, { adults: 1, children: 0, infants: 0 })).toThrow(/tối thiểu 2/);
  });

  it('không cho số khách âm', () => {
    expect(() => validateGuests(safariStandard, { adults: -1, children: 3, infants: 0 })).toThrow(/không được âm/);
  });

  it('gói không nhận trẻ em thì báo lỗi rõ ràng', () => {
    const noChild = { ...safariStandard, priceChild: null };
    expect(() => buildPriceLines(noChild, { adults: 1, children: 1, infants: 0 })).toThrow(/không nhận trẻ em/);
  });
});

describe('Giảm giá không hợp lệ', () => {
  it('giảm nhiều hơn giá trị đơn', () => {
    expect(() =>
      createQuote({
        pkg: safariStandard, guests: { adults: 1, children: 0, infants: 0 },
        discount: usd(500), hasReferrer: false,
      }),
    ).toThrow(/lớn hơn giá trị đơn hàng/);
  });

  it('giảm giá khác loại tiền', () => {
    expect(() =>
      createQuote({
        pkg: safariStandard, guests: { adults: 1, children: 0, infants: 0 },
        discount: fromMajorUnits(10, 'EUR'), hasReferrer: false,
      }),
    ).toThrow(/khác loại tiền/);
  });
});

describe('Chính sách huỷ theo bậc', () => {
  const tiers = [
    { hoursBefore: 24, refundBps: 10000 },
    { hoursBefore: 4, refundBps: 5000 },
  ];

  it('huỷ trước 48 giờ → hoàn 100%', () => { expect(refundRateBps(tiers, 48)).toBe(10000); });
  it('huỷ trước đúng 24 giờ → hoàn 100%', () => { expect(refundRateBps(tiers, 24)).toBe(10000); });
  it('huỷ trước 10 giờ → hoàn 50%', () => { expect(refundRateBps(tiers, 10)).toBe(5000); });
  it('huỷ trước 2 giờ → không hoàn', () => { expect(refundRateBps(tiers, 2)).toBe(0); });
  it('dịch vụ không cho huỷ → không hoàn ở mọi thời điểm', () => { expect(refundRateBps([], 100)).toBe(0); });

  it('số tiền hoàn tính đúng: 315 USD huỷ trước 10h → 157,50 USD', () => {
    const r = computeCancellationRefund(usd(315), tiers, 10);
    expect(r.rateBps).toBe(5000);
    expect(r.amount).toEqual(usd(157.5));
  });
});
