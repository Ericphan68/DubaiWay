'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { getSessionUser } from '@/server/auth';
import { createQuote, QuoteError } from '@/server/services/booking-service';
import { createBooking, markPaid } from '@/server/services/booking-store';
import { getPaymentGateway } from '@/server/adapters/payment';
import { getDirectReferrer, recordReward } from '@/server/services/referral-store';
import { getMerchant } from '@/server/services/merchant-store';
import { sendBookingConfirmation, sendMerchantNewBooking } from '@/server/services/notification-service';
import { pushNotification } from '@/server/services/customer-store';
import { CouponError, applyCoupon, redeemCoupon } from '@/server/services/coupon-store';

/**
 * Nhận đơn đặt dịch vụ.
 *
 * QUAN TRỌNG: máy chủ TỰ TÍNH LẠI toàn bộ số tiền từ gói dịch vụ trong database.
 * Không con số nào gửi lên từ trình duyệt được dùng để tính tiền — nếu tin,
 * người dùng chỉ cần sửa vài byte là mua tour 1.000 USD với giá 1 USD.
 */
const schema = z.object({
  slug: z.string().min(1),
  packageId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  adults: z.coerce.number().int().min(0).max(100),
  children: z.coerce.number().int().min(0).max(100),
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().trim().email('Email không hợp lệ'),
  phone: z.string().trim().min(6, 'Số điện thoại không hợp lệ'),
  note: z.string().trim().max(1000).optional(),
  couponCode: z.string().trim().max(20).optional(),
});

export interface BookingActionState {
  readonly error: string | null;
  readonly fieldErrors?: Record<string, string>;
}

export async function submitBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Vui lòng kiểm tra lại thông tin đã nhập.', fieldErrors };
  }

  const input = parsed.data;
  const locale = await getLocale();
  const service = await getRepositories().catalog.getServiceBySlug(input.slug, locale);
  if (!service) return { error: 'Không tìm thấy dịch vụ này.' };

  const pkg = service.packages.find((p) => p.id === input.packageId);
  if (!pkg) return { error: 'Gói dịch vụ không còn khả dụng. Vui lòng chọn lại.' };

  // Người giới thiệu lấy từ dữ liệu máy chủ, KHÔNG lấy từ form —
  // nếu tin form, ai cũng tự gán mình làm người giới thiệu để ăn thưởng.
  // getDirectReferrer chỉ trả người giới thiệu TRỰC TIẾP, không đi ngược lên chuỗi.
  const user = await getSessionUser();
  const referrerUserId = user ? getDirectReferrer(user.id) : null;

  // Giảm giá tính lại từ MÃ, không nhận số tiền giảm gửi lên từ trình duyệt.
  let discount;
  let appliedCoupon: { id: string; code: string } | null = null;
  if (input.couponCode) {
    try {
      const lines = pkg.priceGroup && pkg.priceGroup.amount > 0
        ? pkg.priceGroup.amount * Math.max(1, Math.ceil((input.adults + input.children) / (pkg.groupSize ?? 1)))
        : pkg.priceAdult.amount * input.adults + (pkg.priceChild?.amount ?? 0) * input.children;
      const applied = applyCoupon(input.couponCode, {
        userId: user?.id ?? null,
        subtotal: { amount: lines, currency: 'USD' },
        categorySlug: service.categorySlug,
        merchantId: service.merchant.id,
      });
      discount = applied.discount;
      appliedCoupon = { id: applied.coupon.id, code: applied.coupon.code };
    } catch (err) {
      return { error: err instanceof CouponError ? err.message : 'Mã khuyến mãi không dùng được.' };
    }
  }

  let quote;
  try {
    quote = createQuote({
      pkg,
      guests: { adults: input.adults, children: input.children, infants: 0 },
      discount,
      hasReferrer: referrerUserId !== null,
    });
  } catch (err) {
    return { error: err instanceof QuoteError ? err.message : 'Không tính được giá cho lựa chọn này.' };
  }

  const booking = createBooking({
    userId: user?.id ?? null,
    contactEmail: input.email,
    contactPhone: input.phone,
    merchantId: service.merchant.id,
    serviceId: service.id,
    serviceSlug: service.slug,
    serviceTitle: service.title,
    packageId: pkg.id,
    packageName: pkg.name,
    serviceDate: input.date,
    startTime: null,
    adults: input.adults,
    children: input.children,
    infants: 0,
    travelers: [{ fullName: input.fullName, type: 'adult', isLead: true, email: input.email, phone: input.phone }],
    financials: quote.financials,
    referrerUserId,
    customerNote: input.note,
    meetingPoint: service.meetingPoint,
    disputeWindowHours: service.policies?.disputeWindowHours ?? 72,
  });

  // Tạo giao dịch thanh toán. idempotencyKey gắn với mã đơn nên gọi lại
  // KHÔNG tạo giao dịch thứ hai.
  const gateway = getPaymentGateway();
  try {
    const intent = await gateway.createIntent({
      bookingId: booking.id,
      amount: quote.financials.customerTotal,
      description: `${service.title} — ${input.date}`,
      customerEmail: input.email,
      idempotencyKey: `booking:${booking.reference}`,
    });

    // Ở chế độ sandbox, coi như khách đã thanh toán xong để chạy hết luồng.
    // Với cổng thật, bước này do webhook `payment_intent.succeeded` thực hiện.
    if (gateway.isSandbox) {
      markPaid(booking.reference, intent.id);
    }

    // Gửi email xác nhận cho khách và báo đơn mới cho đối tác.
    // Lỗi gửi thông báo KHÔNG được làm hỏng đơn hàng — đơn đã tạo và đã thanh toán.
    try {
      await sendBookingConfirmation(booking);
      const merchantEmail = getMerchant(service.merchant.id)?.contactEmail;
      if (merchantEmail) await sendMerchantNewBooking(booking, merchantEmail);
    } catch (notifyError) {
      console.error('Không gửi được thông báo cho đơn', booking.reference, notifyError);
    }

    // Ghi nhận đã dùng mã khuyến mãi.
    if (appliedCoupon) {
      redeemCoupon({
        couponId: appliedCoupon.id,
        code: appliedCoupon.code,
        userId: user?.id ?? null,
        bookingReference: booking.reference,
        discountMinor: quote.financials.discountTotal.amount,
      });
    }

    // Thông báo trong tài khoản để khách thấy ngay khi đăng nhập.
    if (user) {
      pushNotification({
        userId: user.id,
        template: 'booking.confirmed',
        title: `Đơn ${booking.reference} đã được xác nhận`,
        body: `${booking.serviceTitle} — ${booking.serviceDate}. Voucher đã sẵn sàng.`,
        linkUrl: `/dat-cho/thanh-cong/${booking.reference}`,
      });
    }

    // Ghi nhận thưởng giới thiệu ở trạng thái `pending`.
    // Chỉ mở khoá thành `available` sau khi dịch vụ hoàn thành và hết hạn khiếu nại.
    if (referrerUserId && user && quote.financials.referralReward.amount > 0) {
      recordReward({
        bookingReference: booking.reference,
        referrerUserId,
        referredUserId: user.id,
        commissionMinor: quote.financials.platformCommission.amount,
        shareBps: quote.financials.referralShareBps,
        amountMinor: quote.financials.referralReward.amount,
        currency: quote.currency,
      });
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Không khởi tạo được thanh toán. Vui lòng thử lại.',
    };
  }

  redirect(`/dat-cho/thanh-cong/${booking.reference}`);
}
