-- ============================================================================
-- DubaiWay — 0001 CORE: extensions, enum, danh tính, phân quyền, merchant
-- ============================================================================
-- QUY ƯỚC TOÀN HỆ THỐNG
--  * Tiền: BIGINT theo đơn vị nhỏ nhất (fils/cent/đồng) + cột currency CHAR(3).
--    KHÔNG dùng FLOAT/REAL/DOUBLE cho bất kỳ giá trị tài chính nào.
--  * Tỷ lệ: INTEGER basis points (1000 = 10%).
--  * Mọi bảng có created_at/updated_at; bảng nghiệp vụ có audit qua audit_logs.
--  * Khoá chính UUID để không lộ quy mô dữ liệu ra URL.
-- ============================================================================

-- gen_random_uuid() là hàm lõi từ PostgreSQL 13 nên không cần pgcrypto.
-- citext dùng cho email để so sánh không phân biệt hoa thường.
create extension if not exists "citext";

-- ─── ENUM ───────────────────────────────────────────────────────────────────
create type merchant_kind          as enum ('business', 'individual');
create type merchant_status        as enum ('draft','submitted','under_review','changes_requested','approved','rejected','suspended');
create type service_status         as enum ('draft','submitted','under_review','changes_requested','approved','active','inactive','suspended');
create type booking_status         as enum ('draft','pending_payment','paid','confirmed','completed','cancelled','refunded','expired');
create type voucher_status         as enum ('issued','confirmed','redeemed','expired','cancelled','refunded');
create type payment_status         as enum ('requires_action','processing','succeeded','failed','cancelled','refunded','partially_refunded');
create type refund_status          as enum ('requested','approved','rejected','processing','completed','failed');
create type dispute_status         as enum ('open','under_review','awaiting_customer','awaiting_merchant','resolved','rejected','escalated');
create type reward_status          as enum ('pending','held','available','withdrawal_requested','paid','cancelled','reversed','fraud_review');
create type withdrawal_status      as enum ('requested','under_review','approved','processing','paid','rejected','cancelled');
create type settlement_status      as enum ('pending','ready','processing','paid','failed');
create type document_status        as enum ('pending','verified','rejected','expired');
create type notification_channel   as enum ('in_app','email','sms','whatsapp');
create type commission_base        as enum ('subtotal_after_discount','customer_total');
create type ledger_direction       as enum ('debit','credit');

-- ─── DANH TÍNH ──────────────────────────────────────────────────────────────
-- users: ánh xạ 1-1 với auth.users của Supabase. Không lưu mật khẩu ở đây.
create table public.users (
  id                uuid primary key,               -- = auth.users.id
  email             citext not null unique,
  phone             text,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  status            text not null default 'active'
                    check (status in ('active','suspended','deleted')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.profiles (
  user_id       uuid primary key references public.users(id) on delete cascade,
  full_name     text,
  display_name  text,
  avatar_url    text,
  date_of_birth date,
  nationality   char(2),
  address_line1 text,
  address_line2 text,
  city          text,
  country       char(2),
  postal_code   text,
  locale        text not null default 'vi' check (locale in ('vi','en','ar')),
  currency      char(3) not null default 'USD',
  marketing_opt_in boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Người đi cùng lưu sẵn để đặt nhanh lần sau.
create table public.saved_travelers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  full_name      text not null,
  date_of_birth  date,
  nationality    char(2),
  passport_number_encrypted text,   -- mã hoá ở tầng ứng dụng, không lưu thô
  passport_expiry date,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on public.saved_travelers(user_id);

-- ─── PHÂN QUYỀN ─────────────────────────────────────────────────────────────
create table public.roles (
  key         text primary key,          -- 'super_admin', 'finance', 'customer'…
  name        text not null,
  scope       text not null check (scope in ('platform','merchant','customer')),
  description text,
  created_at  timestamptz not null default now()
);

create table public.permissions (
  key         text primary key,          -- 'merchant.approve', 'refund.issue'…
  description text not null
);

create table public.role_permissions (
  role_key       text not null references public.roles(key) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  role_key    text not null references public.roles(key) on delete cascade,
  -- NULL = vai trò cấp nền tảng. Có giá trị = chỉ có hiệu lực trong merchant đó.
  -- Không đưa cột này vào khoá chính vì khoá chính không cho phép NULL.
  merchant_id uuid,
  granted_by  uuid references public.users(id),
  granted_at  timestamptz not null default now()
);
create index on public.user_roles(user_id);
-- Một người không được cấp trùng cùng một vai trò trong cùng phạm vi.
create unique index user_roles_platform_uniq
  on public.user_roles(user_id, role_key) where merchant_id is null;
create unique index user_roles_merchant_uniq
  on public.user_roles(user_id, role_key, merchant_id) where merchant_id is not null;

-- ─── MERCHANT ───────────────────────────────────────────────────────────────
create table public.merchants (
  id                    uuid primary key default gen_random_uuid(),
  kind                  merchant_kind not null,
  status                merchant_status not null default 'draft',
  slug                  text unique,
  -- Doanh nghiệp
  legal_name            text,
  trading_name          text,
  registration_country  char(2),
  registration_number   text,
  tax_number            text,
  -- Cá nhân
  individual_full_name  text,
  individual_dob        date,
  individual_nationality char(2),
  -- Chung
  address_line1         text,
  address_line2         text,
  city                  text,
  country               char(2),
  postal_code           text,
  contact_email         citext,
  contact_phone         text,
  website_url           text,
  social_links          jsonb not null default '{}'::jsonb,
  logo_url              text,
  description           text,
  experience_summary    text,
  -- Người đại diện pháp luật
  legal_rep_name        text,
  legal_rep_position    text,
  legal_rep_email       citext,
  legal_rep_phone       text,
  -- Chính sách riêng của merchant
  cancellation_policy   text,
  complaint_policy      text,
  -- Hoa hồng riêng (nếu thương lượng khác mặc định nền tảng). NULL = dùng mặc định.
  commission_rate_bps   integer check (commission_rate_bps between 0 and 10000),
  owner_user_id         uuid not null references public.users(id),
  submitted_at          timestamptz,
  approved_at           timestamptz,
  approved_by           uuid references public.users(id),
  rejection_reason      text,
  suspended_reason      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- Doanh nghiệp bắt buộc có tên pháp lý; cá nhân bắt buộc có họ tên.
  constraint merchant_identity_present check (
    (kind = 'business'   and legal_name is not null) or
    (kind = 'individual' and individual_full_name is not null) or
    status = 'draft'
  )
);
create index on public.merchants(status);
create index on public.merchants(owner_user_id);

-- Thành viên vận hành của merchant.
create table public.merchant_members (
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  role_key    text not null references public.roles(key),
  invited_by  uuid references public.users(id),
  created_at  timestamptz not null default now(),
  primary key (merchant_id, user_id)
);

-- Giấy tờ KYC/KYB. LƯU Ý BẢO MẬT: storage_path trỏ vào bucket PRIVATE.
-- Không bao giờ sinh URL công khai; chỉ dùng signed URL có hạn ngắn.
create table public.merchant_documents (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  doc_type      text not null,   -- 'trade_license','passport','emirates_id','tax_cert','tourism_license','selfie'…
  storage_path  text not null,   -- bucket riêng tư 'kyc-documents'
  file_name     text,
  mime_type     text,
  size_bytes    bigint,
  status        document_status not null default 'pending',
  expires_at    date,
  reviewed_by   uuid references public.users(id),
  reviewed_at   timestamptz,
  review_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.merchant_documents(merchant_id);

create table public.merchant_bank_accounts (
  id                uuid primary key default gen_random_uuid(),
  merchant_id       uuid not null references public.merchants(id) on delete cascade,
  account_holder    text not null,
  bank_name         text not null,
  bank_country      char(2) not null,
  iban              text,
  account_number_last4 text,        -- chỉ lưu 4 số cuối để hiển thị
  account_number_encrypted text,    -- mã hoá ở tầng ứng dụng
  swift_bic         text,
  currency          char(3) not null default 'USD',
  is_default        boolean not null default true,
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.merchant_bank_accounts(merchant_id);

-- Lịch sử xét duyệt hồ sơ merchant — bất biến, chỉ thêm.
create table public.merchant_review_history (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  from_status  merchant_status,
  to_status    merchant_status not null,
  reviewer_id  uuid references public.users(id),
  reason       text,
  checklist    jsonb,
  created_at   timestamptz not null default now()
);
create index on public.merchant_review_history(merchant_id);
