import { hasEmailProvider } from '@/server/env';
import { consoleSender } from './console-sender';
import type { NotificationSender } from './types';

/**
 * Chọn kênh gửi thông báo.
 *
 * Adapter email thật (Resend) chưa triển khai vì chưa có khoá API để kiểm thử.
 * Khi bổ sung, tạo resend-sender.ts implement NotificationSender rồi trả về ở đây.
 * Nếu đã đặt RESEND_API_KEY mà chưa có adapter thì BÁO LỖI rõ ràng, không âm thầm
 * chuyển sang console — để không có email giao dịch nào bị mất trong im lặng.
 */
export function getNotificationSender(): NotificationSender {
  if (hasEmailProvider) {
    throw new Error(
      'Đã cấu hình RESEND_API_KEY nhưng adapter email chưa được triển khai. ' +
        'Tạo src/server/adapters/notification/resend-sender.ts implement NotificationSender, ' +
        'hoặc bỏ biến này để dùng chế độ console.',
    );
  }
  return consoleSender;
}

export * from './types';
export { sentNotifications } from './console-sender';
