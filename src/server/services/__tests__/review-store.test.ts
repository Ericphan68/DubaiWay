import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import { computeBookingFinancials } from '@/core/pricing';
import {
  __resetBookings, createBooking, markCompleted, markPaid, redeemVoucher,
} from '../booking-store';
import {
  ReviewError, __resetReviews, createReview, getReviewForBooking, hideReview,
  listReviewsForService, ratingSummary, respondToReview,
} from '../review-store';

const MERCHANT = 'merchant-1';
const USER = 'user-1';
const OTHER_USER = 'user-2';

const makeBooking = () => createBooking({
  userId: USER,
  contactEmail: 'k@example.test', contactPhone: '+84900000000',
  merchantId: MERCHANT, serviceId: 'svc-1', serviceSlug: 'evening-desert-safari-bbq',
  serviceTitle: 'Safari sa mạc', packageId: 'p1', packageName: 'Tiêu chuẩn',
  serviceDate: '2026-09-15', startTime: '15:00',
  adults: 2, children: 0, infants: 0,
  travelers: [{ fullName: 'Khách A', type: 'adult', isLead: true }],
  financials: computeBookingFinancials({
    currency: 'USD',
    lines: [{ label: 'Người lớn', unitPrice: fromMajorUnits(150, 'USD'), quantity: 2 }],
  }),
  referrerUserId: null, disputeWindowHours: 72,
});

/** Đưa một đơn đi hết vòng đời tới trạng thái completed. */
const completedBooking = () => {
  const b = makeBooking();
  markPaid(b.reference, 'pi_1');
  redeemVoucher(b.voucher.code, MERCHANT);
  markCompleted(b.reference, 72);
  return b;
};

const validInput = (reference: string) => ({
  bookingReference: reference,
  userId: USER,
  authorName: 'Khách A',
  ratingOverall: 5,
  comment: 'Tài xế đón đúng giờ, đồ ăn nhiều món, hướng dẫn viên nhiệt tình.',
});

beforeEach(() => { __resetBookings(); __resetReviews(); });

describe('Chỉ đánh giá được sau khi hoàn thành dịch vụ', () => {
  it('đơn đã hoàn thành thì viết được', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    expect(r.ratingOverall).toBe(5);
  });

  it('đơn mới tạo, chưa thanh toán → TỪ CHỐI', () => {
    const b = makeBooking();
    expect(() => createReview(validInput(b.reference))).toThrow(/sau khi đã sử dụng dịch vụ/);
  });

  it('đơn đã thanh toán nhưng chưa dùng → TỪ CHỐI', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    expect(() => createReview(validInput(b.reference))).toThrow(/sau khi đã sử dụng dịch vụ/);
  });

  it('đơn đã quét voucher nhưng chưa chốt hoàn thành → TỪ CHỐI', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    redeemVoucher(b.voucher.code, MERCHANT);
    expect(() => createReview(validInput(b.reference))).toThrow(/sau khi đã sử dụng dịch vụ/);
  });

  it('người khác KHÔNG đánh giá hộ đơn của bạn', () => {
    const b = completedBooking();
    expect(() => createReview({ ...validInput(b.reference), userId: OTHER_USER }))
      .toThrow(/đơn hàng của chính mình/);
  });

  it('mỗi đơn chỉ đánh giá MỘT lần', () => {
    const b = completedBooking();
    createReview(validInput(b.reference));
    expect(() => createReview(validInput(b.reference))).toThrow(/đã được đánh giá/);
  });

  it('đơn không tồn tại → báo lỗi', () => {
    expect(() => createReview(validInput('DW-KHONGCO'))).toThrow(ReviewError);
  });
});

describe('Kiểm tra nội dung đánh giá', () => {
  it('số sao ngoài 1–5 bị từ chối', () => {
    const b = completedBooking();
    expect(() => createReview({ ...validInput(b.reference), ratingOverall: 0 })).toThrow(/từ 1 đến 5/);
    expect(() => createReview({ ...validInput(b.reference), ratingOverall: 6 })).toThrow(/từ 1 đến 5/);
  });

  it('điểm chi tiết ngoài 1–5 bị từ chối', () => {
    const b = completedBooking();
    expect(() => createReview({ ...validInput(b.reference), ratingQuality: 9 })).toThrow(/từ 1 đến 5/);
  });

  it('nhận xét quá ngắn bị từ chối', () => {
    const b = completedBooking();
    expect(() => createReview({ ...validInput(b.reference), comment: 'ok' })).toThrow(/ít nhất 10 ký tự/);
  });

  it('điểm chi tiết là tuỳ chọn', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    expect(r.ratingQuality).toBeNull();
  });
});

describe('Merchant phản hồi nhưng không sửa được đánh giá', () => {
  it('phản hồi lưu vào trường riêng, nội dung gốc giữ nguyên', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    const noiDungGoc = r.comment;

    const sau = respondToReview(r.id, MERCHANT, 'Cảm ơn bạn, hẹn gặp lại!');
    expect(sau.merchantResponse).toBe('Cảm ơn bạn, hẹn gặp lại!');
    expect(sau.comment).toBe(noiDungGoc);
  });

  it('merchant khác không phản hồi được', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    expect(() => respondToReview(r.id, 'merchant-khac', 'Xin chào')).toThrow(/không thuộc đơn vị/);
  });

  it('không có hàm nào cho phép sửa hoặc xoá nội dung đánh giá', async () => {
    const mod = await import('../review-store');
    const names = Object.keys(mod);
    expect(names).not.toContain('updateReview');
    expect(names).not.toContain('deleteReview');
    expect(names).not.toContain('editReviewComment');
  });
});

describe('Admin ẩn đánh giá vi phạm', () => {
  it('ẩn được và bắt buộc nêu lý do', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    const hidden = hideReview(r.id, 'Chứa thông tin cá nhân của nhân viên');
    expect(hidden.isHidden).toBe(true);
    expect(hidden.hiddenReason).toBe('Chứa thông tin cá nhân của nhân viên');
  });

  it('KHÔNG ẩn được nếu không nêu lý do', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    expect(() => hideReview(r.id, '   ')).toThrow(/phải nêu lý do/i);
  });

  it('đánh giá bị ẩn không hiện ra công khai', () => {
    const b = completedBooking();
    const r = createReview(validInput(b.reference));
    expect(listReviewsForService('evening-desert-safari-bbq')).toHaveLength(1);
    hideReview(r.id, 'Vi phạm quy tắc nội dung');
    expect(listReviewsForService('evening-desert-safari-bbq')).toHaveLength(0);
  });
});

describe('Tổng hợp điểm', () => {
  it('chưa có đánh giá thì trả 0, không phải NaN', () => {
    const s = ratingSummary('evening-desert-safari-bbq');
    expect(s.count).toBe(0);
    expect(s.average).toBe(0);
  });

  it('tính trung bình đúng và bỏ qua đánh giá bị ẩn', () => {
    const b1 = completedBooking();
    createReview({ ...validInput(b1.reference), ratingOverall: 5 });
    const b2 = completedBooking();
    const r2 = createReview({ ...validInput(b2.reference), ratingOverall: 3 });
    expect(ratingSummary('evening-desert-safari-bbq')).toEqual({ count: 2, average: 4 });

    hideReview(r2.id, 'Spam');
    expect(ratingSummary('evening-desert-safari-bbq')).toEqual({ count: 1, average: 5 });
  });

  it('tra được đánh giá theo mã đơn', () => {
    const b = completedBooking();
    createReview(validInput(b.reference));
    expect(getReviewForBooking(b.reference)?.bookingReference).toBe(b.reference);
    expect(getReviewForBooking('DW-KHONGCO')).toBeNull();
  });
});
