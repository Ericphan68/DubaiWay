/**
 * Gửi thông báo cho người dùng.
 *
 * Ứng dụng chỉ gọi qua interface này. Chưa có khoá dịch vụ email thì dùng adapter
 * ghi ra console — luồng vẫn chạy đủ và lập trình viên thấy được nội dung sẽ gửi.
 * Lớp SMS/WhatsApp bổ sung sau bằng cách thêm adapter, không sửa tầng gọi.
 */
export type NotificationTemplate =
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.reminder'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'refund.processed'
  | 'voucher.issued'
  | 'review.invite'
  | 'merchant.submitted'
  | 'merchant.approved'
  | 'merchant.changes_requested'
  | 'merchant.rejected'
  | 'service.approved'
  | 'service.changes_requested'
  | 'referral.reward_available'
  | 'withdrawal.requested'
  | 'withdrawal.paid'
  | 'dispute.opened'
  | 'account.welcome'
  | 'account.verify_email'
  | 'account.password_reset';

export interface NotificationMessage {
  readonly to: string;
  readonly template: NotificationTemplate;
  readonly locale: 'vi' | 'en';
  readonly subject: string;
  readonly body: string;
  readonly data?: Record<string, string | number>;
  /**
   * Khoá chống gửi trùng. Cùng khoá gọi lại sẽ không gửi lần hai —
   * quan trọng vì webhook thanh toán có thể tới nhiều lần.
   */
  readonly dedupeKey: string;
}

export interface NotificationResult {
  readonly sent: boolean;
  readonly skipped: boolean;
  readonly reason?: string;
}

export interface NotificationSender {
  readonly name: string;
  readonly isConsoleOnly: boolean;
  send(message: NotificationMessage): Promise<NotificationResult>;
}
