-- ============================================================================
-- DubaiWay — 0004 REFERRAL & TÀI CHÍNH: mã giới thiệu, ví, sổ cái bất biến,
--                                        rút tiền, đối soát merchant
-- ============================================================================

-- ─── GIỚI THIỆU MỘT TẦNG ────────────────────────────────────────────────────
create table public.referral_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  code       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  -- Mỗi người đúng một mã đang hoạt động.
  unique (user_id)
);

-- Quan hệ giới thiệu. UNIQUE(referred_user_id) là điều BẮT BUỘC giữ hệ thống ở MỘT TẦNG:
-- mỗi người chỉ có tối đa một người giới thiệu trực tiếp, và hệ thống không bao giờ
-- truy ngược lên trên nữa. Không có cột parent/ancestor — không thể biến thành đa tầng.
create table public.referral_attributions (
  id                uuid primary key default gen_random_uuid(),
  referred_user_id  uuid not null unique references public.users(id) on delete cascade,
  referrer_user_id  uuid not null references public.users(id) on delete restrict,
  referral_code_id  uuid references public.referral_codes(id) on delete set null,
  status            text not null default 'active'
                    check (status in ('active','manual_review','rejected')),
  -- Tín hiệu thu thập lúc đăng ký, phục vụ rà gian lận.
  signup_ip         inet,
  device_fingerprint text,
  review_reasons    text[] not null default '{}',
  reviewed_by       uuid references public.users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  -- Chặn tự giới thiệu ở mức database.
  constraint attribution_no_self check (referrer_user_id <> referred_user_id)
);
create index on public.referral_attributions(referrer_user_id);

create table public.referral_rewards (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings(id) on delete restrict,
  referrer_user_id  uuid not null references public.users(id) on delete restrict,
  referred_user_id  uuid not null references public.users(id) on delete restrict,
  status            reward_status not null default 'pending',
  -- Ảnh chụp cách tính, để đổi cấu hình sau không làm sai lịch sử.
  commission_minor  bigint not null check (commission_minor >= 0),
  share_bps         integer not null check (share_bps between 0 and 10000),
  amount_minor      bigint not null check (amount_minor >= 0),
  currency          char(3) not null,
  available_at      timestamptz,
  paid_at           timestamptz,
  reversed_at       timestamptz,
  fraud_note        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Mỗi booking chỉ sinh đúng một khoản thưởng. Đây là chặn kỹ thuật cho "một tầng".
  unique (booking_id),
  constraint reward_no_self check (referrer_user_id <> referred_user_id)
);
create index on public.referral_rewards(referrer_user_id, status);

-- ─── VÍ ─────────────────────────────────────────────────────────────────────
-- Số dư KHÔNG được sửa trực tiếp. Nó là tổng của wallet_transactions
-- và được cập nhật bằng trigger khi có bút toán mới.
create table public.wallets (
  id                uuid primary key default gen_random_uuid(),
  owner_type        text not null check (owner_type in ('user','merchant')),
  user_id           uuid references public.users(id) on delete cascade,
  merchant_id       uuid references public.merchants(id) on delete cascade,
  currency          char(3) not null default 'AED',
  balance_available_minor bigint not null default 0,
  balance_pending_minor   bigint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint wallet_owner_exact_one check (
    (owner_type = 'user'     and user_id is not null and merchant_id is null) or
    (owner_type = 'merchant' and merchant_id is not null and user_id is null)
  )
);
create unique index wallets_user_currency on public.wallets(user_id, currency) where user_id is not null;
create unique index wallets_merchant_currency on public.wallets(merchant_id, currency) where merchant_id is not null;

-- Bút toán ví — CHỈ THÊM, không sửa, không xoá (trigger chặn ở 0005).
create table public.wallet_transactions (
  id             uuid primary key default gen_random_uuid(),
  wallet_id      uuid not null references public.wallets(id) on delete restrict,
  direction      ledger_direction not null,
  amount_minor   bigint not null check (amount_minor > 0),
  currency       char(3) not null,
  balance_kind   text not null default 'available' check (balance_kind in ('available','pending')),
  source_type    text not null,   -- 'referral_reward','withdrawal','settlement','adjustment','reversal'
  source_id      uuid,
  description    text,
  created_by     uuid references public.users(id),
  created_at     timestamptz not null default now()
);
create index on public.wallet_transactions(wallet_id, created_at desc);
create index on public.wallet_transactions(source_type, source_id);

-- ─── SỔ CÁI NỀN TẢNG ────────────────────────────────────────────────────────
-- Sổ cái kép, bất biến. Sửa sai bằng bút toán đảo, KHÔNG ghi đè bản ghi cũ.
create table public.ledger_entries (
  id             uuid primary key default gen_random_uuid(),
  entry_group    uuid not null,        -- các dòng của cùng một nghiệp vụ dùng chung id
  account        text not null,        -- 'customer_receivable','merchant_payable','platform_commission','referral_payable','tax_payable','platform_fee'
  direction      ledger_direction not null,
  amount_minor   bigint not null check (amount_minor > 0),
  currency       char(3) not null,
  booking_id     uuid references public.bookings(id) on delete restrict,
  merchant_id    uuid references public.merchants(id) on delete restrict,
  user_id        uuid references public.users(id) on delete restrict,
  source_type    text not null,
  source_id      uuid,
  -- Bút toán đảo trỏ về bút toán gốc.
  reverses_entry_id uuid references public.ledger_entries(id),
  memo           text,
  created_at     timestamptz not null default now()
);
create index on public.ledger_entries(entry_group);
create index on public.ledger_entries(booking_id);
create index on public.ledger_entries(account, created_at desc);

-- ─── RÚT TIỀN ───────────────────────────────────────────────────────────────
create table public.withdrawal_requests (
  id                uuid primary key default gen_random_uuid(),
  wallet_id         uuid not null references public.wallets(id) on delete restrict,
  requested_by      uuid not null references public.users(id),
  status            withdrawal_status not null default 'requested',
  amount_minor      bigint not null check (amount_minor > 0),
  currency          char(3) not null,
  -- Thông tin nhận tiền (ảnh chụp, để đổi tài khoản sau không làm sai lịch sử).
  payout_method     text not null default 'bank_transfer',
  payout_details    jsonb not null default '{}'::jsonb,
  reviewed_by       uuid references public.users(id),
  reviewed_at       timestamptz,
  rejection_reason  text,
  paid_at           timestamptz,
  external_ref      text,
  idempotency_key   text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.withdrawal_requests(wallet_id, status);

-- ─── ĐỐI SOÁT MERCHANT ──────────────────────────────────────────────────────
create table public.merchant_settlements (
  id                  uuid primary key default gen_random_uuid(),
  merchant_id         uuid not null references public.merchants(id) on delete restrict,
  period_start        date not null,
  period_end          date not null,
  status              settlement_status not null default 'pending',
  currency            char(3) not null,
  gross_sales_minor   bigint not null default 0,
  commission_minor    bigint not null default 0,
  refunds_minor       bigint not null default 0,
  adjustments_minor   bigint not null default 0,
  net_payable_minor   bigint not null default 0,
  bank_account_id     uuid references public.merchant_bank_accounts(id),
  paid_at             timestamptz,
  external_ref        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (merchant_id, period_start, period_end),
  constraint settlement_period_valid check (period_end >= period_start)
);
create index on public.merchant_settlements(merchant_id, status);

create table public.settlement_items (
  id            uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.merchant_settlements(id) on delete cascade,
  booking_id    uuid references public.bookings(id) on delete restrict,
  refund_id     uuid references public.refunds(id) on delete restrict,
  kind          text not null check (kind in ('sale','refund','adjustment')),
  amount_minor  bigint not null,
  currency      char(3) not null,
  memo          text,
  created_at    timestamptz not null default now()
);
create index on public.settlement_items(settlement_id);

-- ─── CẤU HÌNH HOA HỒNG ──────────────────────────────────────────────────────
-- Tỷ lệ KHÔNG ghi cứng trong mã nguồn. Bảng này là nguồn sự thật.
-- Có thể đặt riêng theo danh mục hoặc theo merchant; độ ưu tiên: merchant > category > toàn hệ thống.
create table public.commissions (
  id                  uuid primary key default gen_random_uuid(),
  scope               text not null check (scope in ('platform','category','merchant')),
  category_id         uuid references public.categories(id) on delete cascade,
  merchant_id         uuid references public.merchants(id) on delete cascade,
  commission_rate_bps integer not null check (commission_rate_bps between 0 and 10000),
  referral_share_bps  integer not null default 3000 check (referral_share_bps between 0 and 10000),
  commission_base     commission_base not null default 'subtotal_after_discount',
  effective_from      timestamptz not null default now(),
  effective_to        timestamptz,
  created_by          uuid references public.users(id),
  created_at          timestamptz not null default now(),
  constraint commission_scope_target check (
    (scope = 'platform' and category_id is null and merchant_id is null) or
    (scope = 'category' and category_id is not null) or
    (scope = 'merchant' and merchant_id is not null)
  )
);
create index on public.commissions(scope, effective_from desc);

-- ─── MÃ KHUYẾN MÃI ──────────────────────────────────────────────────────────
create table public.coupons (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  kind               text not null check (kind in ('percent','fixed')),
  percent_bps        integer check (percent_bps between 0 and 10000),
  amount_minor       bigint check (amount_minor >= 0),
  currency           char(3),
  min_order_minor    bigint not null default 0,
  max_discount_minor bigint,
  -- Ai chịu chi phí giảm giá: nền tảng hay merchant. Ảnh hưởng cách chia tiền.
  funded_by          text not null default 'platform' check (funded_by in ('platform','merchant')),
  usage_limit_total  integer,
  usage_limit_per_user integer not null default 1,
  used_count         integer not null default 0,
  starts_at          timestamptz,
  ends_at            timestamptz,
  category_id        uuid references public.categories(id) on delete cascade,
  merchant_id        uuid references public.merchants(id) on delete cascade,
  is_active          boolean not null default true,
  created_by         uuid references public.users(id),
  created_at         timestamptz not null default now(),
  constraint coupon_value_present check (
    (kind = 'percent' and percent_bps is not null) or
    (kind = 'fixed'   and amount_minor is not null and currency is not null)
  )
);

create table public.coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  coupon_id  uuid not null references public.coupons(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  discount_minor bigint not null check (discount_minor >= 0),
  currency   char(3) not null,
  created_at timestamptz not null default now(),
  unique (coupon_id, booking_id)
);
create index on public.coupon_redemptions(user_id);
