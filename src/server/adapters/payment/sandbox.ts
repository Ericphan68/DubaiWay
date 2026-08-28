/**
 * Cổng thanh toán giả lập — dùng khi chưa có khoá Stripe.
 *
 * Mô phỏng đúng những đặc tính quan trọng của cổng thật:
 *  - idempotency: cùng khoá trả về cùng giao dịch, không tạo bản ghi thứ hai
 *  - không hoàn quá số đã thu
 *  - webhook có chữ ký và chữ ký sai thì từ chối
 *
 * KHÔNG dùng ở môi trường production: hàm isSandbox = true để UI cảnh báo rõ.
 */
import { type Money, money, subtract } from '@/core/money';
import type {
  CreateIntentInput, PaymentGateway, PaymentIntent, RefundInput, RefundResult, WebhookEvent,
} from './types';

const intents = new Map<string, PaymentIntent>();
const byIdempotencyKey = new Map<string, string>();
const refundedByIntent = new Map<string, Money>();

let counter = 0;
const nextId = (prefix: string) => `${prefix}_sandbox_${(counter += 1).toString().padStart(6, '0')}`;

export const sandboxGateway: PaymentGateway = {
  name: 'sandbox',
  isSandbox: true,

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    const existingId = byIdempotencyKey.get(input.idempotencyKey);
    if (existingId) {
      // Đây là điểm mấu chốt: gọi lại KHÔNG tạo giao dịch mới.
      return intents.get(existingId) as PaymentIntent;
    }
    const id = nextId('pi');
    const intent: PaymentIntent = {
      id,
      provider: 'sandbox',
      status: 'requires_action',
      amount: input.amount,
      clientSecret: `${id}_secret`,
      createdAt: new Date().toISOString(),
    };
    intents.set(id, intent);
    byIdempotencyKey.set(input.idempotencyKey, id);
    return intent;
  },

  async getIntent(intentId: string): Promise<PaymentIntent | null> {
    return intents.get(intentId) ?? null;
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const intent = intents.get(input.paymentIntentId);
    if (!intent) throw new Error(`Không tìm thấy giao dịch ${input.paymentIntentId}`);
    const already = refundedByIntent.get(intent.id) ?? money(0, intent.amount.currency);
    const remaining = subtract(intent.amount, already);
    if (input.amount.amount > remaining.amount) {
      throw new Error('Không thể hoàn nhiều hơn số tiền còn lại của giao dịch');
    }
    refundedByIntent.set(intent.id, money(already.amount + input.amount.amount, intent.amount.currency));
    return { id: nextId('re'), status: 'completed', amount: input.amount };
  },

  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    // Sandbox dùng chữ ký cố định để test được cả nhánh sai chữ ký.
    if (signature !== 'sandbox-signature') {
      throw new Error('Chữ ký webhook không hợp lệ');
    }
    const parsed = JSON.parse(rawBody) as { id?: string; type?: string; payment_intent?: string };
    return {
      id: parsed.id ?? nextId('evt'),
      type: parsed.type ?? 'payment_intent.succeeded',
      paymentIntentId: parsed.payment_intent ?? null,
      payload: parsed,
    };
  },
};

/** Chỉ dùng trong test — xoá trạng thái giữa các lần chạy. */
export function __resetSandbox(): void {
  intents.clear();
  byIdempotencyKey.clear();
  refundedByIntent.clear();
  counter = 0;
}

/** Chỉ dùng trong test/dev — giả lập khách thanh toán thành công. */
export function __markSucceeded(intentId: string): void {
  const intent = intents.get(intentId);
  if (intent) intents.set(intentId, { ...intent, status: 'succeeded' });
}
