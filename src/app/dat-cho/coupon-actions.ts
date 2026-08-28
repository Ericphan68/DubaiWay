'use server';

import { getSessionUser } from '@/server/auth';
import { getLocale } from '@/server/locale';
import { getRepositories } from '@/server/repositories';
import { CouponError, applyCoupon } from '@/server/services/coupon-store';

export interface CouponCheckState {
  readonly error: string | null;
  readonly code: string | null;
  readonly discountLabel: string | null;
}

/**
 * Kiểm tra mã trước khi khách bấm thanh toán, để họ thấy ngay được giảm bao nhiêu.
 * Máy chủ vẫn tính lại lần nữa lúc tạo đơn — đây chỉ là bước hiển thị.
 */
export async function checkCouponAction(
  _prev: CouponCheckState,
  formData: FormData,
): Promise<CouponCheckState> {
  const code = String(formData.get('couponCode') ?? '').trim();
  if (!code) return { error: null, code: null, discountLabel: null };

  const slug = String(formData.get('slug') ?? '');
  const packageId = String(formData.get('packageId') ?? '');
  const adults = Number.parseInt(String(formData.get('adults') ?? '0'), 10) || 0;
  const children = Number.parseInt(String(formData.get('children') ?? '0'), 10) || 0;

  const locale = await getLocale();
  const service = await getRepositories().catalog.getServiceBySlug(slug, locale);
  const pkg = service?.packages.find((p) => p.id === packageId);
  if (!service || !pkg) {
    return { error: 'Không tìm thấy dịch vụ.', code: null, discountLabel: null };
  }

  const subtotalMinor = pkg.priceGroup && pkg.priceGroup.amount > 0
    ? pkg.priceGroup.amount * Math.max(1, Math.ceil((adults + children) / (pkg.groupSize ?? 1)))
    : pkg.priceAdult.amount * adults + (pkg.priceChild?.amount ?? 0) * children;

  const user = await getSessionUser();
  try {
    const applied = applyCoupon(code, {
      userId: user?.id ?? null,
      subtotal: { amount: subtotalMinor, currency: 'AED' },
      categorySlug: service.categorySlug,
      merchantId: service.merchant.id,
    });
    return {
      error: null,
      code: applied.coupon.code,
      discountLabel: `− ${(applied.discount.amount / 100).toLocaleString('vi-VN')} AED`,
    };
  } catch (err) {
    return {
      error: err instanceof CouponError ? err.message : 'Mã không dùng được.',
      code: null,
      discountLabel: null,
    };
  }
}
