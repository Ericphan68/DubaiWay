import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import { computeBookingFinancials } from '@/core/pricing';
import {
  __resetBookings, createBooking, getBookingByReference, markCompleted, markPaid, redeemVoucher,
} from '../booking-store';
import {
  CancellationError, DisputeError, __resetDisputes, addDisputeMessage, cancelWithRefund,
  getCancellation, listDisputes, openDispute, previewCancellation, setDisputeStatus,
} from '../dispute-store';

const MERCHANT = 'merchant-1';
const USER = 'user-1';
const OTHER = 'user-2';
const aed = (v: number) => fromMajorUnits(v, 'AED');

/** Bậc hoàn: trước 24h hoàn 100%, trước 4h hoàn 50%, sau đó không hoàn. */
const TIERS = [
  { hoursBefore: 24, refundBps: 10000 },
  { hoursBefore: 4, refundBps: 5000 },
];

/** Ngày dịch vụ đặt ở tương lai để tính số giờ còn lại được. */
function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const makeBooking = (opts: { daysAhead?: number; hasReferrer?: boolean } = {}) =>
  createBooking({
    userId: USER, contactEmail: 'k@example.test', contactPhone: '+84900000000',
    merchantId: MERCHANT, serviceId: 'svc-1', serviceSlug: 'evening-desert-safari-bbq',
    serviceTitle: 'Safari sa mạc', packageId: 'p1', packageName: 'Tiêu chuẩn',
    serviceDate: futureDate(opts.daysAhead ?? 10), startTime: '15:00',
    adults: 2, children: 0, infants: 0,
    travelers: [{ fullName: 'Khách A', type: 'adult', isLead: true }],
    financials: computeBookingFinancials({
      currency: 'AED',
      lines: [{ label: 'Người lớn', unitPrice: aed(500), quantity: 2 }],
      hasReferrer: opts.hasReferrer ?? false,
    }),
    referrerUserId: opts.hasReferrer ? 'referrer-1' : null,
    disputeWindowHours: 72,
  });

beforeEach(() => { __resetBookings(); __resetDisputes(); });

describe('Xem trước tiền hoàn trước khi huỷ', () => {
  it('huỷ sớm (còn 10 ngày) → hoàn 100%', () => {
    const b = makeBooking({ daysAhead: 10 });
    const p = previewCancellation(b.reference, TIERS);
    expect(p.refundRateBps).toBe(10000);
    expect(p.refundAmount).toEqual(aed(1000));
    expect(p.canCancel).toBe(true);
  });

  it('huỷ sát giờ (còn ~6 giờ) → hoàn 50%', () => {
    const b = makeBooking({ daysAhead: 1 });
    // Giả lập "bây giờ" là 6 giờ trước giờ khởi hành.
    const start = new Date(`${b.serviceDate}T15:00:00`);
    const now = new Date(start.getTime() - 6 * 3_600_000);
    const p = previewCancellation(b.reference, TIERS, now);
    expect(p.refundRateBps).toBe(5000);
    expect(p.refundAmount).toEqual(aed(500));
  });

  it('huỷ quá sát (còn 1 giờ) → không hoàn', () => {
    const b = makeBooking({ daysAhead: 1 });
    const start = new Date(`${b.serviceDate}T15:00:00`);
    const now = new Date(start.getTime() - 1 * 3_600_000);
    const p = previewCancellation(b.reference, TIERS, now);
    expect(p.refundRateBps).toBe(0);
    expect(p.refundAmount.amount).toBe(0);
  });

  it('voucher đã dùng thì KHÔNG huỷ được', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    redeemVoucher(b.voucher.code, MERCHANT);
    const p = previewCancellation(b.reference, TIERS);
    expect(p.canCancel).toBe(false);
    expect(p.reason).toMatch(/đã được sử dụng/);
  });

  it('đơn đã hoàn thành thì KHÔNG huỷ được, phải mở khiếu nại', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    redeemVoucher(b.voucher.code, MERCHANT);
    markCompleted(b.reference, 72);
    const p = previewCancellation(b.reference, TIERS);
    expect(p.canCancel).toBe(false);
    expect(p.reason).toMatch(/khiếu nại/);
  });
});

describe('Huỷ đơn và thu hồi tiền', () => {
  it('hoàn 100% thì thu hồi toàn bộ hoa hồng, doanh thu và thưởng', () => {
    const b = makeBooking({ hasReferrer: true });
    markPaid(b.reference, 'pi_1');
    const rec = cancelWithRefund({
      reference: b.reference, requestedBy: USER, actorRole: 'customer',
      reason: 'Đổi lịch bay', tiers: TIERS,
    });

    expect(rec.refundAmountMinor).toBe(100000);           // 1.000,00 AED
    expect(rec.commissionReversalMinor).toBe(-10000);     // −100,00
    expect(rec.merchantReversalMinor).toBe(-90000);       // −900,00
    expect(rec.referralReversalMinor).toBe(-3000);        // −30,00
  });

  it('hoàn 50% thì thu hồi đúng một nửa', () => {
    const b = makeBooking({ daysAhead: 1, hasReferrer: true });
    markPaid(b.reference, 'pi_1');
    const start = new Date(`${b.serviceDate}T15:00:00`);
    const rec = cancelWithRefund({
      reference: b.reference, requestedBy: USER, actorRole: 'customer',
      reason: 'Bận việc', tiers: TIERS,
      now: new Date(start.getTime() - 6 * 3_600_000),
    });
    expect(rec.refundAmountMinor).toBe(50000);
    expect(rec.commissionReversalMinor).toBe(-5000);
    expect(rec.merchantReversalMinor).toBe(-45000);
    expect(rec.referralReversalMinor).toBe(-1500);
  });

  it('đơn chuyển sang trạng thái đã huỷ và voucher không dùng được nữa', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    cancelWithRefund({
      reference: b.reference, requestedBy: USER, actorRole: 'customer',
      reason: 'Thay đổi kế hoạch', tiers: TIERS,
    });
    const sau = getBookingByReference(b.reference);
    expect(sau?.status).toBe('cancelled');
    expect(sau?.voucher.status).toBe('cancelled');
  });

  it('KHÔNG huỷ được hai lần', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    cancelWithRefund({ reference: b.reference, requestedBy: USER, actorRole: 'customer', reason: 'x', tiers: TIERS });
    expect(() => cancelWithRefund({
      reference: b.reference, requestedBy: USER, actorRole: 'customer', reason: 'x', tiers: TIERS,
    })).toThrow(CancellationError);
  });

  it('lưu lại bản ghi huỷ để đối soát', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    cancelWithRefund({ reference: b.reference, requestedBy: USER, actorRole: 'customer', reason: 'Ốm', tiers: TIERS });
    const rec = getCancellation(b.reference);
    expect(rec?.reason).toBe('Ốm');
    expect(rec?.actorRole).toBe('customer');
  });
});

describe('Khiếu nại', () => {
  const paidBooking = () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    return b;
  };

  const validDispute = (ref: string) => ({
    bookingReference: ref, openedBy: USER, category: 'service_quality',
    subject: 'Dịch vụ không đúng mô tả',
    description: 'Xe đón trễ 90 phút, không có hướng dẫn viên tiếng Việt như đã ghi trên trang dịch vụ.',
  });

  it('mở được khiếu nại cho đơn đã thanh toán', () => {
    const b = paidBooking();
    const d = openDispute(validDispute(b.reference));
    expect(d.status).toBe('open');
    expect(d.reference).toMatch(/^KN-[2-9A-HJ-NP-Z]{6}$/);
  });

  it('KHÔNG mở được cho đơn chưa thanh toán', () => {
    const b = makeBooking();
    expect(() => openDispute(validDispute(b.reference))).toThrow(/chưa thanh toán/);
  });

  it('KHÔNG khiếu nại hộ đơn người khác', () => {
    const b = paidBooking();
    expect(() => openDispute({ ...validDispute(b.reference), openedBy: OTHER }))
      .toThrow(/đơn hàng của chính mình/);
  });

  it('mô tả quá ngắn bị từ chối', () => {
    const b = paidBooking();
    expect(() => openDispute({ ...validDispute(b.reference), description: 'không tốt' }))
      .toThrow(/ít nhất 20 ký tự/);
  });

  it('KHÔNG mở hai khiếu nại cùng lúc cho một đơn', () => {
    const b = paidBooking();
    openDispute(validDispute(b.reference));
    expect(() => openDispute(validDispute(b.reference))).toThrow(/đang có khiếu nại/);
  });

  it('mở lại được sau khi khiếu nại cũ đã đóng', () => {
    const b = paidBooking();
    const d = openDispute(validDispute(b.reference));
    setDisputeStatus(d.id, 'under_review');
    setDisputeStatus(d.id, 'resolved', 'Đã hoàn 50% cho khách');
    expect(() => openDispute(validDispute(b.reference))).not.toThrow();
  });
});

describe('Trao đổi trong khiếu nại', () => {
  const setup = () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    return openDispute({
      bookingReference: b.reference, openedBy: USER, category: 'service_quality',
      subject: 'Không đúng mô tả',
      description: 'Chương trình thiếu hai điểm tham quan so với lịch trình công bố.',
    });
  };

  it('các bên gửi được tin nhắn', () => {
    const d = setup();
    addDisputeMessage({ disputeId: d.id, senderId: MERCHANT, senderRole: 'merchant', body: 'Chúng tôi đang kiểm tra.' });
    addDisputeMessage({ disputeId: d.id, senderId: USER, senderRole: 'customer', body: 'Tôi có ảnh chụp lịch trình.' });
    expect(d.messages).toHaveLength(2);
  });

  it('khiếu nại đã đóng thì không gửi thêm được', () => {
    const d = setup();
    setDisputeStatus(d.id, 'under_review');
    setDisputeStatus(d.id, 'resolved', 'Hoàn 30% cho khách');
    expect(() => addDisputeMessage({ disputeId: d.id, senderId: USER, senderRole: 'customer', body: 'Thêm ý kiến' }))
      .toThrow(/đã đóng/);
  });
});

describe('Xử lý khiếu nại', () => {
  const setup = () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    return openDispute({
      bookingReference: b.reference, openedBy: USER, category: 'service_quality',
      subject: 'Vấn đề', description: 'Mô tả đủ dài để hệ thống chấp nhận khiếu nại này.',
    });
  };

  it('luồng open → under_review → resolved', () => {
    const d = setup();
    setDisputeStatus(d.id, 'under_review');
    const done = setDisputeStatus(d.id, 'resolved', 'Đối tác hoàn 200 AED cho khách');
    expect(done.status).toBe('resolved');
    expect(done.resolvedAt).toBeTruthy();
  });

  it('BẮT BUỘC ghi kết luận khi đóng', () => {
    const d = setup();
    setDisputeStatus(d.id, 'under_review');
    expect(() => setDisputeStatus(d.id, 'resolved')).toThrow(/phải ghi kết luận/i);
  });

  it('không nhảy thẳng open → resolved', () => {
    const d = setup();
    expect(() => setDisputeStatus(d.id, 'resolved', 'xong')).toThrow(/Không chuyển được/);
  });

  it('khiếu nại đã đóng là trạng thái cuối', () => {
    const d = setup();
    setDisputeStatus(d.id, 'under_review');
    setDisputeStatus(d.id, 'rejected', 'Không đủ căn cứ');
    expect(() => setDisputeStatus(d.id, 'under_review')).toThrow(/Không chuyển được/);
  });

  it('lọc khiếu nại theo khách và theo đối tác', () => {
    setup();
    expect(listDisputes({ userId: USER })).toHaveLength(1);
    expect(listDisputes({ merchantId: MERCHANT })).toHaveLength(1);
    expect(listDisputes({ userId: OTHER })).toHaveLength(0);
  });

  it('khiếu nại không tồn tại báo lỗi', () => {
    expect(() => setDisputeStatus('khong-co', 'under_review')).toThrow(DisputeError);
  });
});
