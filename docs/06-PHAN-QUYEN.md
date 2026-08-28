# 6. Ma trận phân quyền

Phân quyền thực thi ở **hai lớp**: RLS trong database (không vượt qua được) và kiểm tra ở tầng service. Lớp database là lớp quyết định.

## Vai trò

| Vai trò | Phạm vi |
|---|---|
| `super_admin` | Nền tảng — toàn quyền, kể cả phân quyền và cấu hình |
| `merchant_reviewer` | Nền tảng — duyệt hồ sơ KYC/KYB |
| `service_reviewer` | Nền tảng — duyệt dịch vụ |
| `customer_support` | Nền tảng — hỗ trợ khách, xem đơn |
| `finance` | Nền tảng — thanh toán, hoàn tiền, đối soát, rút tiền |
| `dispute_officer` | Nền tảng — khiếu nại, tranh chấp |
| `content_manager` | Nền tảng — trang nội dung, blog, danh mục |
| `marketing` | Nền tảng — khuyến mãi, banner |
| `merchant_owner` | Merchant — toàn quyền trong merchant của mình |
| `merchant_staff` | Merchant — dịch vụ và đơn hàng |
| `merchant_scanner` | Merchant — chỉ quét voucher |
| `customer` | Chính mình |

## Ma trận quyền

| Quyền | super | mch_rev | svc_rev | support | finance | dispute | content | mkt |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `merchant.review` | ✓ | ✓ | | | | | | |
| `service.review` | ✓ | | ✓ | | | | | |
| `category.manage` | ✓ | | ✓ | | | | ✓ | |
| `booking.read_all` | ✓ | | | ✓ | ✓ | ✓ | | |
| `booking.manage` | ✓ | | | | | | | |
| `finance.manage` | ✓ | | | | ✓ | | | |
| `refund.manage` | ✓ | | | | ✓ | ✓ | | |
| `dispute.manage` | ✓ | | | | | ✓ | | |
| `review.moderate` | ✓ | | | | | ✓ | | |
| `referral.manage` | ✓ | | | | ✓ | | | |
| `content.manage` | ✓ | | | | | | ✓ | |
| `marketing.manage` | ✓ | | | | | | | ✓ |
| `support.manage` | ✓ | | | ✓ | | | | |
| `audit.read` | ✓ | ✓ | | | ✓ | | | |
| `settings.manage` | ✓ | | | | | | | |
| `user.manage` | ✓ | | | | | | | |
| `role.manage` | ✓ | | | | | | | |

## Ai thấy được gì

| Dữ liệu | Khách vãng lai | Customer | Merchant | Admin |
|---|:-:|:-:|:-:|:-:|
| Dịch vụ `active` của merchant `approved` | ✓ | ✓ | ✓ | ✓ |
| Dịch vụ nháp / chờ duyệt | | | chỉ của mình | ✓ |
| Hồ sơ merchant `approved` | ✓ | ✓ | ✓ | ✓ |
| **Giấy tờ KYC/KYB** | | | **chỉ của mình** | chỉ `merchant.review` |
| **Tài khoản ngân hàng merchant** | | | **chỉ của mình** | chỉ `finance.manage` |
| Đơn hàng | | của mình | của merchant mình | `booking.read_all` |
| Thông tin thanh toán | | của mình | | `finance.manage` |
| Sổ cái | | | | `finance.manage` |
| Ví & giao dịch ví | | của mình | của merchant mình | `finance.manage` |
| Đánh giá công khai | ✓ | ✓ | ✓ | ✓ |
| Đánh giá bị ẩn | | tác giả | | ✓ |
| Nhật ký hệ thống | | | | `audit.read` |

## Ràng buộc đặc biệt

- **Không ai tự nâng quyền cho mình**: `user_roles` chỉ `super_admin` ghi được.
- **Merchant không sửa được đánh giá**: chỉ được ghi vào bảng `merchant_responses` riêng.
- **Chỉ khách có booking `completed` mới viết đánh giá** — kiểm ngay trong RLS policy:
  ```sql
  create policy reviews_insert_completed_only on reviews for insert with check (
    user_id = auth.uid() and exists (
      select 1 from bookings b
       where b.id = booking_id and b.user_id = auth.uid() and b.status = 'completed'));
  ```
- **Merchant chỉ quét được voucher của chính mình** — kiểm trong `redeem_voucher()`.
- **Khách không sửa được tồn kho**: chỉ merchant sở hữu và hàm server `SECURITY DEFINER`.
- **Mọi thao tác quan trọng ghi `audit_logs`**: ai, lúc nào, dữ liệu trước/sau, lý do. Bảng bất biến. **Không ghi dữ liệu nhạy cảm vào log.**
