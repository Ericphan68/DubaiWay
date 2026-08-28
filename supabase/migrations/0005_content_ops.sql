-- ============================================================================
-- DubaiWay — 0005 NỘI DUNG & VẬN HÀNH: thông báo, hỗ trợ, trang, blog,
--                                       banner, audit log, cấu hình, trigger bảo vệ
-- ============================================================================

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  channel      notification_channel not null default 'in_app',
  template_key text not null,
  title        text not null,
  body         text not null,
  data         jsonb not null default '{}'::jsonb,
  link_url     text,
  read_at      timestamptz,
  sent_at      timestamptz,
  send_error   text,
  created_at   timestamptz not null default now()
);
create index on public.notifications(user_id, read_at);

-- Hàng đợi gửi email/SMS/WhatsApp. UNIQUE(dedupe_key) chống gửi trùng.
create table public.notification_outbox (
  id            uuid primary key default gen_random_uuid(),
  channel       notification_channel not null,
  recipient     text not null,
  template_key  text not null,
  locale        text not null default 'vi',
  payload       jsonb not null default '{}'::jsonb,
  dedupe_key    text unique,
  status        text not null default 'queued' check (status in ('queued','sending','sent','failed')),
  attempts      integer not null default 0,
  last_error    text,
  scheduled_for timestamptz not null default now(),
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index on public.notification_outbox(status, scheduled_for);

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  user_id     uuid references public.users(id) on delete set null,
  merchant_id uuid references public.merchants(id) on delete set null,
  booking_id  uuid references public.bookings(id) on delete set null,
  subject     text not null,
  category    text,
  priority    text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status      text not null default 'open' check (status in ('open','pending','resolved','closed')),
  assigned_to uuid references public.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.support_tickets(status);

create table public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  sender_id   uuid references public.users(id),
  sender_role text not null check (sender_role in ('customer','merchant','admin','system')),
  body        text not null,
  attachments jsonb not null default '[]'::jsonb,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.support_messages(ticket_id);

-- Trang nội dung tĩnh do Admin quản lý (điều khoản, chính sách…).
create table public.pages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  status       text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  updated_by   uuid references public.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.page_translations (
  page_id      uuid not null references public.pages(id) on delete cascade,
  locale       text not null check (locale in ('vi','en','ar')),
  title        text not null,
  body_md      text not null,
  meta_title   text,
  meta_description text,
  primary key (page_id, locale)
);

create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  author_id    uuid references public.users(id),
  cover_url    text,
  category_id  uuid references public.categories(id) on delete set null,
  status       text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  view_count   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.blog_posts(status, published_at desc);

create table public.blog_post_translations (
  post_id      uuid not null references public.blog_posts(id) on delete cascade,
  locale       text not null check (locale in ('vi','en','ar')),
  title        text not null,
  excerpt      text,
  body_md      text not null,
  meta_title   text,
  meta_description text,
  primary key (post_id, locale)
);

create table public.banners (
  id          uuid primary key default gen_random_uuid(),
  placement   text not null,   -- 'home_hero','category_top','checkout_side'…
  image_url   text not null,
  link_url    text,
  sort_order  integer not null default 0,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.banner_translations (
  banner_id uuid not null references public.banners(id) on delete cascade,
  locale    text not null check (locale in ('vi','en','ar')),
  headline  text,
  subhead   text,
  cta_label text,
  primary key (banner_id, locale)
);

-- ─── AUDIT LOG ──────────────────────────────────────────────────────────────
-- Ghi mọi thao tác quan trọng: ai, lúc nào, dữ liệu trước/sau, lý do.
-- TUYỆT ĐỐI không ghi dữ liệu nhạy cảm (số hộ chiếu, số tài khoản, token) vào đây.
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.users(id),
  actor_role   text,
  action       text not null,          -- 'merchant.approve','refund.issue','service.suspend'…
  entity_type  text not null,
  entity_id    uuid,
  before_data  jsonb,
  after_data   jsonb,
  reason       text,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);
create index on public.audit_logs(entity_type, entity_id, created_at desc);
create index on public.audit_logs(actor_id, created_at desc);

-- ─── CẤU HÌNH NỀN TẢNG ──────────────────────────────────────────────────────
create table public.platform_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_by  uuid references public.users(id),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- TRIGGER BẢO VỆ TÍNH BẤT BIẾN CỦA DỮ LIỆU TÀI CHÍNH
-- ============================================================================
create or replace function public.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'Bảng % chỉ được phép THÊM. Sửa sai bằng bút toán đảo, không ghi đè lịch sử tài chính.',
    TG_TABLE_NAME;
end;
$$;

create trigger ledger_entries_immutable
  before update or delete on public.ledger_entries
  for each row execute function public.forbid_mutation();

create trigger wallet_transactions_immutable
  before update or delete on public.wallet_transactions
  for each row execute function public.forbid_mutation();

-- Webhook đã xử lý xong thì không được sửa nữa (nhưng vẫn cho ghi processed_at lần đầu).
-- Tách UPDATE và DELETE vì mệnh đề WHEN của trigger DELETE không tham chiếu được NEW.
create trigger payment_events_no_update_after_processed
  before update on public.payment_events
  for each row when (old.processed_at is not null)
  execute function public.forbid_mutation();

create trigger payment_events_no_delete
  before delete on public.payment_events
  for each row execute function public.forbid_mutation();

create trigger merchant_review_history_immutable
  before update or delete on public.merchant_review_history
  for each row execute function public.forbid_mutation();

create trigger service_review_history_immutable
  before update or delete on public.service_review_history
  for each row execute function public.forbid_mutation();

create trigger audit_logs_immutable
  before update or delete on public.audit_logs
  for each row execute function public.forbid_mutation();

-- ─── updated_at tự động ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'users','profiles','saved_travelers','merchants','merchant_documents',
    'merchant_bank_accounts','categories','services','service_packages',
    'service_availability','service_policies','booking_drafts','bookings',
    'payments','vouchers','refunds','disputes','reviews','merchant_responses',
    'referral_rewards','wallets','withdrawal_requests','merchant_settlements',
    'support_tickets','pages','blog_posts'
  ]
  loop
    execute format(
      'create trigger %I_touch before update on public.%I
         for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ─── Cập nhật điểm đánh giá của dịch vụ ─────────────────────────────────────
create or replace function public.refresh_service_rating()
returns trigger
language plpgsql
as $$
declare sid uuid;
begin
  sid := coalesce(new.service_id, old.service_id);
  update public.services s
     set rating_count   = sub.cnt,
         rating_avg_x100 = sub.avg_x100
    from (
      select count(*)::int as cnt,
             coalesce(round(avg(rating_overall) * 100), 0)::int as avg_x100
        from public.reviews
       where service_id = sid and is_hidden = false
    ) sub
   where s.id = sid;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_service_rating();
