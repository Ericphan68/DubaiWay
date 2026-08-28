# Hướng dẫn thiết lập

## Chạy ngay, không cần tài khoản nào

```bash
npm install
cp .env.example .env.local
npm run dev
```

Thiếu Supabase/Stripe/email, ứng dụng **vẫn chạy**: dùng repository trong bộ nhớ, cổng thanh toán sandbox, email in ra console. Cảnh báo được in rõ lúc khởi động.

## Tài khoản demo (chế độ chưa kết nối Supabase)

Mật khẩu dùng chung: `DubaiWay!2026`

| Email | Vai trò | Vào được |
|---|---|---|
| `admin@dubaiway.test` | Super Admin | `/admin` |
| `finance@dubaiway.test` | Finance | `/admin` (không duyệt được đối tác) |
| `reviewer@dubaiway.test` | Merchant + Service Reviewer | `/admin/merchant`, `/admin/dich-vu` |
| `desertrose@example.test` | Chủ đối tác | `/merchant`, `/merchant/quet-ma` |
| `linh@example.test` | Khách hàng | `/tai-khoan` |

Tài khoản demo chỉ tồn tại ở chế độ trong bộ nhớ. Khi kết nối Supabase, tạo tài khoản thật
qua trang đăng ký và cấp vai trò trong bảng `user_roles`.

## Kiểm chứng toàn bộ

```bash
npm run verify
```

Chạy lần lượt: kiểm tra kiểu → ESLint → 180 test → thực thi toàn bộ migration + seed lên PostgreSQL thật.

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run test` | Chạy kiểm thử |
| `npm run test:watch` | Kiểm thử ở chế độ theo dõi |
| `npm run type-check` | Kiểm tra kiểu TypeScript |
| `npm run lint` | ESLint |
| `npm run db:verify` | Thực thi migration + seed lên Postgres (PGlite) |

## Kết nối Supabase thật

1. Tạo project tại supabase.com
2. `Project Settings → API`, lấy `URL` và `anon key`
3. Điền vào `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Chạy migration — mở `SQL Editor` rồi dán lần lượt **theo đúng thứ tự**:
   ```
   supabase/migrations/0001_core.sql
   supabase/migrations/0002_catalog.sql
   supabase/migrations/0003_commerce.sql
   supabase/migrations/0004_referral_finance.sql
   supabase/migrations/0005_content_ops.sql
   supabase/migrations/0006_rls.sql
   supabase/migrations/0007_functions.sql
   supabase/migrations/0008_roles_settings.sql
   ```
   Hoặc dùng Supabase CLI: `supabase db push`
5. Nạp dữ liệu mẫu: dán `supabase/seed.sql`
6. Tạo bucket **riêng tư** tên `kyc-documents` cho giấy tờ merchant. **Không** đặt public.

`SUPABASE_SERVICE_ROLE_KEY` bỏ qua toàn bộ RLS. Chỉ dùng ở server, không bao giờ đưa vào bundle client.

## Kết nối Stripe

Adapter Stripe **chưa được triển khai** vì chưa có khoá API để kiểm thử thật.

Khi có tài khoản:
1. Tạo `src/server/adapters/payment/stripe.ts` implement interface `PaymentGateway`
2. Trả về nó trong `getPaymentGateway()`
3. Đặt biến:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   ```

Hiện tại, nếu đặt `STRIPE_SECRET_KEY` mà chưa có adapter thì hệ thống **báo lỗi rõ ràng** thay vì âm thầm dùng sandbox — để không có đơn hàng thật nào đi qua cổng giả lập.

Tiền quyết toán của sàn là USD (`PLATFORM_CURRENCY` trong `src/core/money.ts`). Stripe hỗ trợ USD và AED. Nếu cần phương án nội địa, hai lựa chọn phổ biến là Network International và Telr; cả hai đều lắp vào cùng interface `PaymentGateway` mà không đổi tầng gọi.

## Biến môi trường cần cung cấp

| Biến | Bắt buộc | Thiếu thì sao |
|---|:-:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | | Dùng dữ liệu trong bộ nhớ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | | Dùng dữ liệu trong bộ nhớ |
| `SUPABASE_SERVICE_ROLE_KEY` | | Không chạy được thao tác cần quyền cao |
| `STRIPE_SECRET_KEY` | | Dùng cổng sandbox |
| `STRIPE_WEBHOOK_SECRET` | | Không xác thực được webhook |
| `RESEND_API_KEY` | | Email in ra console |
| `NEXT_PUBLIC_SITE_URL` | ✓ | Mặc định `http://localhost:3000`, làm sai thẻ OG |

Không đưa bất kỳ khoá nào vào mã nguồn.
