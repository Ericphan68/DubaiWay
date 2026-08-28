/**
 * Chọn cổng thanh toán theo cấu hình.
 *
 * Adapter Stripe chưa được cài trong bản này (chưa có khoá API để kiểm thử thật).
 * Khi bổ sung, chỉ cần tạo file stripe.ts implement PaymentGateway rồi trả về ở đây —
 * không có tầng nào khác phải sửa.
 *
 * Biến môi trường cần cho Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
 */
import { hasStripe } from '@/server/env';
import { sandboxGateway } from './sandbox';
import type { PaymentGateway } from './types';

export function getPaymentGateway(): PaymentGateway {
  if (hasStripe) {
    // Chưa triển khai. Không im lặng dùng sandbox ở production — báo lỗi rõ ràng
    // còn hơn để đơn hàng thật đi qua cổng giả lập.
    throw new Error(
      'Đã cấu hình STRIPE_SECRET_KEY nhưng adapter Stripe chưa được triển khai. ' +
        'Tạo src/server/adapters/payment/stripe.ts implement PaymentGateway, hoặc bỏ biến này để dùng sandbox.',
    );
  }
  return sandboxGateway;
}

export * from './types';
