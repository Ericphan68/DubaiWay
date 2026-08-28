# 5. Database schema

**65 bảng · 115 RLS policy · 158 index · 15 kiểu enum · 15 hàm.**
Toàn bộ đã được **thực thi thật** trên PostgreSQL qua `npm run db:verify`.

## Quy ước bắt buộc

| Quy ước | Lý do |
|---|---|
| Tiền: `BIGINT` đơn vị nhỏ nhất + `CHAR(3)` currency | Số thực làm sai lệch tiền |
| Không `FLOAT`/`REAL`/`MONEY` ở bất kỳ đâu | Kiểm chứng tự động trong `db:verify` |
| Tỷ lệ: `INTEGER` basis points | 1000 = 10%, luôn nguyên |
| Khoá chính `UUID` | Không lộ quy mô dữ liệu qua URL |
| `created_at` / `updated_at` mọi bảng | `updated_at` do trigger tự cập nhật |

## Nhóm bảng

**Danh tính & phân quyền (7)**
`users` `profiles` `saved_travelers` `roles` `permissions` `role_permissions` `user_roles`

**Merchant (5)**
`merchants` `merchant_members` `merchant_documents` `merchant_bank_accounts` `merchant_review_history`

**Danh mục & dịch vụ (14)**
`categories` `category_translations` `services` `service_translations` `service_media` `service_itinerary` `service_packages` `package_translations` `package_price_rules` `service_availability` `service_blackout_dates` `service_policies` `service_review_history` `favorites`

**Đặt hàng & thanh toán (15)**
`booking_drafts` `bookings` `booking_items` `booking_travelers` `payments` `payment_events` `vouchers` `voucher_redemptions` `cancellations` `refunds` `disputes` `dispute_messages` `reviews` `review_media` `merchant_responses`

**Giới thiệu & tài chính (12)**
`referral_codes` `referral_attributions` `referral_rewards` `wallets` `wallet_transactions` `ledger_entries` `withdrawal_requests` `merchant_settlements` `settlement_items` `commissions` `coupons` `coupon_redemptions`

**Nội dung & vận hành (12)**
`notifications` `notification_outbox` `support_tickets` `support_messages` `pages` `page_translations` `blog_posts` `blog_post_translations` `banners` `banner_translations` `audit_logs` `platform_settings`

## Ràng buộc quan trọng nhất

**Sổ sách phải cân — kiểm ngay ở database:**
```sql
constraint booking_total_balances check (
  customer_total_minor = subtotal_minor - discount_minor + tax_minor + fee_minor)
constraint booking_commission_balances check (
  merchant_revenue_minor + platform_commission_minor = commission_base_minor)
constraint booking_referral_balances check (
  referral_reward_minor + platform_net_minor = platform_commission_minor)
```

**Không bao giờ bán quá số chỗ:**
```sql
constraint availability_not_oversold check (capacity_reserved <= capacity_total)
```

**Voucher chỉ dùng một lần, kể cả khi hai máy quét cùng lúc:**
```sql
create unique index voucher_single_successful_redemption
  on voucher_redemptions(voucher_id) where outcome = 'success';
```

**Chống tự giới thiệu, chặn ở hai nơi:**
```sql
constraint booking_no_self_referral check (referrer_user_id <> user_id)
constraint attribution_no_self     check (referrer_user_id <> referred_user_id)
```

**Giới thiệu một tầng — không thể biểu diễn nhiều tầng:**
```sql
referred_user_id uuid not null UNIQUE   -- mỗi người tối đa MỘT người giới thiệu
-- Bảng KHÔNG có parent_id, ancestor_id, level, path.
-- Không hàm nào duyệt đệ quy chuỗi giới thiệu.
```

**Chống trùng thanh toán và webhook:**
```sql
payments.idempotency_key           UNIQUE
payment_events(provider, event_id) UNIQUE
```

**Lịch sử tài chính bất biến — trigger chặn sửa/xoá:**
`ledger_entries` · `wallet_transactions` · `audit_logs` · `merchant_review_history` · `service_review_history`

## Hàm chống chạy đồng thời

| Hàm | Bảo đảm |
|---|---|
| `hold_inventory(availability_id, seats)` | `SELECT … FOR UPDATE` khoá dòng tồn kho. Hai người tranh chỗ cuối → một người bị từ chối. |
| `release_inventory(...)` | Trả chỗ khi huỷ hoặc hết hạn giữ. |
| `redeem_voucher(code, merchant_id)` | Khoá dòng voucher + unique index. Quét lần hai trả `duplicate`. |
| `resolve_commission(merchant_id, category_id)` | Ưu tiên merchant > danh mục > nền tảng. |
| `get_direct_referrer(user_id)` | Trả **đúng một** người, cố ý không đệ quy. |

## Chạy migration

```bash
npm run db:verify     # thực thi toàn bộ migration + seed lên Postgres thật (PGlite)
```

Trên Supabase: `supabase db push` rồi `supabase db seed`, hoặc dán lần lượt 8 file trong `supabase/migrations/` vào SQL Editor theo đúng thứ tự tên file.
