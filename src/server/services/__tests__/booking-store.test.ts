import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import { computeBookingFinancials } from '@/core/pricing';
import {
  __resetBookings, cancelBooking, createBooking, getBookingByReference, listBookingsForMerchant,
  markCompleted, markPaid, merchantTotals, platformTotals, redeemVoucher, signVoucherPayload,
  verifyVoucherPayload,
} from '../booking-store';

const aed = (v: number) => fromMajorUnits(v, 'AED');
const MERCHANT = 'merchant-1';
const OTHER_MERCHANT = 'merchant-2';

const financials = (total: number, hasReferrer = false) =>
  computeBookingFinancials({
    currency: 'AED',
    lines: [{ label: 'Người lớn', unitPrice: aed(total), quantity: 1 }],
    hasReferrer,
  });

const makeBooking = (opts: { total?: number; hasReferrer?: boolean; merchantId?: string } = {}) =>
  createBooking({
    userId: 'user-1',
    contactEmail: 'khach@example.test',
    contactPhone: '+971500000000',
    merchantId: opts.merchantId ?? MERCHANT,
    serviceId: 'svc-1',
    serviceSlug: 'evening-desert-safari-bbq',
    serviceTitle: 'Safari sa mạc buổi chiều',
    packageId: 'pkg-1',
    packageName: 'Tiêu chuẩn',
    serviceDate: '2026-09-15',
    startTime: '15:00',
    adults: 2, children: 0, infants: 0,
    travelers: [{ fullName: 'Nguyễn Văn A', type: 'adult', isLead: true }],
    financials: financials(opts.total ?? 1000, opts.hasReferrer),
    referrerUserId: opts.hasReferrer ? 'referrer-1' : null,
    disputeWindowHours: 72,
  });

beforeEach(() => { __resetBookings(); });

describe('Tạo đơn', () => {
  it('sinh mã đơn duy nhất dạng DW-XXXXXX', () => {
    const b = makeBooking();
    expect(b.reference).toMatch(/^DW-[2-9A-HJ-NP-Z]{6}$/);
  });

  it('mã đơn không trùng nhau qua nhiều lần tạo', () => {
    const refs = new Set(Array.from({ length: 300 }, () => makeBooking().reference));
    expect(refs.size).toBe(300);
  });

  it('đơn mới ở trạng thái chờ thanh toán, voucher chưa dùng được', () => {
    const b = makeBooking();
    expect(b.status).toBe('pending_payment');
    expect(b.voucher.status).toBe('issued');
  });

  it('lưu đủ ảnh chụp tài chính', () => {
    const b = makeBooking({ total: 1000, hasReferrer: true });
    expect(b.financials.platformCommission).toEqual(aed(100));
    expect(b.financials.merchantRevenue).toEqual(aed(900));
    expect(b.financials.referralReward).toEqual(aed(30));
    expect(b.financials.platformNetRevenue).toEqual(aed(70));
  });
});

describe('Chữ ký voucher chống làm giả', () => {
  it('ký rồi kiểm lại ra đúng mã gốc', () => {
    const payload = signVoucherPayload('DW-ABC123-01');
    expect(verifyVoucherPayload(payload)).toBe('DW-ABC123-01');
  });

  it('sửa mã trong nội dung QR làm chữ ký sai', () => {
    const payload = signVoucherPayload('DW-ABC123-01');
    const forged = payload.replace('DW-ABC123-01', 'DW-XYZ999-01');
    expect(verifyVoucherPayload(forged)).toBeNull();
  });

  it('nội dung QR bịa hoàn toàn bị từ chối', () => {
    expect(verifyVoucherPayload('rac-ruoi')).toBeNull();
    expect(verifyVoucherPayload('DW1:X:Y')).toBeNull();
  });
});

describe('Quét voucher — chỉ MỘT LẦN', () => {
  it('chưa thanh toán thì chưa quét được', () => {
    const b = makeBooking();
    const r = redeemVoucher(b.voucher.code, MERCHANT);
    expect(r.outcome).toBe('invalid');
    expect(r.message).toMatch(/chưa được xác nhận thanh toán/);
  });

  it('sau khi thanh toán thì quét được', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    const r = redeemVoucher(b.voucher.code, MERCHANT);
    expect(r.outcome).toBe('success');
  });

  it('quét lần hai trả duplicate và KHÔNG đổi gì', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    redeemVoucher(b.voucher.code, MERCHANT);
    const redeemedAt = getBookingByReference(b.reference)?.voucher.redeemedAt;

    const second = redeemVoucher(b.voucher.code, MERCHANT);
    expect(second.outcome).toBe('duplicate');
    expect(getBookingByReference(b.reference)?.voucher.redeemedAt).toBe(redeemedAt);
  });

  it('quét 10 lần liên tiếp chỉ có 1 lần thành công', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    const outcomes = Array.from({ length: 10 }, () => redeemVoucher(b.voucher.code, MERCHANT).outcome);
    expect(outcomes.filter((o) => o === 'success')).toHaveLength(1);
    expect(outcomes.filter((o) => o === 'duplicate')).toHaveLength(9);
  });

  it('merchant khác KHÔNG quét được voucher không thuộc mình', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    const r = redeemVoucher(b.voucher.code, OTHER_MERCHANT);
    expect(r.outcome).toBe('wrong_merchant');
    expect(getBookingByReference(b.reference)?.voucher.status).toBe('confirmed');
  });

  it('quét được bằng nội dung QR đã ký', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    expect(redeemVoucher(b.voucher.qrPayload, MERCHANT).outcome).toBe('success');
  });

  it('voucher đã huỷ không quét được', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    cancelBooking(b.reference);
    expect(redeemVoucher(b.voucher.code, MERCHANT).outcome).toBe('cancelled');
  });

  it('mã không tồn tại trả invalid', () => {
    expect(redeemVoucher('DW-KHONGCO-01', MERCHANT).outcome).toBe('invalid');
  });
});

describe('Vòng đời đơn hàng', () => {
  it('pending_payment → paid → confirmed → completed', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    expect(getBookingByReference(b.reference)?.status).toBe('paid');
    redeemVoucher(b.voucher.code, MERCHANT);
    expect(getBookingByReference(b.reference)?.status).toBe('confirmed');
    markCompleted(b.reference, 72);
    expect(getBookingByReference(b.reference)?.status).toBe('completed');
  });

  it('hoàn thành thì đặt mốc hết hạn khiếu nại', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    redeemVoucher(b.voucher.code, MERCHANT);
    markCompleted(b.reference, 72);
    const done = getBookingByReference(b.reference);
    expect(done?.disputeWindowEndsAt).toBeTruthy();
    const ends = new Date(done?.disputeWindowEndsAt as string).getTime();
    expect(ends).toBeGreaterThan(Date.now());
  });

  it('không được thanh toán hai lần cho cùng một đơn', () => {
    const b = makeBooking();
    markPaid(b.reference, 'pi_1');
    expect(() => markPaid(b.reference, 'pi_2')).toThrow(/không hợp lệ/);
  });
});

describe('Tổng hợp doanh thu', () => {
  it('chỉ tính đơn đã thanh toán trở lên', () => {
    const paid = makeBooking({ total: 1000 });
    markPaid(paid.reference, 'pi_1');
    makeBooking({ total: 5000 }); // vẫn chờ thanh toán, không được tính

    const t = merchantTotals(MERCHANT, 'AED');
    expect(t.bookingCount).toBe(1);
    expect(t.grossSales).toBe(100000);   // 1.000,00 AED
    expect(t.commission).toBe(10000);    // 100,00
    expect(t.netRevenue).toBe(90000);    // 900,00
  });

  it('doanh thu merchant này không lẫn sang merchant khác', () => {
    const a = makeBooking({ total: 1000, merchantId: MERCHANT });
    const b = makeBooking({ total: 2000, merchantId: OTHER_MERCHANT });
    markPaid(a.reference, 'p1');
    markPaid(b.reference, 'p2');
    expect(merchantTotals(MERCHANT, 'AED').grossSales).toBe(100000);
    expect(merchantTotals(OTHER_MERCHANT, 'AED').grossSales).toBe(200000);
    expect(listBookingsForMerchant(MERCHANT)).toHaveLength(1);
  });

  it('tổng hợp nền tảng: hoa hồng = thưởng + phần giữ lại', () => {
    const b1 = makeBooking({ total: 1000, hasReferrer: true });
    const b2 = makeBooking({ total: 2000, hasReferrer: false });
    markPaid(b1.reference, 'p1');
    markPaid(b2.reference, 'p2');
    const t = platformTotals();
    expect(t.gmv).toBe(300000);
    expect(t.commission).toBe(30000);
    expect(t.referralPaid).toBe(3000);          // chỉ đơn 1 có người giới thiệu
    expect(t.netRevenue).toBe(27000);
    expect(t.referralPaid + t.netRevenue).toBe(t.commission);
    expect(t.merchantRevenue + t.commission).toBe(t.gmv);
  });

  it('đơn huỷ được đếm riêng, không tính vào doanh thu', () => {
    const b = makeBooking({ total: 1000 });
    markPaid(b.reference, 'p1');
    cancelBooking(b.reference);
    const t = platformTotals();
    expect(t.cancelledCount).toBe(1);
    expect(t.gmv).toBe(0);
  });
});
