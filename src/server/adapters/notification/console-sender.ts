/**
 * Adapter ghi thông báo ra console — dùng khi chưa cấu hình dịch vụ email.
 *
 * KHÔNG im lặng nuốt thông báo: nội dung được in đầy đủ để lập trình viên đọc được,
 * và mỗi lần gọi đều trả kết quả rõ ràng đã gửi hay bị bỏ qua vì trùng.
 */
import type { NotificationMessage, NotificationResult, NotificationSender } from './types';

interface OutboxState { sentKeys: Set<string>; log: NotificationMessage[] }
const g = globalThis as unknown as { __dubaiwayOutbox?: OutboxState };
const state: OutboxState = (g.__dubaiwayOutbox ??= { sentKeys: new Set(), log: [] });

export const consoleSender: NotificationSender = {
  name: 'console',
  isConsoleOnly: true,

  async send(message: NotificationMessage): Promise<NotificationResult> {
    if (state.sentKeys.has(message.dedupeKey)) {
      return { sent: false, skipped: true, reason: 'Đã gửi trước đó (trùng dedupeKey)' };
    }
    state.sentKeys.add(message.dedupeKey);
    state.log.push(message);

    // Không ghi dữ liệu nhạy cảm — chỉ tiêu đề, người nhận và nội dung soạn sẵn.
    console.info(
      [
        '',
        '─── THÔNG BÁO (chế độ console, chưa cấu hình email) ───',
        `Tới:      ${message.to}`,
        `Mẫu:      ${message.template}`,
        `Tiêu đề:  ${message.subject}`,
        '',
        message.body,
        '───────────────────────────────────────────────────────',
      ].join('\n'),
    );
    return { sent: true, skipped: false };
  },
};

/** Đọc lại các thông báo đã gửi — dùng cho kiểm thử và trang quản trị. */
export function sentNotifications(): readonly NotificationMessage[] {
  return state.log;
}

export function __resetNotifications(): void {
  state.sentKeys.clear();
  state.log.length = 0;
}
