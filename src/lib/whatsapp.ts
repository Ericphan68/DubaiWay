import { siteConfig } from '@/config/site';

/**
 * Sinh link WhatsApp với tin nhắn mẫu theo ngữ cảnh trang.
 * Số điện thoại lấy từ config (không hardcode trong component).
 */
export function whatsappLink(message: string): string {
  const digits = siteConfig.contact.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Tin nhắn mẫu theo từng khu vực trang. */
export const whatsappMessages = {
  default: 'Xin chào DubaiWay, tôi muốn được tư vấn về dịch vụ du lịch.',
  flights: 'Xin chào DubaiWay, tôi muốn nhờ kiểm tra vé máy bay.',
  hotels: 'Xin chào DubaiWay, tôi muốn nhờ tư vấn đặt khách sạn.',
  tours: 'Xin chào DubaiWay, tôi muốn được tư vấn về tour.',
  visa: 'Xin chào DubaiWay, tôi muốn kiểm tra điều kiện visa.',
  events: 'Xin chào DubaiWay Events, tôi muốn nhận tư vấn tổ chức sự kiện.',
  holyland: 'Xin chào DubaiWay, tôi muốn tìm hiểu hành trình Holy Land.',
  dubai: 'Xin chào DubaiWay, tôi muốn đặt trải nghiệm tại Dubai.',
  signature: 'Xin chào DubaiWay, tôi muốn được tư vấn hành trình Signature.',
} as const;

export type WhatsappContext = keyof typeof whatsappMessages;
