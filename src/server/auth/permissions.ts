/**
 * Kiểm tra quyền phía server.
 *
 * Đây là bản sao của ma trận quyền trong database (bảng role_permissions).
 * Có hai bản là cố ý: database là lớp chặn cuối cùng không vượt qua được,
 * còn bản này để giao diện biết nên hiện gì mà không phải hỏi database mỗi lần.
 * Kiểm thử đối chiếu hai bản với nhau để chúng không lệch nhau.
 */
import type { SessionUser, UserRole } from './types';

export type Permission =
  | 'merchant.review'
  | 'service.review'
  | 'category.manage'
  | 'booking.read_all'
  | 'booking.manage'
  | 'finance.manage'
  | 'refund.manage'
  | 'dispute.manage'
  | 'review.moderate'
  | 'referral.manage'
  | 'content.manage'
  | 'marketing.manage'
  | 'support.manage'
  | 'audit.read'
  | 'settings.manage'
  | 'user.manage'
  | 'role.manage';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: [
    'merchant.review', 'service.review', 'category.manage', 'booking.read_all',
    'booking.manage', 'finance.manage', 'refund.manage', 'dispute.manage',
    'review.moderate', 'referral.manage', 'content.manage', 'marketing.manage',
    'support.manage', 'audit.read', 'settings.manage', 'user.manage', 'role.manage',
  ],
  merchant_reviewer: ['merchant.review', 'audit.read'],
  service_reviewer: ['service.review', 'category.manage'],
  customer_support: ['booking.read_all', 'support.manage'],
  finance: ['finance.manage', 'refund.manage', 'booking.read_all', 'referral.manage', 'audit.read'],
  dispute_officer: ['dispute.manage', 'booking.read_all', 'review.moderate', 'refund.manage'],
  content_manager: ['content.manage', 'category.manage'],
  marketing: ['marketing.manage'],
  // Vai trò phạm vi merchant không có quyền cấp nền tảng.
  merchant_owner: [],
  merchant_staff: [],
  merchant_scanner: [],
  customer: [],
};

export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  return user.roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function isPlatformStaff(user: SessionUser | null): boolean {
  if (!user) return false;
  const staffRoles: UserRole[] = [
    'super_admin', 'merchant_reviewer', 'service_reviewer', 'customer_support',
    'finance', 'dispute_officer', 'content_manager', 'marketing',
  ];
  return user.roles.some((r) => staffRoles.includes(r));
}

export function isMerchantMember(user: SessionUser | null): boolean {
  if (!user) return false;
  return (
    user.merchantId !== null &&
    user.roles.some((r) => r === 'merchant_owner' || r === 'merchant_staff' || r === 'merchant_scanner')
  );
}

/** Ném lỗi nếu thiếu quyền — dùng ở đầu mọi server action nhạy cảm. */
export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Không có quyền: ${permission}`);
    this.name = 'ForbiddenError';
  }
}

export function requirePermission(user: SessionUser | null, permission: Permission): void {
  if (!hasPermission(user, permission)) throw new ForbiddenError(permission);
}
