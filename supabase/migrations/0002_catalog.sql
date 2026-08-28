-- ============================================================================
-- DubaiWay — 0002 CATALOG: danh mục, dịch vụ, gói, lịch, giá, chính sách
-- ============================================================================

create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references public.categories(id) on delete restrict,
  slug          text not null unique,
  icon          text,
  image_url     text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.categories(parent_id);

-- Tên/mô tả danh mục theo ngôn ngữ. Admin quản lý được danh mục nên không hardcode.
create table public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale      text not null check (locale in ('vi','en','ar')),
  name        text not null,
  description text,
  primary key (category_id, locale)
);

create table public.services (
  id                    uuid primary key default gen_random_uuid(),
  merchant_id           uuid not null references public.merchants(id) on delete restrict,
  category_id           uuid not null references public.categories(id) on delete restrict,
  slug                  text not null unique,
  status                service_status not null default 'draft',

  -- Địa điểm
  country               char(2) not null default 'AE',
  city                  text,
  address               text,
  latitude              numeric(9,6),
  longitude             numeric(9,6),
  meeting_point         text,
  pickup_available      boolean not null default false,
  pickup_note           text,
  dropoff_note          text,

  -- Vận hành
  duration_minutes      integer check (duration_minutes > 0),
  languages             text[] not null default '{}',
  min_guests            integer not null default 1 check (min_guests >= 1),
  max_guests            integer check (max_guests is null or max_guests >= min_guests),
  min_age               integer,
  max_age               integer,
  health_requirements   text,
  guest_requirements    text,
  instant_confirmation  boolean not null default false,
  free_cancellation     boolean not null default false,
  -- Phải đặt trước bao nhiêu giờ so với giờ khởi hành.
  booking_cutoff_hours  integer not null default 24 check (booking_cutoff_hours >= 0),

  -- Giá hiển thị "từ" — cache để lọc/sắp xếp nhanh, nguồn thật nằm ở service_packages.
  price_from_minor      bigint check (price_from_minor >= 0),
  currency              char(3) not null default 'USD',

  -- Thống kê đánh giá — cập nhật bằng trigger, không tự nhập.
  rating_avg_x100       integer not null default 0 check (rating_avg_x100 between 0 and 500),
  rating_count          integer not null default 0,
  booking_count         integer not null default 0,

  is_featured           boolean not null default false,
  published_at          timestamptz,
  submitted_at          timestamptz,
  approved_at           timestamptz,
  approved_by           uuid references public.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on public.services(merchant_id);
create index on public.services(category_id);
create index on public.services(status);
create index on public.services(city);
create index on public.services(price_from_minor);
create index on public.services(rating_avg_x100 desc);

-- Nội dung theo ngôn ngữ. Tách bảng để thêm tiếng Ả Rập không cần đổi schema.
create table public.service_translations (
  service_id    uuid not null references public.services(id) on delete cascade,
  locale        text not null check (locale in ('vi','en','ar')),
  title         text not null,
  summary       text,
  description   text,
  highlights    text[] not null default '{}',
  included      text[] not null default '{}',
  excluded      text[] not null default '{}',
  usage_terms   text,
  primary key (service_id, locale)
);

create table public.service_media (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references public.services(id) on delete cascade,
  kind        text not null check (kind in ('image','video')),
  url         text not null,
  alt_text    text,
  sort_order  integer not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.service_media(service_id);

create table public.service_itinerary (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references public.services(id) on delete cascade,
  day_number  integer not null default 1,
  sort_order  integer not null default 0,
  locale      text not null check (locale in ('vi','en','ar')),
  title       text not null,
  description text,
  start_time  time,
  duration_minutes integer
);
create index on public.service_itinerary(service_id);

-- Gói dịch vụ: mỗi dịch vụ có thể nhiều gói (Standard / VIP / có đón…).
create table public.service_packages (
  id                    uuid primary key default gen_random_uuid(),
  service_id            uuid not null references public.services(id) on delete cascade,
  code                  text not null,
  sort_order            integer not null default 0,
  is_active             boolean not null default true,
  -- Giá theo từng loại khách, đơn vị nhỏ nhất.
  price_adult_minor     bigint not null check (price_adult_minor >= 0),
  price_child_minor     bigint check (price_child_minor >= 0),
  price_infant_minor    bigint check (price_infant_minor >= 0),
  -- Giá trọn gói cho cả nhóm (nếu bán theo nhóm thay vì theo đầu người).
  price_group_minor     bigint check (price_group_minor >= 0),
  group_size            integer check (group_size is null or group_size > 0),
  currency              char(3) not null default 'USD',
  -- Thuế/phí tính thêm cho khách, dạng bps trên tiền hàng.
  tax_rate_bps          integer not null default 0 check (tax_rate_bps between 0 and 10000),
  fee_fixed_minor       bigint not null default 0 check (fee_fixed_minor >= 0),
  min_guests            integer not null default 1,
  max_guests            integer,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (service_id, code)
);
create index on public.service_packages(service_id);

create table public.package_translations (
  package_id  uuid not null references public.service_packages(id) on delete cascade,
  locale      text not null check (locale in ('vi','en','ar')),
  name        text not null,
  description text,
  primary key (package_id, locale)
);

-- Giá theo mùa / theo khoảng ngày, đè lên giá gốc của gói.
create table public.package_price_rules (
  id                uuid primary key default gen_random_uuid(),
  package_id        uuid not null references public.service_packages(id) on delete cascade,
  starts_on         date not null,
  ends_on           date not null,
  price_adult_minor bigint check (price_adult_minor >= 0),
  price_child_minor bigint check (price_child_minor >= 0),
  label             text,
  created_at        timestamptz not null default now(),
  constraint price_rule_range_valid check (ends_on >= starts_on)
);
create index on public.package_price_rules(package_id, starts_on, ends_on);

-- Tồn kho theo ngày (và giờ nếu có suất). capacity_reserved tăng khi giữ chỗ.
create table public.service_availability (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references public.services(id) on delete cascade,
  package_id        uuid references public.service_packages(id) on delete cascade,
  available_date    date not null,
  start_time        time,
  capacity_total    integer not null check (capacity_total >= 0),
  capacity_reserved integer not null default 0 check (capacity_reserved >= 0),
  is_closed         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (service_id, package_id, available_date, start_time),
  -- Không bao giờ được bán quá số chỗ. Ràng buộc ở DB, không chỉ ở code.
  constraint availability_not_oversold check (capacity_reserved <= capacity_total)
);
create index on public.service_availability(service_id, available_date);

create table public.service_blackout_dates (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services(id) on delete cascade,
  blackout_date date not null,
  reason       text,
  unique (service_id, blackout_date)
);

create table public.service_policies (
  service_id            uuid primary key references public.services(id) on delete cascade,
  cancellation_text     text,
  -- Bậc hoàn tiền: [{"hours_before":48,"refund_bps":10000},{"hours_before":24,"refund_bps":5000}]
  cancellation_tiers    jsonb not null default '[]'::jsonb,
  reschedule_text       text,
  reschedule_allowed    boolean not null default false,
  reschedule_cutoff_hours integer,
  refund_text           text,
  weather_policy        text,
  force_majeure_policy  text,
  -- Thời hạn khiếu nại sau khi dùng dịch vụ. Thưởng referral chỉ mở khoá sau mốc này.
  dispute_window_hours  integer not null default 72 check (dispute_window_hours >= 0),
  updated_at            timestamptz not null default now()
);

-- Lịch sử xét duyệt dịch vụ — bất biến.
create table public.service_review_history (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references public.services(id) on delete cascade,
  from_status service_status,
  to_status   service_status not null,
  reviewer_id uuid references public.users(id),
  reason      text,
  diff        jsonb,
  created_at  timestamptz not null default now()
);
create index on public.service_review_history(service_id);

create table public.favorites (
  user_id    uuid not null references public.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);
