/**
 * Máy trạng thái cho các luồng nghiệp vụ chính.
 * Mọi thay đổi trạng thái phải đi qua đây để không có đường tắt trong code.
 */

/** Hồ sơ Merchant (KYB/KYC). */
export type MerchantStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'suspended';

const MERCHANT_TRANSITIONS: Record<MerchantStatus, readonly MerchantStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['changes_requested', 'approved', 'rejected'],
  changes_requested: ['submitted'],
  approved: ['suspended'],
  rejected: ['draft'],
  suspended: ['approved', 'rejected'],
};

/** Dịch vụ do Merchant đăng bán. */
export type ServiceStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'active'
  | 'inactive'
  | 'suspended';

const SERVICE_TRANSITIONS: Record<ServiceStatus, readonly ServiceStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['changes_requested', 'approved'],
  changes_requested: ['submitted'],
  approved: ['active', 'inactive'],
  active: ['inactive', 'suspended', 'submitted'],
  inactive: ['active', 'suspended', 'submitted'],
  suspended: ['inactive'],
};

/** Đơn đặt dịch vụ. */
export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  draft: ['pending_payment', 'expired'],
  pending_payment: ['paid', 'cancelled', 'expired'],
  paid: ['confirmed', 'cancelled', 'refunded'],
  confirmed: ['completed', 'cancelled', 'refunded'],
  completed: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
  expired: [],
};

/** Voucher cấp cho khách sau khi thanh toán. */
export type VoucherStatus =
  | 'issued'
  | 'confirmed'
  | 'redeemed'
  | 'expired'
  | 'cancelled'
  | 'refunded';

const VOUCHER_TRANSITIONS: Record<VoucherStatus, readonly VoucherStatus[]> = {
  issued: ['confirmed', 'cancelled', 'expired'],
  confirmed: ['redeemed', 'cancelled', 'expired', 'refunded'],
  redeemed: ['refunded'],
  expired: [],
  cancelled: ['refunded'],
  refunded: [],
};

function makeGuard<S extends string>(
  name: string,
  table: Record<S, readonly S[]>,
): { can: (from: S, to: S) => boolean; assert: (from: S, to: S) => void } {
  return {
    can: (from, to) => table[from]?.includes(to) ?? false,
    assert: (from, to) => {
      if (!(table[from]?.includes(to) ?? false)) {
        throw new Error(`${name}: chuyển trạng thái không hợp lệ ${from} → ${to}`);
      }
    },
  };
}

export const merchantState = makeGuard<MerchantStatus>('Merchant', MERCHANT_TRANSITIONS);
export const serviceState = makeGuard<ServiceStatus>('Service', SERVICE_TRANSITIONS);
export const bookingState = makeGuard<BookingStatus>('Booking', BOOKING_TRANSITIONS);
export const voucherState = makeGuard<VoucherStatus>('Voucher', VOUCHER_TRANSITIONS);

/** Merchant chỉ được công khai dịch vụ khi hồ sơ đã duyệt. */
export function canPublishService(
  merchantStatus: MerchantStatus,
  serviceStatus: ServiceStatus,
): boolean {
  return merchantStatus === 'approved' && serviceStatus === 'active';
}
