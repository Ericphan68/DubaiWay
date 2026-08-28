import { beforeEach, describe, expect, it } from 'vitest';
import {
  MIN_WITHDRAWAL_MINOR, WithdrawalError, __resetReferral, advanceReward, countReferred,
  getDirectReferrer, getOrCreateReferralCode, getUserByCode, listRewards, recordAttribution,
  recordReward, requestWithdrawal, walletSummary,
} from '../referral-store';

const A = 'user-a', B = 'user-b', C = 'user-c';

beforeEach(() => { __resetReferral(); });

const reward = (ref: string, referrer: string, referred: string, amount: number) =>
  recordReward({
    bookingReference: ref, referrerUserId: referrer, referredUserId: referred,
    commissionMinor: amount * 10 / 3, shareBps: 3000, amountMinor: amount, currency: 'USD',
  });

describe('Mã giới thiệu', () => {
  it('mỗi người một mã, gọi lại vẫn ra mã cũ', () => {
    const c1 = getOrCreateReferralCode(A);
    expect(getOrCreateReferralCode(A)).toBe(c1);
  });

  it('tra ngược từ mã ra người', () => {
    const code = getOrCreateReferralCode(A);
    expect(getUserByCode(code)).toBe(A);
    expect(getUserByCode(code.toLowerCase())).toBe(A);
  });

  it('mã không tồn tại trả null', () => {
    expect(getUserByCode('KHONGCO')).toBeNull();
  });

  it('mã của những người khác nhau thì khác nhau', () => {
    const codes = new Set(['u1','u2','u3','u4','u5'].map(getOrCreateReferralCode));
    expect(codes.size).toBe(5);
  });
});

describe('Ghi nhận giới thiệu — MỘT TẦNG', () => {
  it('A giới thiệu B thành công', () => {
    expect(recordAttribution(B, A)).toBe(true);
    expect(getDirectReferrer(B)).toBe(A);
  });

  it('CHẶN tự giới thiệu', () => {
    expect(recordAttribution(A, A)).toBe(false);
    expect(getDirectReferrer(A)).toBeNull();
  });

  it('CHẶN gán người giới thiệu thứ hai cho cùng một người', () => {
    recordAttribution(B, A);
    expect(recordAttribution(B, C)).toBe(false);
    expect(getDirectReferrer(B)).toBe(A);
  });

  it('A→B→C: C chỉ trỏ tới B, KHÔNG có đường nào tới A', () => {
    recordAttribution(B, A);
    recordAttribution(C, B);
    expect(getDirectReferrer(C)).toBe(B);
    expect(getDirectReferrer(C)).not.toBe(A);
  });

  it('đếm số người đã giới thiệu — chỉ đếm trực tiếp', () => {
    recordAttribution(B, A);
    recordAttribution(C, B);
    expect(countReferred(A)).toBe(1); // chỉ B, không tính C
    expect(countReferred(B)).toBe(1); // chỉ C
  });
});

describe('Thưởng giới thiệu', () => {
  it('mỗi đơn chỉ sinh MỘT khoản thưởng', () => {
    expect(reward('DW-AAA111', A, B, 3000)).not.toBeNull();
    expect(reward('DW-AAA111', A, B, 3000)).toBeNull();
    expect(listRewards(A)).toHaveLength(1);
  });

  it('không tạo được thưởng tự giới thiệu', () => {
    expect(reward('DW-BBB222', A, A, 3000)).toBeNull();
  });

  it('thưởng mới ở trạng thái pending', () => {
    const r = reward('DW-CCC333', A, B, 3000);
    expect(r?.status).toBe('pending');
  });

  it('luồng pending → held → available', () => {
    const r = reward('DW-DDD444', A, B, 3000);
    advanceReward(r!.id, 'held');
    const done = advanceReward(r!.id, 'available');
    expect(done?.status).toBe('available');
    expect(done?.availableAt).toBeTruthy();
  });

  it('KHÔNG nhảy thẳng pending → paid', () => {
    const r = reward('DW-EEE555', A, B, 3000);
    expect(() => advanceReward(r!.id, 'paid')).toThrow(/không hợp lệ/);
  });
});

describe('Ví', () => {
  it('chưa có thưởng thì số dư bằng 0', () => {
    const w = walletSummary(A);
    expect(w.available.amount).toBe(0);
    expect(w.pending.amount).toBe(0);
  });

  it('thưởng pending nằm ở mục đang chờ, không rút được', () => {
    reward('DW-F1', A, B, 3000);
    const w = walletSummary(A);
    expect(w.pending.amount).toBe(3000);
    expect(w.available.amount).toBe(0);
  });

  it('thưởng đã mở khoá vào số dư khả dụng', () => {
    const r = reward('DW-F2', A, B, 3000);
    advanceReward(r!.id, 'held');
    advanceReward(r!.id, 'available');
    const w = walletSummary(A);
    expect(w.available.amount).toBe(3000);
    expect(w.pending.amount).toBe(0);
  });

  it('ví của người này không lẫn sang người khác', () => {
    const r1 = reward('DW-G1', A, B, 3000);
    advanceReward(r1!.id, 'held'); advanceReward(r1!.id, 'available');
    const r2 = reward('DW-G2', B, C, 5000);
    advanceReward(r2!.id, 'held'); advanceReward(r2!.id, 'available');
    expect(walletSummary(A).available.amount).toBe(3000);
    expect(walletSummary(B).available.amount).toBe(5000);
  });
});

describe('Rút tiền', () => {
  const napVi = (userId: string, amount: number, ref: string) => {
    const r = reward(ref, userId, 'someone', amount);
    advanceReward(r!.id, 'held');
    advanceReward(r!.id, 'available');
  };

  it('rút được khi đủ số dư và đạt mức tối thiểu', () => {
    napVi(A, 20000, 'DW-H1');
    const req = requestWithdrawal(A, 15000);
    expect(req.status).toBe('requested');
    expect(req.amountMinor).toBe(15000);
  });

  it('CHẶN rút quá số dư khả dụng', () => {
    napVi(A, 12000, 'DW-H2');
    expect(() => requestWithdrawal(A, 50000)).toThrow(/không đủ/i);
  });

  it('CHẶN rút dưới mức tối thiểu', () => {
    napVi(A, 20000, 'DW-H3');
    expect(() => requestWithdrawal(A, MIN_WITHDRAWAL_MINOR - 1)).toThrow(WithdrawalError);
  });

  it('CHẶN rút số âm hoặc 0', () => {
    napVi(A, 20000, 'DW-H4');
    expect(() => requestWithdrawal(A, 0)).toThrow(/lớn hơn 0/);
    expect(() => requestWithdrawal(A, -100)).toThrow(/lớn hơn 0/);
  });

  it('KHÔNG rút được hai lần cùng một khoản tiền', () => {
    napVi(A, 20000, 'DW-H5');
    requestWithdrawal(A, 20000);
    expect(walletSummary(A).available.amount).toBe(0);
    expect(() => requestWithdrawal(A, 20000)).toThrow(/không đủ/i);
  });

  it('chưa mở khoá thì chưa rút được dù có thưởng', () => {
    reward('DW-H6', A, B, 50000); // vẫn pending
    expect(() => requestWithdrawal(A, 20000)).toThrow(/không đủ/i);
  });
});
