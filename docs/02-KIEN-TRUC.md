# 2. Kiến trúc đề xuất

## Sơ đồ tầng

```
┌──────────────────────────────────────────────────────────────┐
│  Giao diện — Next.js App Router (RSC + Client Component)     │
│  Website công khai · Customer · Merchant · Admin             │
└───────────────────────────┬──────────────────────────────────┘
                            │ chỉ gọi qua interface
┌───────────────────────────▼──────────────────────────────────┐
│  src/server/services  — nghiệp vụ                            │
│  báo giá · giữ chỗ · đặt hàng · voucher · hoàn tiền · thưởng  │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ src/core      │  │ repositories    │  │ adapters         │
│ tiền, hoa hồng│  │ Supabase │ nhớ  │  │ payment │ email  │
│ referral,     │  │                 │  │ (thật) │(sandbox)│
│ máy trạng thái│  └────────┬────────┘  └──────────────────┘
└───────────────┘           ▼
                  ┌──────────────────────┐
                  │ PostgreSQL (Supabase)│
                  │ RLS · trigger · hàm  │
                  └──────────────────────┘
```

## Quyết định kiến trúc và lý do

**1. Tiền là số nguyên, không phải số thực.**
Mọi giá trị tài chính lưu bằng `BIGINT` theo đơn vị nhỏ nhất (fils, cent, đồng) kèm mã tiền tệ. Số thực làm `0.1 + 0.2 !== 0.3`; với hàng nghìn giao dịch, sai số tích luỹ thành chênh lệch đối soát không giải thích được. Kiểu `Money` trong `src/core/money.ts` từ chối số thập phân ngay lúc tạo.

**2. Tỷ lệ dùng basis points, không dùng phần trăm thập phân.**
10% = `1000` bp. Tỷ lệ luôn là số nguyên nên phép nhân không sinh sai số.

**3. Ảnh chụp (snapshot) mọi tỷ lệ vào từng booking.**
Đổi hoa hồng từ 10% sang 12% năm sau **không được** làm thay đổi con số của đơn hàng năm nay. Mỗi booking lưu `commission_rate_bps`, `referral_share_bps`, `commission_base` tại thời điểm đặt.

**4. Sổ cái bất biến.**
`ledger_entries` và `wallet_transactions` chỉ được THÊM. Trigger database chặn `UPDATE`/`DELETE`. Sửa sai bằng bút toán đảo. Không bao giờ ghi đè lịch sử tài chính.

**5. Ràng buộc nghiệp vụ đặt ở database, không chỉ ở code.**
Sổ sách cân, không bán quá chỗ, voucher dùng một lần, chống tự giới thiệu — tất cả là `CHECK constraint`, `UNIQUE index` và hàm khoá dòng. Lỗi ở tầng ứng dụng không thể làm hỏng dữ liệu.

**6. Row Level Security mặc định từ chối.**
Bật RLS cho toàn bộ 65 bảng rồi mở đúng những gì cần. Quên kiểm tra quyền ở một API không làm lộ dữ liệu, vì database vẫn chặn.

**7. Giới thiệu một tầng chặn ở mức thiết kế.**
Bảng `referral_attributions` có `UNIQUE(referred_user_id)`, không có cột `parent_id`/`ancestor_id`/`level`/`path`, và không có hàm đệ quy nào duyệt cây. Cấu trúc dữ liệu **không thể** biểu diễn nhiều tầng.

**8. Adapter cho mọi dịch vụ bên ngoài.**
Thiếu khoá Supabase → repository trong bộ nhớ. Thiếu khoá Stripe → cổng sandbox. Thiếu khoá email → in ra console. Lập trình viên chạy được toàn bộ luồng ngay sau khi clone. Nhưng nếu đã đặt `STRIPE_SECRET_KEY` mà adapter chưa triển khai thì **báo lỗi rõ ràng**, không âm thầm dùng sandbox cho đơn hàng thật.

**9. Đa ngôn ngữ tách bảng, không tách cột.**
`service_translations`, `category_translations`, `page_translations`… nhận `locale in ('vi','en','ar')`. Thêm tiếng Ả Rập không cần đổi schema, chỉ cần thêm bản dịch và bật trong `ENABLED_LOCALES`.

## Cấu trúc thư mục mới

```
src/
  core/                 Nghiệp vụ thuần, không phụ thuộc framework
    money.ts            Kiểu Money, phép tính an toàn, làm tròn
    pricing.ts          Hoa hồng, thưởng giới thiệu, bút toán hoàn tiền
    referral.ts         Một tầng, chống gian lận, trạng thái thưởng
    state-machines.ts   Máy trạng thái merchant/service/booking/voucher
  server/
    env.ts              Đọc & kiểm tra biến môi trường
    repositories/       Interface + bản Supabase + bản trong bộ nhớ
    services/           Nghiệp vụ ghép nhiều repository
    adapters/           Cổng thanh toán, gửi thông báo
    db/                 Tiện ích kiểm thử database
  i18n/                 Cấu hình ngôn ngữ + từ điển
  app/ components/ …    Giao diện (giữ nguyên phần hiện có)
supabase/
  migrations/           8 file SQL, chạy tuần tự
  seed.sql              Dữ liệu mẫu Dubai
scripts/
  verify-schema.mjs     Chạy migration lên Postgres thật để kiểm chứng
```
