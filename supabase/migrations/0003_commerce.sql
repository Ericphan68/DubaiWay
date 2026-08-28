-- ============================================================================
-- DubaiWay — 0003 COMMERCE: giỏ/booking, thanh toán, voucher, huỷ, hoàn, khiếu nại, đánh giá
-- ============================================================================

-- Giỏ hàng / booking nháp trước khi thanh toán.
create table public.booking_drafts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  session_key text,                                  -- khách chưa đăng nhập
  currency    char(3) not null default 'USD',
  payload     jsonb not null default '{}'::jsonb,
  expires_at  timestamptz not null default (now() + interval '24 hours'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint draft_owner_present check (user_id is not null or session_key is not null)
);
create index on public.booking_drafts(user_id);
create index on public.booking_drafts(expires_at);

-- ─── BOOKING ────────────────────────────────────────────────────────────────
-- Toàn bộ số tiền là ẢNH CHỤP tại thời điểm đặt. Đổi cấu hình hoa hồng về sau
-- KHÔNG được làm thay đổi các con số này.
create table public.bookings (
  id                      uuid primary key default gen_random_uuid(),
  reference               text not null unique,      -- mã hiển thị cho khách, VD DW-2K4F7Q
  user_id                 uuid not null references public.users(id) on delete restrict,
  merchant_id             uuid not null references public.merchants(id) on delete restrict,
  status                  booking_status not null default 'draft',

  currency                char(3) not null,
  -- FX: nếu khách trả bằng tiền khác tiền niêm yết của merchant.
  fx_rate_x1e6            bigint,                    -- tỷ giá × 1.000.000, NULL nếu cùng tiền
  settlement_currency     char(3),

  -- Các con số tiền (đơn vị nhỏ nhất)
  subtotal_minor          bigint not null check (subtotal_minor >= 0),
  discount_minor          bigint not null default 0 check (discount_minor >= 0),
  tax_minor               bigint not null default 0 check (tax_minor >= 0),
  fee_minor               bigint not null default 0 check (fee_minor >= 0),
  customer_total_minor    bigint not null check (customer_total_minor >= 0),

  -- Ảnh chụp cấu hình hoa hồng
  commission_base         commission_base not null default 'subtotal_after_discount',
  commission_base_minor   bigint not null check (commission_base_minor >= 0),
  commission_rate_bps     integer not null check (commission_rate_bps between 0 and 10000),
  platform_commission_minor bigint not null check (platform_commission_minor >= 0),
  merchant_revenue_minor  bigint not null check (merchant_revenue_minor >= 0),

  -- Ảnh chụp cấu hình referral
  referrer_user_id        uuid references public.users(id) on delete set null,
  referral_share_bps      integer not null default 0 check (referral_share_bps between 0 and 10000),
  referral_reward_minor   bigint not null default 0 check (referral_reward_minor >= 0),
  platform_net_minor      bigint not null check (platform_net_minor >= 0),

  coupon_code             text,
  customer_note           text,
  cancellation_deadline   timestamptz,
  dispute_window_ends_at  timestamptz,
  completed_at            timestamptz,
  cancelled_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Sổ sách phải cân ngay ở mức database.
  constraint booking_total_balances check (
    customer_total_minor = subtotal_minor - discount_minor + tax_minor + fee_minor
  ),
  constraint booking_commission_balances check (
    merchant_revenue_minor + platform_commission_minor = commission_base_minor
  ),
  constraint booking_referral_balances check (
    referral_reward_minor + platform_net_minor = platform_commission_minor
  ),
  -- Không có người giới thiệu thì không được có thưởng.
  constraint booking_referral_requires_referrer check (
    referral_reward_minor = 0 or referrer_user_id is not null
  ),
  -- Chặn tự giới thiệu ngay ở database.
  constraint booking_no_self_referral check (
    referrer_user_id is null or referrer_user_id <> user_id
  )
);
create index on public.bookings(user_id);
create index on public.bookings(merchant_id);
create index on public.bookings(status);
create index on public.bookings(referrer_user_id);
create index on public.bookings(created_at desc);

create table public.booking_items (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid not null references public.bookings(id) on delete cascade,
  service_id         uuid not null references public.services(id) on delete restrict,
  package_id         uuid not null references public.service_packages(id) on delete restrict,
  availability_id    uuid references public.service_availability(id) on delete restrict,
  -- Ảnh chụp tên dịch vụ để hoá đơn cũ không đổi khi merchant sửa tên.
  service_title_snapshot text not null,
  package_name_snapshot  text not null,
  service_date       date not null,
  start_time         time,
  adults             integer not null default 0 check (adults >= 0),
  children           integer not null default 0 check (children >= 0),
  infants            integer not null default 0 check (infants >= 0),
  unit_price_adult_minor bigint not null default 0,
  unit_price_child_minor bigint not null default 0,
  line_total_minor   bigint not null check (line_total_minor >= 0),
  currency           char(3) not null,
  created_at         timestamptz not null default now(),
  constraint booking_item_has_guests check (adults + children + infants > 0)
);
create index on public.booking_items(booking_id);
create index on public.booking_items(service_id);

create table public.booking_travelers (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null references public.bookings(id) on delete cascade,
  booking_item_id uuid references public.booking_items(id) on delete cascade,
  full_name      text not null,
  traveler_type  text not null default 'adult' check (traveler_type in ('adult','child','infant')),
  date_of_birth  date,
  nationality    char(2),
  passport_number_encrypted text,
  passport_expiry date,
  is_lead        boolean not null default false,
  created_at     timestamptz not null default now()
);
create index on public.booking_travelers(booking_id);

-- ─── THANH TOÁN ─────────────────────────────────────────────────────────────
-- KHÔNG BAO GIỜ lưu số thẻ. Chỉ lưu tham chiếu của cổng thanh toán.
create table public.payments (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid not null references public.bookings(id) on delete restrict,
  provider              text not null default 'stripe',
  provider_intent_id    text,
  provider_charge_id    text,
  status                payment_status not null default 'requires_action',
  amount_minor          bigint not null check (amount_minor >= 0),
  currency              char(3) not null,
  amount_refunded_minor bigint not null default 0 check (amount_refunded_minor >= 0),
  method_brand          text,        -- 'visa','mastercard','apple_pay'…
  method_last4          text,
  -- Vân tay phương thức thanh toán do cổng cấp — dùng để dò gian lận referral.
  method_fingerprint    text,
  -- Khoá chống trùng: gọi lại cùng khoá không được tạo giao dịch thứ hai.
  idempotency_key       text unique,
  failure_code          text,
  failure_message       text,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint payment_refund_not_exceed check (amount_refunded_minor <= amount_minor)
);
create index on public.payments(booking_id);
create unique index payments_provider_intent_uniq on public.payments(provider, provider_intent_id)
  where provider_intent_id is not null;

-- Nhật ký webhook. UNIQUE trên (provider, event_id) là cơ chế idempotency:
-- webhook gửi lại cùng sự kiện sẽ bị chặn ở tầng database.
create table public.payment_events (
  id            uuid primary key default gen_random_uuid(),
  payment_id    uuid references public.payments(id) on delete set null,
  provider      text not null,
  event_id      text not null,
  event_type    text not null,
  payload       jsonb not null,
  processed_at  timestamptz,
  process_error text,
  created_at    timestamptz not null default now(),
  unique (provider, event_id)
);
create index on public.payment_events(payment_id);

-- ─── VOUCHER ────────────────────────────────────────────────────────────────
create table public.vouchers (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  booking_item_id uuid references public.booking_items(id) on delete cascade,
  code            text not null unique,               -- mã duy nhất, in trên voucher
  qr_payload      text not null,                      -- chuỗi ký để sinh QR
  status          voucher_status not null default 'issued',
  service_date    date not null,
  start_time      time,
  guest_count     integer not null check (guest_count > 0),
  meeting_point   text,
  usage_terms     text,
  valid_from      timestamptz,
  valid_until     timestamptz,
  redeemed_at     timestamptz,
  redeemed_by     uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on public.vouchers(booking_id);
create index on public.vouchers(status);

-- Nhật ký quét voucher. UNIQUE partial index bên dưới đảm bảo mỗi voucher chỉ
-- redeem THÀNH CÔNG đúng một lần, kể cả khi hai máy quét cùng lúc.
create table public.voucher_redemptions (
  id           uuid primary key default gen_random_uuid(),
  voucher_id   uuid not null references public.vouchers(id) on delete cascade,
  redeemed_by  uuid not null references public.users(id),
  merchant_id  uuid not null references public.merchants(id),
  outcome      text not null check (outcome in ('success','duplicate','expired','invalid','cancelled')),
  scanned_at   timestamptz not null default now(),
  device_info  text,
  note         text
);
create unique index voucher_single_successful_redemption
  on public.voucher_redemptions(voucher_id) where outcome = 'success';
create index on public.voucher_redemptions(voucher_id);

-- ─── HUỶ / HOÀN TIỀN / KHIẾU NẠI ────────────────────────────────────────────
create table public.cancellations (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings(id) on delete cascade,
  requested_by      uuid not null references public.users(id),
  actor_role        text not null check (actor_role in ('customer','merchant','admin','system')),
  reason_code       text,
  reason_text       text,
  -- Bậc hoàn tiền áp dụng tại thời điểm huỷ (snapshot).
  refund_rate_bps   integer not null default 0 check (refund_rate_bps between 0 and 10000),
  refund_amount_minor bigint not null default 0 check (refund_amount_minor >= 0),
  currency          char(3) not null,
  created_at        timestamptz not null default now()
);
create index on public.cancellations(booking_id);

create table public.refunds (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings(id) on delete restrict,
  payment_id          uuid references public.payments(id) on delete set null,
  cancellation_id     uuid references public.cancellations(id) on delete set null,
  status              refund_status not null default 'requested',
  amount_minor        bigint not null check (amount_minor > 0),
  currency            char(3) not null,
  -- Số tiền thu hồi tương ứng, để đối soát khớp với ledger.
  commission_reversal_minor bigint not null default 0,
  merchant_reversal_minor   bigint not null default 0,
  referral_reversal_minor   bigint not null default 0,
  provider_refund_id  text,
  idempotency_key     text unique,
  requested_by        uuid references public.users(id),
  approved_by         uuid references public.users(id),
  reason              text,
  processed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index on public.refunds(booking_id);

create table public.disputes (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references public.bookings(id) on delete restrict,
  opened_by     uuid not null references public.users(id),
  against_merchant_id uuid references public.merchants(id),
  status        dispute_status not null default 'open',
  category      text,
  subject       text not null,
  description   text not null,
  resolution    text,
  assigned_to   uuid references public.users(id),
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.disputes(booking_id);
create index on public.disputes(status);

create table public.dispute_messages (
  id          uuid primary key default gen_random_uuid(),
  dispute_id  uuid not null references public.disputes(id) on delete cascade,
  sender_id   uuid not null references public.users(id),
  sender_role text not null check (sender_role in ('customer','merchant','admin')),
  body        text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index on public.dispute_messages(dispute_id);

-- ─── ĐÁNH GIÁ ───────────────────────────────────────────────────────────────
-- Chỉ khách có booking đã hoàn thành mới được đánh giá: ràng buộc bằng khoá ngoại
-- tới booking + UNIQUE mỗi booking một đánh giá, cộng thêm kiểm tra ở RLS/service.
create table public.reviews (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null unique references public.bookings(id) on delete restrict,
  service_id        uuid not null references public.services(id) on delete cascade,
  merchant_id       uuid not null references public.merchants(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete restrict,
  rating_overall    smallint not null check (rating_overall between 1 and 5),
  rating_quality    smallint check (rating_quality between 1 and 5),
  rating_value      smallint check (rating_value between 1 and 5),
  rating_service    smallint check (rating_service between 1 and 5),
  rating_accuracy   smallint check (rating_accuracy between 1 and 5),
  comment           text,
  is_hidden         boolean not null default false,
  hidden_reason     text,
  hidden_by         uuid references public.users(id),
  hidden_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.reviews(service_id);
create index on public.reviews(merchant_id);

create table public.review_media (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews(id) on delete cascade,
  url        text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Merchant chỉ được PHẢN HỒI, không sửa/xoá đánh giá — tách bảng riêng.
create table public.merchant_responses (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null unique references public.reviews(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  author_id   uuid not null references public.users(id),
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
