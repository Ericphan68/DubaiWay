import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import {
  CouponError, __resetCoupons, applyCoupon, listCoupons, redeemCoupon, setCouponActive, upsertCoupon,
} from '../coupon-store';

const aed = (v: number) => fromMajorUnits(v, 'AED');
const USER = 'user-1';

const ctx = (over: Partial<Parameters<typeof applyCoupon>[1]> = {}) => ({
  userId: USER,
  subtotal: aed(1000),
  categorySlug: 'desert-safari',
  merchantId: 'merchant-1',
  ...over,
});

beforeEach(() => { __resetCoupons(); });

describe('Mã giảm theo phần trăm', () => {
  it('DUBAI10 giảm 10% nhưng tối đa 100 AED', () => {
    const r = applyCoupon('DUBAI10', ctx({ subtotal: aed(500) }));
    expect(r.discount).toEqual(aed(50));
  });

  it('chạm trần giảm tối đa', () => {
    const r = applyCoupon('DUBAI10', ctx({ subtotal: aed(5000) }));
    expect(r.discount).toEqual(aed(100)); // 10% của 5000 = 500 nhưng trần là 100
  });

  it('không phân biệt hoa thường khi nhập mã', () => {
    expect(applyCoupon('dubai10', ctx()).discount).toEqual(aed(100));
    expect(applyCoupon('  DuBaI10 ', ctx()).discount).toEqual(aed(100));
  });
});

describe('Mã giảm số tiền cố định', () => {
  it('WELCOME50 giảm đúng 50 AED', () => {
    expect(applyCoupon('WELCOME50', ctx()).discount).toEqual(aed(50));
  });

  it('không giảm quá giá trị đơn hàng', () => {
    upsertCoupon({
      code: 'BIG', kind: 'fixed', amountMajor: 5000, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitPerUser: 5, isActive: true,
    });
    const r = applyCoupon('BIG', ctx({ subtotal: aed(300) }));
    expect(r.discount).toEqual(aed(300));
  });
});

describe('Điều kiện áp dụng', () => {
  it('mã không tồn tại', () => {
    expect(() => applyCoupon('KHONGCO', ctx())).toThrow(/không tồn tại/);
  });

  it('đơn dưới mức tối thiểu bị từ chối, nêu rõ mức cần đạt', () => {
    expect(() => applyCoupon('WELCOME50', ctx({ subtotal: aed(100) })))
      .toThrow(/từ 300 AED trở lên/);
  });

  it('mã theo danh mục không dùng cho danh mục khác', () => {
    expect(() => applyCoupon('SAFARI15', ctx({ categorySlug: 'yacht-cruise' })))
      .toThrow(/không áp dụng cho nhóm dịch vụ/);
  });

  it('mã theo danh mục dùng đúng danh mục thì được', () => {
    expect(applyCoupon('SAFARI15', ctx({ categorySlug: 'desert-safari' })).discount)
      .toEqual(aed(150));
  });

  it('mã đã tắt thì không dùng được', () => {
    setCouponActive('DUBAI10', false);
    expect(() => applyCoupon('DUBAI10', ctx())).toThrow(/đã ngừng áp dụng/);
  });

  it('mã hết hạn bị từ chối', () => {
    upsertCoupon({
      code: 'HETHAN', kind: 'percent', percent: 10, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitPerUser: 1, isActive: true,
      endsAt: new Date(Date.now() - 86_400_000).toISOString(),
    });
    expect(() => applyCoupon('HETHAN', ctx())).toThrow(/đã hết hạn/);
  });

  it('mã chưa tới ngày bị từ chối', () => {
    upsertCoupon({
      code: 'CHUATOI', kind: 'percent', percent: 10, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitPerUser: 1, isActive: true,
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(() => applyCoupon('CHUATOI', ctx())).toThrow(/chưa tới ngày/);
  });
});

describe('Giới hạn lượt dùng', () => {
  it('mỗi khách chỉ dùng được số lần cho phép', () => {
    const r = applyCoupon('WELCOME50', ctx());
    redeemCoupon({
      couponId: r.coupon.id, code: r.coupon.code, userId: USER,
      bookingReference: 'DW-AAA111', discountMinor: r.discount.amount,
    });
    expect(() => applyCoupon('WELCOME50', ctx())).toThrow(/vượt giới hạn/);
  });

  it('khách khác vẫn dùng được', () => {
    const r = applyCoupon('WELCOME50', ctx());
    redeemCoupon({
      couponId: r.coupon.id, code: r.coupon.code, userId: USER,
      bookingReference: 'DW-AAA111', discountMinor: r.discount.amount,
    });
    expect(() => applyCoupon('WELCOME50', ctx({ userId: 'user-2' }))).not.toThrow();
  });

  it('hết tổng lượt thì không ai dùng được nữa', () => {
    upsertCoupon({
      code: 'ITLUOT', kind: 'fixed', amountMajor: 10, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitTotal: 1, usageLimitPerUser: 5, isActive: true,
    });
    const r = applyCoupon('ITLUOT', ctx());
    redeemCoupon({
      couponId: r.coupon.id, code: 'ITLUOT', userId: 'ai-do',
      bookingReference: 'DW-BBB222', discountMinor: r.discount.amount,
    });
    expect(() => applyCoupon('ITLUOT', ctx())).toThrow(/hết lượt sử dụng/);
  });
});

describe('Admin quản lý mã', () => {
  it('tạo mã mới', () => {
    upsertCoupon({
      code: 'MOI20', kind: 'percent', percent: 20, minOrderMajor: 100,
      fundedBy: 'merchant', usageLimitPerUser: 1, isActive: true,
    });
    expect(listCoupons().some((c) => c.code === 'MOI20')).toBe(true);
  });

  it('mã sai định dạng bị từ chối', () => {
    expect(() => upsertCoupon({
      code: 'ab', kind: 'percent', percent: 10, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitPerUser: 1, isActive: true,
    })).toThrow(/chữ in hoa và số/);
  });

  it('phần trăm ngoài 1–100 bị từ chối', () => {
    expect(() => upsertCoupon({
      code: 'QUA', kind: 'percent', percent: 150, minOrderMajor: 0,
      fundedBy: 'platform', usageLimitPerUser: 1, isActive: true,
    })).toThrow(/1–100/);
  });

  it('sửa mã giữ nguyên số lượt đã dùng', () => {
    const r = applyCoupon('DUBAI10', ctx());
    redeemCoupon({ couponId: r.coupon.id, code: 'DUBAI10', userId: USER, bookingReference: 'DW-X', discountMinor: 100 });
    const sau = upsertCoupon({
      code: 'DUBAI10', kind: 'percent', percent: 15, minOrderMajor: 200,
      fundedBy: 'platform', usageLimitPerUser: 1, isActive: true,
    });
    expect(sau.usedCount).toBe(1);
    expect(sau.percentBps).toBe(1500);
  });

  it('ghi nhận ai tài trợ giảm giá — nền tảng hay đối tác', () => {
    expect(applyCoupon('DUBAI10', ctx()).coupon.fundedBy).toBe('platform');
    expect(applyCoupon('SAFARI15', ctx()).coupon.fundedBy).toBe('merchant');
  });

  it('mã không tồn tại thì không tắt được', () => {
    expect(() => setCouponActive('KHONGCO', false)).toThrow(CouponError);
  });
});
