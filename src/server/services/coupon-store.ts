/**
 * Mã khuyến mãi.
 *
 * Giảm giá LUÔN được tính lại ở máy chủ từ mã khách nhập — không bao giờ nhận
 * số tiền giảm gửi lên từ trình duyệt. Nếu tin, ai cũng tự giảm giá 100%.
 */
import { randomUUID } from 'node:crypto';
import { type Money, applyRateBps, fromMinorUnits, money } from '@/core/money';

export type CouponKind = 'percent' | 'fixed';
export type CouponFunder = 'platform' | 'merchant';

export interface Coupon {
  readonly id: string;
  readonly code: string;
  readonly kind: CouponKind;
  /** Với loại percent: 1000 = 10%. */
  readonly percentBps: number | null;
  /** Với loại fixed: số tiền giảm, đơn vị nhỏ nhất. */
  readonly amountMinor: number | null;
  readonly currency: 'AED';
  readonly minOrderMinor: number;
  readonly maxDiscountMinor: number | null;
  /** Ai chịu chi phí giảm giá — ảnh hưởng cách chia tiền với đối tác. */
  readonly fundedBy: CouponFunder;
  readonly usageLimitTotal: number | null;
  readonly usageLimitPerUser: number;
  usedCount: number;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly categorySlug: string | null;
  readonly merchantId: string | null;
  isActive: boolean;
  readonly createdAt: string;
}

export interface CouponRedemption {
  readonly id: string;
  readonly couponId: string;
  readonly code: string;
  readonly userId: string;
  readonly bookingReference: string;
  readonly discountMinor: number;
  readonly createdAt: string;
}

interface CouponState {
  coupons: Map<string, Coupon>;      // key: mã viết hoa
  redemptions: CouponRedemption[];
  seeded: boolean;
}

const g = globalThis as unknown as { __dubaiwayCoupons?: CouponState };
const state: CouponState = (g.__dubaiwayCoupons ??= {
  coupons: new Map(), redemptions: [], seeded: false,
});

function seed(): void {
  if (state.seeded) return;
  state.seeded = true;
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 86_400_000).toISOString();
  const ago10 = new Date(now.getTime() - 10 * 86_400_000).toISOString();

  const base = { currency: 'AED' as const, isActive: true, usedCount: 0, createdAt: now.toISOString() };

  state.coupons.set('DUBAI10', {
    id: randomUUID(), code: 'DUBAI10', kind: 'percent',
    percentBps: 1000, amountMinor: null,
    minOrderMinor: 20000, maxDiscountMinor: 10000,
    fundedBy: 'platform', usageLimitTotal: 500, usageLimitPerUser: 1,
    startsAt: ago10, endsAt: in90, categorySlug: null, merchantId: null, ...base,
  });
  state.coupons.set('WELCOME50', {
    id: randomUUID(), code: 'WELCOME50', kind: 'fixed',
    percentBps: null, amountMinor: 5000,
    minOrderMinor: 30000, maxDiscountMinor: null,
    fundedBy: 'platform', usageLimitTotal: 1000, usageLimitPerUser: 1,
    startsAt: ago10, endsAt: in90, categorySlug: null, merchantId: null, ...base,
  });
  state.coupons.set('SAFARI15', {
    id: randomUUID(), code: 'SAFARI15', kind: 'percent',
    percentBps: 1500, amountMinor: null,
    minOrderMinor: 0, maxDiscountMinor: 15000,
    fundedBy: 'merchant', usageLimitTotal: 200, usageLimitPerUser: 2,
    startsAt: ago10, endsAt: in90, categorySlug: 'desert-safari', merchantId: null, ...base,
  });
}

export class CouponError extends Error {
  constructor(message: string) { super(message); this.name = 'CouponError'; }
}

export interface CouponContext {
  readonly userId: string | null;
  readonly subtotal: Money;
  readonly categorySlug: string;
  readonly merchantId: string;
  readonly now?: Date;
}

export interface AppliedCoupon {
  readonly coupon: Coupon;
  readonly discount: Money;
}

/**
 * Kiểm tra mã và tính số tiền giảm. Ném lỗi có thông điệp rõ ràng để khách biết
 * mã sai ở đâu, thay vì chỉ báo "mã không hợp lệ".
 */
export function applyCoupon(code: string, ctx: CouponContext): AppliedCoupon {
  seed();
  const key = code.trim().toUpperCase();
  const c = state.coupons.get(key);
  if (!c) throw new CouponError('Mã khuyến mãi không tồn tại');
  if (!c.isActive) throw new CouponError('Mã này đã ngừng áp dụng');

  const now = ctx.now ?? new Date();
  if (c.startsAt && new Date(c.startsAt) > now) throw new CouponError('Mã này chưa tới ngày áp dụng');
  if (c.endsAt && new Date(c.endsAt) < now) throw new CouponError('Mã này đã hết hạn');

  if (c.usageLimitTotal !== null && c.usedCount >= c.usageLimitTotal) {
    throw new CouponError('Mã này đã hết lượt sử dụng');
  }
  if (ctx.userId) {
    const mine = state.redemptions.filter((r) => r.couponId === c.id && r.userId === ctx.userId).length;
    if (mine >= c.usageLimitPerUser) {
      throw new CouponError(`Bạn đã dùng mã này ${mine} lần, vượt giới hạn cho phép`);
    }
  }

  if (c.categorySlug && c.categorySlug !== ctx.categorySlug) {
    throw new CouponError('Mã này không áp dụng cho nhóm dịch vụ bạn đang đặt');
  }
  if (c.merchantId && c.merchantId !== ctx.merchantId) {
    throw new CouponError('Mã này không áp dụng cho đối tác này');
  }
  if (ctx.subtotal.amount < c.minOrderMinor) {
    throw new CouponError(
      `Mã này áp dụng cho đơn từ ${(c.minOrderMinor / 100).toLocaleString('vi-VN')} AED trở lên`,
    );
  }

  let discount: Money;
  if (c.kind === 'percent') {
    discount = applyRateBps(ctx.subtotal, c.percentBps ?? 0);
    if (c.maxDiscountMinor !== null && discount.amount > c.maxDiscountMinor) {
      discount = fromMinorUnits(c.maxDiscountMinor, 'AED');
    }
  } else {
    discount = fromMinorUnits(c.amountMinor ?? 0, 'AED');
  }

  // Không bao giờ giảm quá giá trị đơn hàng.
  if (discount.amount > ctx.subtotal.amount) discount = money(ctx.subtotal.amount, 'AED');

  return { coupon: c, discount };
}

/** Ghi nhận đã dùng mã. Gọi sau khi đơn hàng tạo thành công. */
export function redeemCoupon(input: {
  couponId: string; code: string; userId: string | null;
  bookingReference: string; discountMinor: number;
}): CouponRedemption {
  seed();
  const c = [...state.coupons.values()].find((x) => x.id === input.couponId);
  if (c) c.usedCount += 1;

  const r: CouponRedemption = {
    id: randomUUID(),
    couponId: input.couponId,
    code: input.code,
    userId: input.userId ?? 'guest',
    bookingReference: input.bookingReference,
    discountMinor: input.discountMinor,
    createdAt: new Date().toISOString(),
  };
  state.redemptions.push(r);
  return r;
}

export function listCoupons(): Coupon[] {
  seed();
  return [...state.coupons.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function listRedemptions(): CouponRedemption[] {
  seed();
  return [...state.redemptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function upsertCoupon(input: {
  code: string; kind: CouponKind; percent?: number; amountMajor?: number;
  minOrderMajor: number; maxDiscountMajor?: number; fundedBy: CouponFunder;
  usageLimitTotal?: number; usageLimitPerUser: number;
  startsAt?: string; endsAt?: string; categorySlug?: string; isActive: boolean;
}): Coupon {
  seed();
  const key = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(key)) {
    throw new CouponError('Mã chỉ gồm chữ in hoa và số, dài 3–20 ký tự');
  }
  if (input.kind === 'percent' && (input.percent === undefined || input.percent <= 0 || input.percent > 100)) {
    throw new CouponError('Phần trăm giảm phải trong khoảng 1–100');
  }
  if (input.kind === 'fixed' && (input.amountMajor === undefined || input.amountMajor <= 0)) {
    throw new CouponError('Số tiền giảm phải lớn hơn 0');
  }

  const existing = state.coupons.get(key);
  const c: Coupon = {
    id: existing?.id ?? randomUUID(),
    code: key,
    kind: input.kind,
    percentBps: input.kind === 'percent' ? Math.round((input.percent ?? 0) * 100) : null,
    amountMinor: input.kind === 'fixed' ? Math.round((input.amountMajor ?? 0) * 100) : null,
    currency: 'AED',
    minOrderMinor: Math.round(input.minOrderMajor * 100),
    maxDiscountMinor: input.maxDiscountMajor ? Math.round(input.maxDiscountMajor * 100) : null,
    fundedBy: input.fundedBy,
    usageLimitTotal: input.usageLimitTotal ?? null,
    usageLimitPerUser: input.usageLimitPerUser,
    usedCount: existing?.usedCount ?? 0,
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
    categorySlug: input.categorySlug || null,
    merchantId: null,
    isActive: input.isActive,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  state.coupons.set(key, c);
  return c;
}

export function setCouponActive(code: string, isActive: boolean): Coupon {
  seed();
  const c = state.coupons.get(code.trim().toUpperCase());
  if (!c) throw new CouponError('Không tìm thấy mã');
  c.isActive = isActive;
  return c;
}

/** Chỉ dùng trong test. */
export function __resetCoupons(): void {
  state.coupons.clear();
  state.redemptions.length = 0;
  state.seeded = false;
}
