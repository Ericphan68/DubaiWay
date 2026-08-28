/**
 * Đọc và kiểm tra biến môi trường một lần, tại một chỗ.
 *
 * Thiếu khoá dịch vụ bên ngoài KHÔNG làm sập ứng dụng: hệ thống tự chuyển sang
 * chế độ sandbox dùng adapter giả lập, và ghi rõ ràng vào log những gì đang thiếu.
 * Nhờ vậy developer chạy được toàn bộ luồng trước khi có tài khoản Supabase/Stripe.
 */
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Supabase — thiếu thì dùng repository trong bộ nhớ.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  // Khoá service role CHỈ dùng phía server. Không bao giờ để lộ ra client.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Thanh toán — thiếu thì dùng cổng sandbox.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Email — thiếu thì ghi ra console.
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['vi', 'en']).default('vi'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3).default('USD'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Biến môi trường không hợp lệ:\n${issues}`);
}

export const env = parsed.data;

/** Có đủ cấu hình Supabase để dùng database thật không. */
export const hasSupabase = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Có đủ cấu hình Stripe để nhận thanh toán thật không. */
export const hasStripe = Boolean(env.STRIPE_SECRET_KEY);

/** Có gửi được email thật không. */
export const hasEmailProvider = Boolean(env.RESEND_API_KEY);

/** Liệt kê những gì đang thiếu — dùng để in cảnh báo lúc khởi động. */
export function missingIntegrations(): string[] {
  const missing: string[] = [];
  if (!hasSupabase) missing.push('Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) → dùng dữ liệu trong bộ nhớ');
  if (!hasStripe) missing.push('Stripe (STRIPE_SECRET_KEY) → dùng cổng thanh toán sandbox');
  if (!hasEmailProvider) missing.push('Email (RESEND_API_KEY) → email chỉ in ra console');
  return missing;
}
