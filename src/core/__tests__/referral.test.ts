import { describe, expect, it } from 'vitest';
import {
  type FraudSignals,
  assertRewardTransition,
  canTransitionReward,
  decideAttribution,
  generateReferralCode,
  isRewardEligible,
} from '../referral';
import { fromMajorUnits } from '../money';
import { computeBookingFinancials } from '../pricing';

const noSignals: FraudSignals = {
  sameUser: false,
  sameEmail: false,
  samePhone: false,
  sameDeviceFingerprint: false,
  sameIpAddress: false,
  samePaymentFingerprint: false,
};

describe('Giới thiệu CHỈ MỘT TẦNG', () => {
  // A giới thiệu B, B giới thiệu C.
  // Khi C đặt hàng: chỉ B được thưởng. A không nhận gì.
  const attributions = new Map<string, string>([
    ['B', 'A'],
    ['C', 'B'],
  ]);

  const nguoiDuocThuong = (buyer: string): string[] => {
    const direct = attributions.get(buyer);
    return direct ? [direct] : [];
  };

  it('C đặt hàng thì chỉ B được thưởng', () => {
    expect(nguoiDuocThuong('C')).toEqual(['B']);
  });

  it('A KHÔNG nhận thưởng từ giao dịch của C', () => {
    expect(nguoiDuocThuong('C')).not.toContain('A');
  });

  it('B đặt hàng thì A được thưởng', () => {
    expect(nguoiDuocThuong('B')).toEqual(['A']);
  });

  it('mỗi giao dịch tối đa một người nhận thưởng', () => {
    for (const buyer of ['B', 'C', 'D']) {
      expect(nguoiDuocThuong(buyer).length).toBeLessThanOrEqual(1);
    }
  });

  it('đơn của C 1.000 USD: B nhận 30 USD, tổng chi thưởng đúng 30 USD', () => {
    const fin = computeBookingFinancials({
      currency: 'USD',
      lines: [{ label: 'x', unitPrice: fromMajorUnits(1000, 'USD'), quantity: 1 }],
      hasReferrer: nguoiDuocThuong('C').length === 1,
    });
    expect(fin.referralReward.amount).toBe(3000); // 30,00 USD
    // Nếu lỡ thành nhiều tầng, tổng chi sẽ là 60 USD — phải không bao giờ xảy ra
    const tongChiThuong = nguoiDuocThuong('C').length * fin.referralReward.amount;
    expect(tongChiThuong).toBe(3000);
  });
});

describe('Chống tự giới thiệu và gian lận', () => {
  it('cùng một tài khoản → từ chối thẳng', () => {
    const d = decideAttribution({ ...noSignals, sameUser: true });
    expect(d.outcome).toBe('reject');
  });

  it('không có tín hiệu nào → chấp nhận', () => {
    expect(decideAttribution(noSignals).outcome).toBe('accept');
  });

  it('chỉ trùng IP → vẫn chấp nhận, không kết luận gian lận từ một tín hiệu', () => {
    expect(decideAttribution({ ...noSignals, sameIpAddress: true }).outcome).toBe('accept');
  });

  it('chỉ trùng thiết bị → vẫn chấp nhận (gia đình dùng chung máy)', () => {
    expect(decideAttribution({ ...noSignals, sameDeviceFingerprint: true }).outcome).toBe('accept');
  });

  it('trùng IP + thiết bị → chuyển Admin xem xét, KHÔNG tự động từ chối', () => {
    const d = decideAttribution({ ...noSignals, sameIpAddress: true, sameDeviceFingerprint: true });
    expect(d.outcome).toBe('manual_review');
  });

  it('trùng email → chuyển Admin xem xét', () => {
    expect(decideAttribution({ ...noSignals, sameEmail: true }).outcome).toBe('manual_review');
  });

  it('trùng số điện thoại → chuyển Admin xem xét', () => {
    expect(decideAttribution({ ...noSignals, samePhone: true }).outcome).toBe('manual_review');
  });

  it('kết quả manual_review có kèm lý do', () => {
    const d = decideAttribution({ ...noSignals, sameEmail: true, sameIpAddress: true });
    expect(d.outcome === 'manual_review' && d.reasons.length).toBeGreaterThan(0);
  });
});

describe('Điều kiện ghi nhận thưởng', () => {
  const dayDu = {
    isPaid: true,
    isServiceCompleted: true,
    isDisputeWindowClosed: true,
    isRefunded: false,
    isFlaggedFraud: false,
  };

  it('đủ mọi điều kiện → hợp lệ', () => {
    expect(isRewardEligible(dayDu)).toBe(true);
  });

  it('chưa thanh toán → không hợp lệ', () => {
    expect(isRewardEligible({ ...dayDu, isPaid: false })).toBe(false);
  });

  it('dịch vụ chưa hoàn thành → không hợp lệ', () => {
    expect(isRewardEligible({ ...dayDu, isServiceCompleted: false })).toBe(false);
  });

  it('còn trong thời hạn khiếu nại → không hợp lệ', () => {
    expect(isRewardEligible({ ...dayDu, isDisputeWindowClosed: false })).toBe(false);
  });

  it('đã hoàn tiền → không hợp lệ', () => {
    expect(isRewardEligible({ ...dayDu, isRefunded: true })).toBe(false);
  });

  it('đang nghi gian lận → không hợp lệ', () => {
    expect(isRewardEligible({ ...dayDu, isFlaggedFraud: true })).toBe(false);
  });
});

describe('Trạng thái thưởng', () => {
  it('luồng bình thường pending → held → available → withdrawal_requested → paid', () => {
    expect(canTransitionReward('pending', 'held')).toBe(true);
    expect(canTransitionReward('held', 'available')).toBe(true);
    expect(canTransitionReward('available', 'withdrawal_requested')).toBe(true);
    expect(canTransitionReward('withdrawal_requested', 'paid')).toBe(true);
  });

  it('không được nhảy thẳng pending → paid', () => {
    expect(canTransitionReward('pending', 'paid')).toBe(false);
    expect(() => assertRewardTransition('pending', 'paid')).toThrow(/không hợp lệ/);
  });

  it('đã huỷ thì không quay lại được', () => {
    expect(canTransitionReward('cancelled', 'available')).toBe(false);
  });

  it('đã trả tiền vẫn có thể bị đảo khi hoàn tiền', () => {
    expect(canTransitionReward('paid', 'reversed')).toBe(true);
  });
});

describe('Mã giới thiệu', () => {
  it('đủ độ dài và không chứa ký tự dễ nhầm', () => {
    const code = generateReferralCode(() => 0.5, 8);
    expect(code).toHaveLength(8);
    expect(code).not.toMatch(/[01OIL]/);
  });

  it('sinh ngẫu nhiên khác nhau', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateReferralCode()));
    expect(codes.size).toBeGreaterThan(190);
  });
});
