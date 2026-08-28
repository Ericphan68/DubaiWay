/**
 * Giao diện cổng thanh toán.
 *
 * Ứng dụng chỉ nói chuyện qua interface này. Chưa có tài khoản Stripe vẫn chạy được
 * toàn bộ luồng đặt dịch vụ nhờ adapter sandbox. Khi có khoá thật, chỉ cần đặt
 * STRIPE_SECRET_KEY — không sửa một dòng nào ở tầng gọi.
 *
 * KHÔNG BAO GIỜ nhận, truyền hay lưu số thẻ trong hệ thống DubaiWay.
 * Thông tin thẻ do cổng thanh toán thu trực tiếp trên iframe/SDK của họ.
 */
import type { Money } from '@/core/money';

export interface CreateIntentInput {
  readonly bookingId: string;
  readonly amount: Money;
  readonly description: string;
  readonly customerEmail?: string;
  /** Khoá chống trùng — gọi lại cùng khoá phải trả về đúng giao dịch cũ. */
  readonly idempotencyKey: string;
  readonly metadata?: Record<string, string>;
}

export interface PaymentIntent {
  readonly id: string;
  readonly provider: string;
  readonly status: 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  readonly amount: Money;
  /** Chuỗi bí mật để SDK phía client hoàn tất thanh toán. */
  readonly clientSecret: string | null;
  readonly createdAt: string;
}

export interface RefundInput {
  readonly paymentIntentId: string;
  readonly amount: Money;
  readonly reason?: string;
  readonly idempotencyKey: string;
}

export interface RefundResult {
  readonly id: string;
  readonly status: 'processing' | 'completed' | 'failed';
  readonly amount: Money;
}

export interface WebhookEvent {
  readonly id: string;
  readonly type: string;
  readonly paymentIntentId: string | null;
  readonly payload: unknown;
}

export interface PaymentGateway {
  readonly name: string;
  /** true khi đây là bản giả lập, để UI hiện cảnh báo "chế độ thử nghiệm". */
  readonly isSandbox: boolean;
  createIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  getIntent(intentId: string): Promise<PaymentIntent | null>;
  refund(input: RefundInput): Promise<RefundResult>;
  /** Kiểm tra chữ ký webhook. Sai chữ ký PHẢI ném lỗi, không được bỏ qua. */
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;
}
