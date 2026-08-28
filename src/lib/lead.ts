/**
 * Chuyển nội dung form thành tin nhắn gửi thẳng cho đội tư vấn.
 *
 * Trước đây các form chỉ hiện "Đã gửi!" rồi vứt dữ liệu đi — khách tưởng đã liên hệ
 * được, còn DubaiWay không nhận được gì. Ở đây form mở WhatsApp (hoặc email) kèm
 * sẵn toàn bộ thông tin khách vừa điền, nên yêu cầu chắc chắn tới nơi.
 *
 * Đây là giải pháp cho giai đoạn chuyển tiếp. Khi backend nhận lead sẵn sàng,
 * thay hàm sendLead bằng lời gọi server action — các form không phải sửa.
 */
import { siteConfig } from '@/config/site';

export interface LeadField {
  readonly label: string;
  readonly value: string | undefined | null;
}

/** Ghép các trường thành tin nhắn dễ đọc, bỏ qua trường trống. */
export function formatLead(title: string, fields: readonly LeadField[]): string {
  const lines = fields
    .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
    .map((f) => `• ${f.label}: ${String(f.value).trim()}`);
  return [`Xin chào DubaiWay, tôi muốn ${title}.`, '', ...lines].join('\n');
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailtoUrl(subject: string, message: string): string {
  return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

/** Đọc toàn bộ dữ liệu form theo thứ tự các trường được khai báo. */
export function readForm(form: HTMLFormElement, fields: readonly { name: string; label: string }[]): LeadField[] {
  const data = new FormData(form);
  return fields.map((f) => ({ label: f.label, value: data.get(f.name)?.toString() ?? null }));
}
