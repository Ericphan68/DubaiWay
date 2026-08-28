/**
 * Giới thiệu MỘT TẦNG.
 *
 * A giới thiệu B  → A nhận thưởng từ giao dịch hợp lệ của B.
 * B giới thiệu C  → B nhận thưởng từ C.
 * A KHÔNG nhận bất cứ thứ gì từ C.
 *
 * Nguyên tắc thực thi: mỗi user chỉ có TỐI ĐA MỘT bản ghi attribution (referrer trực tiếp),
 * và khi tính thưởng cho một booking, hệ thống chỉ tra đúng bản ghi đó — không đi ngược lên
 * cây giới thiệu. Không có hàm nào duyệt đệ quy chuỗi giới thiệu. Đây là chặn ở mức thiết kế,
 * cộng thêm ràng buộc UNIQUE ở database.
 */

export type ReferralRewardStatus =
  | 'pending' // booking đã tạo, chưa đủ điều kiện
  | 'held' // dịch vụ đã dùng, đang trong thời hạn khiếu nại
  | 'available' // đã đủ điều kiện, rút được
  | 'withdrawal_requested'
  | 'paid'
  | 'cancelled' // booking huỷ trước khi dùng
  | 'reversed' // đã hoàn tiền sau khi thưởng ghi nhận
  | 'fraud_review'; // chờ Admin kiểm tra

const REWARD_TRANSITIONS: Record<ReferralRewardStatus, readonly ReferralRewardStatus[]> = {
  pending: ['held', 'cancelled', 'fraud_review'],
  held: ['available', 'reversed', 'cancelled', 'fraud_review'],
  available: ['withdrawal_requested', 'reversed', 'fraud_review'],
  withdrawal_requested: ['paid', 'available', 'fraud_review'],
  paid: ['reversed'],
  cancelled: [],
  reversed: [],
  fraud_review: ['pending', 'held', 'available', 'cancelled', 'reversed'],
};

export function canTransitionReward(
  from: ReferralRewardStatus,
  to: ReferralRewardStatus,
): boolean {
  return REWARD_TRANSITIONS[from].includes(to);
}

export function assertRewardTransition(
  from: ReferralRewardStatus,
  to: ReferralRewardStatus,
): void {
  if (!canTransitionReward(from, to)) {
    throw new Error(`Chuyển trạng thái thưởng không hợp lệ: ${from} → ${to}`);
  }
}

/** Điều kiện để thưởng chuyển sang `available`. Tất cả phải đúng. */
export interface RewardEligibility {
  readonly isPaid: boolean;
  readonly isServiceCompleted: boolean;
  readonly isDisputeWindowClosed: boolean;
  readonly isRefunded: boolean;
  readonly isFlaggedFraud: boolean;
}

export function isRewardEligible(e: RewardEligibility): boolean {
  return e.isPaid && e.isServiceCompleted && e.isDisputeWindowClosed && !e.isRefunded && !e.isFlaggedFraud;
}

/** Tín hiệu nghi vấn tự giới thiệu / gian lận. */
export interface FraudSignals {
  readonly sameUser: boolean;
  readonly sameEmail: boolean;
  readonly samePhone: boolean;
  readonly sameDeviceFingerprint: boolean;
  readonly sameIpAddress: boolean;
  readonly samePaymentFingerprint: boolean;
}

export type AttributionDecision =
  | { readonly outcome: 'accept' }
  | { readonly outcome: 'reject'; readonly reason: string }
  | { readonly outcome: 'manual_review'; readonly reasons: readonly string[] };

/**
 * Quyết định có ghi nhận quan hệ giới thiệu hay không.
 *
 * - Tự giới thiệu (cùng tài khoản) → từ chối thẳng, đây là bằng chứng chắc chắn.
 * - Các tín hiệu còn lại → KHÔNG tự động kết luận gian lận. Một tín hiệu đơn lẻ có thể là
 *   người thật (gia đình chung IP, chung thiết bị). Từ 2 tín hiệu trở lên thì chuyển
 *   Admin xem xét thủ công.
 */
export function decideAttribution(signals: FraudSignals): AttributionDecision {
  if (signals.sameUser) {
    return { outcome: 'reject', reason: 'Tự giới thiệu: người giới thiệu và người được giới thiệu là cùng một tài khoản' };
  }

  const reasons: string[] = [];
  if (signals.sameEmail) reasons.push('Trùng email');
  if (signals.samePhone) reasons.push('Trùng số điện thoại');
  if (signals.samePaymentFingerprint) reasons.push('Trùng phương thức thanh toán');
  if (signals.sameDeviceFingerprint) reasons.push('Trùng thiết bị');
  if (signals.sameIpAddress) reasons.push('Trùng địa chỉ IP');

  // Trùng email hoặc số điện thoại gần như chắc chắn là cùng một người.
  if (signals.sameEmail || signals.samePhone) {
    return { outcome: 'manual_review', reasons };
  }
  if (reasons.length >= 2) {
    return { outcome: 'manual_review', reasons };
  }
  return { outcome: 'accept' };
}

/** Sinh mã giới thiệu: dễ đọc, tránh ký tự dễ nhầm (0/O, 1/I/L). */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateReferralCode(random: () => number = Math.random, length = 8): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return out;
}
