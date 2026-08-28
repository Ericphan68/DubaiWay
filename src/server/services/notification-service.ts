/**
 * Soạn nội dung thông báo.
 *
 * Nội dung nằm ở đây thay vì rải rác trong các action, để đổi câu chữ không phải
 * đi tìm khắp nơi và để dịch sang ngôn ngữ khác chỉ cần thêm một nhánh.
 */
import { formatMoney } from '@/core/money';
import type { StoredBooking } from './booking-store';
import { getNotificationSender, type NotificationResult } from '@/server/adapters/notification';
import { siteConfig } from '@/config/site';

function dateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export async function sendBookingConfirmation(booking: StoredBooking): Promise<NotificationResult> {
  const body = [
    `Xin chào ${booking.travelers[0]?.fullName ?? 'quý khách'},`,
    '',
    `DubaiWay đã nhận đơn hàng ${booking.reference} của bạn.`,
    '',
    `Dịch vụ:        ${booking.serviceTitle}`,
    `Gói:            ${booking.packageName}`,
    `Ngày sử dụng:   ${dateLabel(booking.serviceDate)}`,
    `Số khách:       ${booking.adults} người lớn${booking.children > 0 ? `, ${booking.children} trẻ em` : ''}`,
    booking.voucher.meetingPoint ? `Điểm tập trung: ${booking.voucher.meetingPoint}` : '',
    '',
    `Mã voucher:     ${booking.voucher.code}`,
    `Tổng thanh toán: ${formatMoney(booking.financials.customerTotal, 'vi-VN')}`,
    '',
    `Xem voucher và mã QR: ${siteConfig.url}/dat-cho/thanh-cong/${booking.reference}`,
    '',
    'Xuất trình mã QR cho đối tác khi sử dụng dịch vụ. Voucher chỉ dùng được một lần.',
    '',
    `Cần hỗ trợ: ${siteConfig.contact.email} · ${siteConfig.contact.hotline}`,
  ].filter(Boolean).join('\n');

  return getNotificationSender().send({
    to: booking.contactEmail,
    template: 'booking.confirmed',
    locale: 'vi',
    subject: `Xác nhận đơn hàng ${booking.reference} — ${booking.serviceTitle}`,
    body,
    // Gắn với mã đơn nên gọi lại không gửi email thứ hai.
    dedupeKey: `booking.confirmed:${booking.reference}`,
  });
}

export async function sendReviewInvite(booking: StoredBooking): Promise<NotificationResult> {
  const body = [
    `Xin chào ${booking.travelers[0]?.fullName ?? 'quý khách'},`,
    '',
    `Bạn vừa hoàn thành "${booking.serviceTitle}". Chia sẻ trải nghiệm để giúp khách sau chọn đúng nhé.`,
    '',
    `Viết đánh giá: ${siteConfig.url}/tai-khoan/don-hang`,
  ].join('\n');

  return getNotificationSender().send({
    to: booking.contactEmail,
    template: 'review.invite',
    locale: 'vi',
    subject: `Bạn thấy "${booking.serviceTitle}" thế nào?`,
    body,
    dedupeKey: `review.invite:${booking.reference}`,
  });
}

export async function sendMerchantNewBooking(
  booking: StoredBooking,
  merchantEmail: string,
): Promise<NotificationResult> {
  const body = [
    `Bạn có đơn hàng mới trên DubaiWay: ${booking.reference}`,
    '',
    `Dịch vụ:      ${booking.serviceTitle} — ${booking.packageName}`,
    `Ngày sử dụng: ${dateLabel(booking.serviceDate)}`,
    `Khách:        ${booking.travelers[0]?.fullName ?? '—'} (${booking.adults + booking.children} người)`,
    booking.customerNote ? `Ghi chú:      ${booking.customerNote}` : '',
    '',
    `Bạn nhận:     ${formatMoney(booking.financials.merchantRevenue, 'vi-VN')}`,
    `Hoa hồng nền tảng: ${formatMoney(booking.financials.platformCommission, 'vi-VN')}`,
    '',
    `Xem chi tiết: ${siteConfig.url}/merchant/don-hang`,
  ].filter(Boolean).join('\n');

  return getNotificationSender().send({
    to: merchantEmail,
    template: 'booking.confirmed',
    locale: 'vi',
    subject: `Đơn hàng mới ${booking.reference}`,
    body,
    dedupeKey: `merchant.booking:${booking.reference}`,
  });
}
