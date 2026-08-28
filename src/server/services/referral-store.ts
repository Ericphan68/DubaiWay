/**
 * Ví và thưởng giới thiệu.
 *
 * MỘT TẦNG: mỗi người có tối đa một người giới thiệu trực tiếp, và khi tính thưởng
 * hệ thống chỉ tra đúng bản ghi đó. Không có hàm nào đi ngược lên chuỗi giới thiệu.
 *
 * Bản trong bộ nhớ dùng khi chưa có Supabase (xem chú thích globalThis ở booking-store).
 */
import { randomUUID } from 'node:crypto';
import type { CurrencyCode, Money } from '@/core/money';
import { fromMinorUnits } from '@/core/money';
import { generateReferralCode, type ReferralRewardStatus, assertRewardTransition } from '@/core/referral';

export interface ReferralReward {
  readonly id: string;
  readonly bookingReference: string;
  readonly referrerUserId: string;
  readonly referredUserId: string;
  readonly commissionMinor: number;
  readonly shareBps: number;
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
  status: ReferralRewardStatus;
  readonly createdAt: string;
  availableAt: string | null;
}

export interface WithdrawalRequest {
  readonly id: string;
  readonly userId: string;
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
  status: 'requested' | 'under_review' | 'approved' | 'paid' | 'rejected';
  readonly createdAt: string;
  readonly method: string;
}

interface ReferralState {
  codeByUser: Map<string, string>;
  userByCode: Map<string, string>;
  /** referredUserId → referrerUserId. UNIQUE theo khoá Map = mỗi người một người giới thiệu. */
  attribution: Map<string, string>;
  rewards: ReferralReward[];
  withdrawals: WithdrawalRequest[];
}

const g = globalThis as unknown as { __dubaiwayReferral?: ReferralState };
const state: ReferralState = (g.__dubaiwayReferral ??= {
  codeByUser: new Map(),
  userByCode: new Map(),
  attribution: new Map(),
  rewards: [],
  withdrawals: [],
});

/** Lấy mã giới thiệu của một người, tạo mới nếu chưa có. */
export function getOrCreateReferralCode(userId: string): string {
  const existing = state.codeByUser.get(userId);
  if (existing) return existing;
  let code = generateReferralCode();
  while (state.userByCode.has(code)) code = generateReferralCode();
  state.codeByUser.set(userId, code);
  state.userByCode.set(code, userId);
  return code;
}

export function getUserByCode(code: string): string | null {
  return state.userByCode.get(code.trim().toUpperCase()) ?? null;
}

/**
 * Ghi nhận quan hệ giới thiệu. Trả false nếu không hợp lệ.
 * Chặn tự giới thiệu và chặn gán người giới thiệu thứ hai.
 */
export function recordAttribution(referredUserId: string, referrerUserId: string): boolean {
  if (referredUserId === referrerUserId) return false;          // tự giới thiệu
  if (state.attribution.has(referredUserId)) return false;      // đã có người giới thiệu
  state.attribution.set(referredUserId, referrerUserId);
  return true;
}

/** CHỈ trả người giới thiệu TRỰC TIẾP. Cố ý không đệ quy. */
export function getDirectReferrer(userId: string): string | null {
  return state.attribution.get(userId) ?? null;
}

export function recordReward(input: {
  bookingReference: string;
  referrerUserId: string;
  referredUserId: string;
  commissionMinor: number;
  shareBps: number;
  amountMinor: number;
  currency: CurrencyCode;
}): ReferralReward | null {
  if (input.referrerUserId === input.referredUserId) return null;
  // Mỗi đơn chỉ sinh đúng một khoản thưởng.
  if (state.rewards.some((r) => r.bookingReference === input.bookingReference)) return null;

  const reward: ReferralReward = {
    id: randomUUID(),
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
    availableAt: null,
  };
  state.rewards.push(reward);
  return reward;
}

export function advanceReward(rewardId: string, to: ReferralRewardStatus): ReferralReward | null {
  const r = state.rewards.find((x) => x.id === rewardId);
  if (!r) return null;
  assertRewardTransition(r.status, to);
  r.status = to;
  if (to === 'available') r.availableAt = new Date().toISOString();
  return r;
}

export function listRewards(userId: string): ReferralReward[] {
  return state.rewards
    .filter((r) => r.referrerUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countReferred(userId: string): number {
  let n = 0;
  for (const referrer of state.attribution.values()) if (referrer === userId) n += 1;
  return n;
}

export interface WalletSummary {
  readonly available: Money;
  readonly pending: Money;
  readonly withdrawn: Money;
  readonly lifetime: Money;
}

export function walletSummary(userId: string, currency: CurrencyCode = 'AED'): WalletSummary {
  const mine = listRewards(userId);
  const sum = (pred: (r: ReferralReward) => boolean) =>
    mine.filter(pred).reduce((s, r) => s + r.amountMinor, 0);

  return {
    available: fromMinorUnits(sum((r) => r.status === 'available'), currency),
    pending: fromMinorUnits(sum((r) => r.status === 'pending' || r.status === 'held'), currency),
    withdrawn: fromMinorUnits(sum((r) => r.status === 'paid'), currency),
    lifetime: fromMinorUnits(
      sum((r) => r.status !== 'cancelled' && r.status !== 'reversed'),
      currency,
    ),
  };
}

export class WithdrawalError extends Error {
  constructor(message: string) { super(message); this.name = 'WithdrawalError'; }
}

/** Số tiền rút tối thiểu — khớp platform_settings.withdrawal.min_amount_minor */
export const MIN_WITHDRAWAL_MINOR = 10_000; // 100,00 AED

export function requestWithdrawal(
  userId: string,
  amountMinor: number,
  currency: CurrencyCode = 'AED',
  method = 'bank_transfer',
): WithdrawalRequest {
  const available = walletSummary(userId, currency).available.amount;
  if (amountMinor <= 0) throw new WithdrawalError('Số tiền rút phải lớn hơn 0');
  if (amountMinor < MIN_WITHDRAWAL_MINOR) {
    throw new WithdrawalError(`Số tiền rút tối thiểu là ${MIN_WITHDRAWAL_MINOR / 100} ${currency}`);
  }
  if (amountMinor > available) {
    throw new WithdrawalError('Số dư khả dụng không đủ');
  }

  // Đánh dấu các khoản thưởng tương ứng là đang chờ rút, để không rút hai lần cùng số tiền.
  let remaining = amountMinor;
  for (const r of listRewards(userId)) {
    if (remaining <= 0) break;
    if (r.status !== 'available') continue;
    if (r.amountMinor <= remaining) {
      assertRewardTransition(r.status, 'withdrawal_requested');
      r.status = 'withdrawal_requested';
      remaining -= r.amountMinor;
    }
  }

  const req: WithdrawalRequest = {
    id: randomUUID(),
    userId,
    amountMinor,
    currency,
    status: 'requested',
    createdAt: new Date().toISOString(),
    method,
  };
  state.withdrawals.push(req);
  return req;
}

export function listWithdrawals(userId: string): WithdrawalRequest[] {
  return state.withdrawals
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllWithdrawals(): WithdrawalRequest[] {
  return [...state.withdrawals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllRewards(): ReferralReward[] {
  return [...state.rewards].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Chỉ dùng trong test. */
export function __resetReferral(): void {
  state.codeByUser.clear();
  state.userByCode.clear();
  state.attribution.clear();
  state.rewards.length = 0;
  state.withdrawals.length = 0;
}
