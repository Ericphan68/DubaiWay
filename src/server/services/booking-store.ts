/**
 * Lưu trữ đơn hàng.
 *
 * Bản trong bộ nhớ dùng khi chưa có Supabase, để chạy và kiểm thử được TRỌN VẸN
 * luồng đặt dịch vụ → thanh toán → voucher → quét mã ngay sau khi clone.
 * Khi có Supabase, thay bằng bản ghi vào database — interface không đổi.
 *
 * Toàn bộ số tiền là ảnh chụp tại thời điểm đặt, đúng như bảng `bookings`.
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { CurrencyCode, Money } from '@/core/money';
import type { BookingFinancials } from '@/core/pricing';
import type { BookingStatus, VoucherStatus } from '@/core/state-machines';
import { bookingState, voucherState } from '@/core/state-machines';

export interface BookingTravelerInput {
  readonly fullName: string;
  readonly type: 'adult' | 'child' | 'infant';
  readonly isLead: boolean;
  readonly email?: string;
  readonly phone?: string;
}

export interface CreateBookingInput {
  readonly userId: string | null;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly merchantId: string;
  readonly serviceId: string;
  readonly serviceSlug: string;
  readonly serviceTitle: string;
  readonly packageId: string;
  readonly packageName: string;
  readonly serviceDate: string;
  readonly startTime: string | null;
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
  readonly travelers: readonly BookingTravelerInput[];
  readonly financials: BookingFinancials;
  readonly referrerUserId: string | null;
  readonly customerNote?: string;
  readonly meetingPoint?: string | null;
  readonly disputeWindowHours: number;
}

export interface StoredVoucher {
  readonly id: string;
  readonly code: string;
  readonly qrPayload: string;
  status: VoucherStatus;
  readonly serviceDate: string;
  readonly startTime: string | null;
  readonly guestCount: number;
  readonly meetingPoint: string | null;
  redeemedAt: string | null;
}

export interface StoredBooking {
  readonly id: string;
  readonly reference: string;
  readonly userId: string | null;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly merchantId: string;
  readonly serviceId: string;
  readonly serviceSlug: string;
  readonly serviceTitle: string;
  readonly packageName: string;
  readonly serviceDate: string;
  readonly startTime: string | null;
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
  readonly travelers: readonly BookingTravelerInput[];
  readonly financials: BookingFinancials;
  readonly referrerUserId: string | null;
  readonly customerNote: string | null;
  readonly disputeWindowEndsAt: string | null;
  status: BookingStatus;
  paymentIntentId: string | null;
  readonly createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  readonly voucher: StoredVoucher;
}

/**
 * Neo kho dữ liệu vào globalThis.
 *
 * Next.js nạp module theo từng "chunk": server action và trang render nằm ở hai chunk
 * khác nhau, nên biến cấp module KHÔNG dùng chung được — đơn tạo ở action sẽ không
 * thấy được khi render trang xác nhận. Dùng globalThis để cả tiến trình chung một kho.
 * (Bản Supabase không cần cách này vì dữ liệu nằm trong database.)
 */
interface BookingStoreState {
  bookings: Map<string, StoredBooking>;
  bookingsById: Map<string, StoredBooking>;
  vouchersByCode: Map<string, StoredBooking>;
}

const globalStore = globalThis as unknown as { __dubaiwayBookings?: BookingStoreState };

const store: BookingStoreState = (globalStore.__dubaiwayBookings ??= {
  bookings: new Map<string, StoredBooking>(),
  bookingsById: new Map<string, StoredBooking>(),
  vouchersByCode: new Map<string, StoredBooking>(),
});

const { bookings, bookingsById, vouchersByCode } = store;

const REFERENCE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function randomCode(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return out;
}

function uniqueReference(): string {
  let ref = `DW-${randomCode(6)}`;
  while (bookings.has(ref)) ref = `DW-${randomCode(6)}`;
  return ref;
}

/**
 * Ký nội dung QR để máy quét phát hiện được voucher giả.
 * Khoá lấy từ biến môi trường; ở chế độ giả lập dùng khoá cố định vì dữ liệu
 * cũng chỉ nằm trong bộ nhớ của tiến trình.
 */
const QR_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dubaiway-sandbox-qr-secret';

export function signVoucherPayload(code: string): string {
  const sig = createHmac('sha256', QR_SECRET).update(code).digest('hex').slice(0, 16);
  return `DW1:${code}:${sig}`;
}

export function verifyVoucherPayload(payload: string): string | null {
  const parts = payload.split(':');
  if (parts.length !== 3 || parts[0] !== 'DW1') return null;
  const [, code, sig] = parts;
  const expected = createHmac('sha256', QR_SECRET).update(code).digest('hex').slice(0, 16);
  return sig === expected ? code : null;
}

export function createBooking(input: CreateBookingInput): StoredBooking {
  const reference = uniqueReference();
  const voucherCode = `${reference}-01`;
  const guestCount = input.adults + input.children;

  const booking: StoredBooking = {
    id: randomUUID(),
    reference,
    userId: input.userId,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    merchantId: input.merchantId,
    serviceId: input.serviceId,
    serviceSlug: input.serviceSlug,
    serviceTitle: input.serviceTitle,
    packageName: input.packageName,
    serviceDate: input.serviceDate,
    startTime: input.startTime,
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    travelers: input.travelers,
    financials: input.financials,
    referrerUserId: input.referrerUserId,
    customerNote: input.customerNote ?? null,
    disputeWindowEndsAt: null,
    status: 'pending_payment',
    paymentIntentId: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    cancelledAt: null,
    voucher: {
      id: randomUUID(),
      code: voucherCode,
      qrPayload: signVoucherPayload(voucherCode),
      status: 'issued',
      serviceDate: input.serviceDate,
      startTime: input.startTime,
      guestCount,
      meetingPoint: input.meetingPoint ?? null,
      redeemedAt: null,
    },
  };

  bookings.set(reference, booking);
  bookingsById.set(booking.id, booking);
  vouchersByCode.set(voucherCode, booking);
  return booking;
}

export function getBookingByReference(reference: string): StoredBooking | null {
  return bookings.get(reference) ?? null;
}

export function getBookingByVoucherCode(code: string): StoredBooking | null {
  return vouchersByCode.get(code) ?? null;
}

export function listBookingsForUser(userId: string): StoredBooking[] {
  return [...bookings.values()]
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listBookingsForMerchant(merchantId: string): StoredBooking[] {
  return [...bookings.values()]
    .filter((b) => b.merchantId === merchantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllBookings(): StoredBooking[] {
  return [...bookings.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Đánh dấu đã thanh toán. Voucher chuyển sang `confirmed` để quét được. */
export function markPaid(reference: string, paymentIntentId: string): StoredBooking | null {
  const b = bookings.get(reference);
  if (!b) return null;
  bookingState.assert(b.status, 'paid');
  b.status = 'paid';
  b.paymentIntentId = paymentIntentId;
  voucherState.assert(b.voucher.status, 'confirmed');
  b.voucher.status = 'confirmed';
  return b;
}

export interface RedeemResult {
  readonly outcome: 'success' | 'duplicate' | 'invalid' | 'expired' | 'cancelled' | 'wrong_merchant';
  readonly message: string;
  readonly booking: StoredBooking | null;
}

/**
 * Quét voucher. Chỉ thành công ĐÚNG MỘT LẦN.
 * Lần quét thứ hai trả `duplicate`, không đổi trạng thái.
 */
export function redeemVoucher(codeOrPayload: string, merchantId: string): RedeemResult {
  const code = verifyVoucherPayload(codeOrPayload) ?? codeOrPayload.trim().toUpperCase();
  const b = vouchersByCode.get(code);
  if (!b) return { outcome: 'invalid', message: 'Mã voucher không tồn tại', booking: null };

  if (b.merchantId !== merchantId) {
    return { outcome: 'wrong_merchant', message: 'Voucher không thuộc đơn vị của bạn', booking: b };
  }
  if (b.voucher.status === 'redeemed') {
    return { outcome: 'duplicate', message: 'Voucher đã được sử dụng trước đó', booking: b };
  }
  if (b.voucher.status === 'cancelled' || b.voucher.status === 'refunded') {
    return { outcome: 'cancelled', message: 'Voucher đã bị huỷ hoặc hoàn tiền', booking: b };
  }
  if (b.voucher.status !== 'confirmed') {
    return { outcome: 'invalid', message: 'Voucher chưa được xác nhận thanh toán', booking: b };
  }

  voucherState.assert(b.voucher.status, 'redeemed');
  b.voucher.status = 'redeemed';
  b.voucher.redeemedAt = new Date().toISOString();
  bookingState.assert(b.status, 'confirmed');
  b.status = 'confirmed';
  return { outcome: 'success', message: 'Đã xác nhận khách sử dụng dịch vụ', booking: b };
}

/** Hoàn tất đơn sau khi dịch vụ diễn ra — mở đường cho đánh giá và thưởng giới thiệu. */
export function markCompleted(reference: string, disputeWindowHours: number): StoredBooking | null {
  const b = bookings.get(reference);
  if (!b) return null;
  bookingState.assert(b.status, 'completed');
  b.status = 'completed';
  b.completedAt = new Date().toISOString();
  const ends = new Date(Date.now() + disputeWindowHours * 3600_000);
  (b as { disputeWindowEndsAt: string | null }).disputeWindowEndsAt = ends.toISOString();
  return b;
}

export function cancelBooking(reference: string): StoredBooking | null {
  const b = bookings.get(reference);
  if (!b) return null;
  bookingState.assert(b.status, 'cancelled');
  b.status = 'cancelled';
  b.cancelledAt = new Date().toISOString();
  if (b.voucher.status !== 'redeemed') b.voucher.status = 'cancelled';
  return b;
}

export interface MerchantTotals {
  readonly currency: CurrencyCode;
  readonly grossSales: number;
  readonly commission: number;
  readonly netRevenue: number;
  readonly bookingCount: number;
}

/** Tổng hợp doanh thu cho dashboard merchant. Chỉ tính đơn đã thanh toán trở lên. */
export function merchantTotals(merchantId: string, currency: CurrencyCode): MerchantTotals {
  const counted = listBookingsForMerchant(merchantId).filter(
    (b) => b.status === 'paid' || b.status === 'confirmed' || b.status === 'completed',
  );
  return {
    currency,
    grossSales: counted.reduce((s, b) => s + b.financials.customerTotal.amount, 0),
    commission: counted.reduce((s, b) => s + b.financials.platformCommission.amount, 0),
    netRevenue: counted.reduce((s, b) => s + b.financials.merchantRevenue.amount, 0),
    bookingCount: counted.length,
  };
}

export interface PlatformTotals {
  readonly gmv: number;
  readonly commission: number;
  readonly referralPaid: number;
  readonly netRevenue: number;
  readonly merchantRevenue: number;
  readonly bookingCount: number;
  readonly cancelledCount: number;
}

export function platformTotals(): PlatformTotals {
  const all = listAllBookings();
  const counted = all.filter((b) => b.status === 'paid' || b.status === 'confirmed' || b.status === 'completed');
  return {
    gmv: counted.reduce((s, b) => s + b.financials.customerTotal.amount, 0),
    commission: counted.reduce((s, b) => s + b.financials.platformCommission.amount, 0),
    referralPaid: counted.reduce((s, b) => s + b.financials.referralReward.amount, 0),
    netRevenue: counted.reduce((s, b) => s + b.financials.platformNetRevenue.amount, 0),
    merchantRevenue: counted.reduce((s, b) => s + b.financials.merchantRevenue.amount, 0),
    bookingCount: counted.length,
    cancelledCount: all.filter((b) => b.status === 'cancelled' || b.status === 'refunded').length,
  };
}

export function totalsAsMoney(amount: number, currency: CurrencyCode): Money {
  return { amount, currency };
}

/** Chỉ dùng trong test. */
export function __resetBookings(): void {
  bookings.clear();
  bookingsById.clear();
  vouchersByCode.clear();
}
