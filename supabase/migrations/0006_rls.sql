-- ============================================================================
-- DubaiWay — 0006 ROW LEVEL SECURITY
-- ============================================================================
-- Nguyên tắc: MẶC ĐỊNH TỪ CHỐI. Bật RLS cho mọi bảng rồi mở đúng những gì cần.
-- Không dựa vào việc "client sẽ không gọi" — phải chặn ở database.
-- ============================================================================

-- ─── HÀM TIỆN ÍCH ───────────────────────────────────────────────────────────
create or replace function public.current_user_id()
returns uuid language sql stable as $$ select auth.uid() $$;

create or replace function public.has_permission(p_permission text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
      from public.user_roles ur
      join public.role_permissions rp on rp.role_key = ur.role_key
     where ur.user_id = auth.uid()
       and rp.permission_key = p_permission
       and ur.merchant_id is null          -- quyền cấp nền tảng
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
      join public.roles r on r.key = ur.role_key
     where ur.user_id = auth.uid() and r.scope = 'platform'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
     where user_id = auth.uid() and role_key = 'super_admin' and merchant_id is null
  );
$$;

-- Người dùng có thuộc merchant này không (chủ sở hữu hoặc thành viên).
create or replace function public.is_merchant_member(p_merchant_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.merchants m
     where m.id = p_merchant_id and m.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.merchant_members mm
     where mm.merchant_id = p_merchant_id and mm.user_id = auth.uid()
  );
$$;

-- Dịch vụ có đang công khai không (dùng cho khách chưa đăng nhập).
create or replace function public.is_service_public(p_service_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.services s
      join public.merchants m on m.id = s.merchant_id
     where s.id = p_service_id
       and s.status = 'active'
       and m.status = 'approved'
  );
$$;

-- ─── BẬT RLS TOÀN BỘ ────────────────────────────────────────────────────────
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- ─── DANH TÍNH ──────────────────────────────────────────────────────────────
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_platform_admin());
create policy users_self_update on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_self_all on public.profiles
  for all using (user_id = auth.uid() or public.is_platform_admin())
  with check (user_id = auth.uid());

create policy travelers_self_all on public.saved_travelers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy roles_read_all on public.roles for select using (true);
create policy permissions_read_admin on public.permissions
  for select using (public.is_platform_admin());
create policy role_permissions_read_admin on public.role_permissions
  for select using (public.is_platform_admin());

create policy user_roles_read on public.user_roles
  for select using (user_id = auth.uid() or public.is_platform_admin());
-- Chỉ Super Admin được cấp/thu quyền. Không ai tự nâng quyền cho mình.
create policy user_roles_write_super on public.user_roles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ─── MERCHANT ───────────────────────────────────────────────────────────────
-- Khách chỉ thấy merchant đã duyệt. Thành viên thấy merchant của mình. Admin thấy hết.
create policy merchants_read on public.merchants
  for select using (
    status = 'approved'
    or public.is_merchant_member(id)
    or public.is_platform_admin()
  );
create policy merchants_insert_owner on public.merchants
  for insert with check (owner_user_id = auth.uid());
-- Merchant chỉ sửa được hồ sơ khi chưa duyệt xong; đã duyệt thì chỉ Admin đổi trạng thái.
create policy merchants_update on public.merchants
  for update using (
    (public.is_merchant_member(id) and status in ('draft','changes_requested'))
    or public.has_permission('merchant.review')
  );

create policy merchant_members_read on public.merchant_members
  for select using (public.is_merchant_member(merchant_id) or public.is_platform_admin());
create policy merchant_members_write on public.merchant_members
  for all using (
    exists (select 1 from public.merchants m where m.id = merchant_id and m.owner_user_id = auth.uid())
    or public.is_platform_admin()
  );

-- GIẤY TỜ KYC/KYB: chỉ chủ hồ sơ và người có quyền duyệt mới đọc được.
-- Không bao giờ để lộ ra ngoài, kể cả cho merchant khác.
create policy merchant_documents_read on public.merchant_documents
  for select using (
    public.is_merchant_member(merchant_id) or public.has_permission('merchant.review')
  );
create policy merchant_documents_write on public.merchant_documents
  for insert with check (public.is_merchant_member(merchant_id));
create policy merchant_documents_review on public.merchant_documents
  for update using (public.has_permission('merchant.review'));

-- Tài khoản ngân hàng: chỉ merchant sở hữu và bộ phận tài chính.
create policy merchant_bank_read on public.merchant_bank_accounts
  for select using (
    public.is_merchant_member(merchant_id) or public.has_permission('finance.manage')
  );
create policy merchant_bank_write on public.merchant_bank_accounts
  for all using (public.is_merchant_member(merchant_id))
  with check (public.is_merchant_member(merchant_id));

create policy merchant_history_read on public.merchant_review_history
  for select using (public.is_merchant_member(merchant_id) or public.is_platform_admin());
create policy merchant_history_insert on public.merchant_review_history
  for insert with check (public.has_permission('merchant.review'));

-- ─── DANH MỤC & DỊCH VỤ ─────────────────────────────────────────────────────
create policy categories_read_public on public.categories
  for select using (is_active = true or public.is_platform_admin());
create policy categories_write_admin on public.categories
  for all using (public.has_permission('category.manage'))
  with check (public.has_permission('category.manage'));

create policy category_tr_read on public.category_translations for select using (true);
create policy category_tr_write on public.category_translations
  for all using (public.has_permission('category.manage'))
  with check (public.has_permission('category.manage'));

-- Khách chỉ thấy dịch vụ active của merchant đã duyệt.
create policy services_read on public.services
  for select using (
    (status = 'active' and exists (
      select 1 from public.merchants m where m.id = merchant_id and m.status = 'approved'))
    or public.is_merchant_member(merchant_id)
    or public.is_platform_admin()
  );
create policy services_insert_merchant on public.services
  for insert with check (public.is_merchant_member(merchant_id));
create policy services_update on public.services
  for update using (
    public.is_merchant_member(merchant_id) or public.has_permission('service.review')
  );

-- Bảng con của dịch vụ dùng chung một luật: thấy dịch vụ thì thấy dữ liệu con.
create policy service_tr_read on public.service_translations
  for select using (public.is_service_public(service_id)
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id))
    or public.is_platform_admin());
create policy service_tr_write on public.service_translations
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy service_media_read on public.service_media
  for select using (public.is_service_public(service_id)
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id))
    or public.is_platform_admin());
create policy service_media_write on public.service_media
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy service_itinerary_read on public.service_itinerary
  for select using (public.is_service_public(service_id) or public.is_platform_admin()
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));
create policy service_itinerary_write on public.service_itinerary
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy packages_read on public.service_packages
  for select using (public.is_service_public(service_id) or public.is_platform_admin()
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));
create policy packages_write on public.service_packages
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy package_tr_read on public.package_translations for select using (true);
create policy package_tr_write on public.package_translations
  for all using (exists (
    select 1 from public.service_packages p join public.services s on s.id = p.service_id
     where p.id = package_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (
    select 1 from public.service_packages p join public.services s on s.id = p.service_id
     where p.id = package_id and public.is_merchant_member(s.merchant_id)));

create policy price_rules_read on public.package_price_rules for select using (true);
create policy price_rules_write on public.package_price_rules
  for all using (exists (
    select 1 from public.service_packages p join public.services s on s.id = p.service_id
     where p.id = package_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (
    select 1 from public.service_packages p join public.services s on s.id = p.service_id
     where p.id = package_id and public.is_merchant_member(s.merchant_id)));

create policy availability_read on public.service_availability
  for select using (public.is_service_public(service_id) or public.is_platform_admin()
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));
-- Khách KHÔNG được tự sửa tồn kho. Việc giữ chỗ đi qua hàm server có SECURITY DEFINER.
create policy availability_write on public.service_availability
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy blackout_read on public.service_blackout_dates for select using (true);
create policy blackout_write on public.service_blackout_dates
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy policies_read on public.service_policies for select using (true);
create policy policies_write on public.service_policies
  for all using (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)))
  with check (exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));

create policy service_history_read on public.service_review_history
  for select using (public.is_platform_admin()
    or exists (select 1 from public.services s where s.id = service_id and public.is_merchant_member(s.merchant_id)));
create policy service_history_insert on public.service_review_history
  for insert with check (public.has_permission('service.review'));

create policy favorites_self on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── BOOKING ────────────────────────────────────────────────────────────────
create policy drafts_self on public.booking_drafts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Khách thấy đơn của mình; merchant thấy đơn thuộc merchant mình; Admin thấy hết.
create policy bookings_read on public.bookings
  for select using (
    user_id = auth.uid()
    or public.is_merchant_member(merchant_id)
    or public.has_permission('booking.read_all')
  );
-- Booking KHÔNG được tạo/sửa trực tiếp từ client — chỉ qua hàm server tin cậy.
create policy bookings_update_staff on public.bookings
  for update using (
    public.is_merchant_member(merchant_id) or public.has_permission('booking.manage')
  );

create policy booking_items_read on public.booking_items
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.is_merchant_member(b.merchant_id)
           or public.has_permission('booking.read_all'))));

create policy booking_travelers_read on public.booking_travelers
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.is_merchant_member(b.merchant_id)
           or public.has_permission('booking.read_all'))));
create policy booking_travelers_write on public.booking_travelers
  for all using (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));

-- Thanh toán: khách xem được của mình, tài chính xem hết. Không ai ghi từ client.
create policy payments_read on public.payments
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.has_permission('finance.manage'))));

create policy payment_events_read_admin on public.payment_events
  for select using (public.has_permission('finance.manage'));

-- ─── VOUCHER ────────────────────────────────────────────────────────────────
create policy vouchers_read on public.vouchers
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.is_merchant_member(b.merchant_id)
           or public.has_permission('booking.read_all'))));

create policy redemptions_read on public.voucher_redemptions
  for select using (public.is_merchant_member(merchant_id) or public.has_permission('booking.read_all'));
create policy redemptions_insert on public.voucher_redemptions
  for insert with check (public.is_merchant_member(merchant_id));

-- ─── HUỶ / HOÀN / KHIẾU NẠI ─────────────────────────────────────────────────
create policy cancellations_read on public.cancellations
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.is_merchant_member(b.merchant_id)
           or public.has_permission('booking.read_all'))));

create policy refunds_read on public.refunds
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id
      and (b.user_id = auth.uid() or public.is_merchant_member(b.merchant_id)
           or public.has_permission('finance.manage'))));
-- Chỉ người có quyền hoàn tiền mới được duyệt.
create policy refunds_write_finance on public.refunds
  for update using (public.has_permission('refund.manage'));

create policy disputes_read on public.disputes
  for select using (
    opened_by = auth.uid()
    or public.is_merchant_member(against_merchant_id)
    or public.has_permission('dispute.manage'));
create policy disputes_insert on public.disputes
  for insert with check (opened_by = auth.uid());
create policy disputes_update on public.disputes
  for update using (public.has_permission('dispute.manage'));

create policy dispute_messages_read on public.dispute_messages
  for select using (exists (
    select 1 from public.disputes d where d.id = dispute_id
      and (d.opened_by = auth.uid() or public.is_merchant_member(d.against_merchant_id)
           or public.has_permission('dispute.manage'))));
create policy dispute_messages_insert on public.dispute_messages
  for insert with check (sender_id = auth.uid());

-- ─── ĐÁNH GIÁ ───────────────────────────────────────────────────────────────
create policy reviews_read_public on public.reviews
  for select using (is_hidden = false or user_id = auth.uid() or public.is_platform_admin());
-- Chỉ chủ booking ĐÃ HOÀN THÀNH mới được viết đánh giá.
create policy reviews_insert_completed_only on public.reviews
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.bookings b
       where b.id = booking_id and b.user_id = auth.uid() and b.status = 'completed')
  );
create policy reviews_update_own on public.reviews
  for update using (user_id = auth.uid() and is_hidden = false)
  with check (user_id = auth.uid());
-- Admin ẩn đánh giá vi phạm (bắt buộc ghi lý do ở tầng service + audit log).
create policy reviews_moderate on public.reviews
  for update using (public.has_permission('review.moderate'));

create policy review_media_read on public.review_media for select using (true);
create policy review_media_write on public.review_media
  for all using (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()));

-- Merchant chỉ PHẢN HỒI, không sửa được đánh giá gốc.
create policy merchant_responses_read on public.merchant_responses for select using (true);
create policy merchant_responses_write on public.merchant_responses
  for all using (public.is_merchant_member(merchant_id))
  with check (public.is_merchant_member(merchant_id));

-- ─── REFERRAL & VÍ ──────────────────────────────────────────────────────────
create policy referral_codes_read on public.referral_codes
  for select using (user_id = auth.uid() or public.is_platform_admin());

create policy attributions_read on public.referral_attributions
  for select using (
    referrer_user_id = auth.uid() or referred_user_id = auth.uid()
    or public.has_permission('referral.manage'));

create policy rewards_read on public.referral_rewards
  for select using (referrer_user_id = auth.uid() or public.has_permission('referral.manage'));

create policy wallets_read on public.wallets
  for select using (
    user_id = auth.uid()
    or (merchant_id is not null and public.is_merchant_member(merchant_id))
    or public.has_permission('finance.manage'));

create policy wallet_tx_read on public.wallet_transactions
  for select using (exists (
    select 1 from public.wallets w where w.id = wallet_id
      and (w.user_id = auth.uid()
           or (w.merchant_id is not null and public.is_merchant_member(w.merchant_id))
           or public.has_permission('finance.manage'))));

create policy ledger_read_finance on public.ledger_entries
  for select using (public.has_permission('finance.manage'));

create policy withdrawals_read on public.withdrawal_requests
  for select using (
    requested_by = auth.uid() or public.has_permission('finance.manage'));
create policy withdrawals_insert on public.withdrawal_requests
  for insert with check (requested_by = auth.uid());
create policy withdrawals_review on public.withdrawal_requests
  for update using (public.has_permission('finance.manage'));

create policy settlements_read on public.merchant_settlements
  for select using (public.is_merchant_member(merchant_id) or public.has_permission('finance.manage'));
create policy settlement_items_read on public.settlement_items
  for select using (exists (
    select 1 from public.merchant_settlements s where s.id = settlement_id
      and (public.is_merchant_member(s.merchant_id) or public.has_permission('finance.manage'))));

create policy commissions_read on public.commissions
  for select using (public.is_platform_admin()
    or (scope = 'merchant' and public.is_merchant_member(merchant_id)));
create policy commissions_write on public.commissions
  for all using (public.has_permission('finance.manage'))
  with check (public.has_permission('finance.manage'));

create policy coupons_read on public.coupons
  for select using (is_active = true or public.is_platform_admin());
create policy coupons_write on public.coupons
  for all using (public.has_permission('marketing.manage'))
  with check (public.has_permission('marketing.manage'));

create policy coupon_redemptions_read on public.coupon_redemptions
  for select using (user_id = auth.uid() or public.has_permission('finance.manage'));

-- ─── THÔNG BÁO, HỖ TRỢ, NỘI DUNG ────────────────────────────────────────────
create policy notifications_self on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_mark_read on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy outbox_admin on public.notification_outbox
  for select using (public.is_platform_admin());

create policy tickets_read on public.support_tickets
  for select using (
    user_id = auth.uid()
    or (merchant_id is not null and public.is_merchant_member(merchant_id))
    or public.has_permission('support.manage'));
create policy tickets_insert on public.support_tickets
  for insert with check (user_id = auth.uid() or public.is_merchant_member(merchant_id));
create policy tickets_update on public.support_tickets
  for update using (public.has_permission('support.manage'));

create policy ticket_messages_read on public.support_messages
  for select using (
    (is_internal = false and exists (
      select 1 from public.support_tickets t where t.id = ticket_id
        and (t.user_id = auth.uid() or (t.merchant_id is not null and public.is_merchant_member(t.merchant_id)))))
    or public.has_permission('support.manage'));
create policy ticket_messages_insert on public.support_messages
  for insert with check (sender_id = auth.uid());

create policy pages_read on public.pages
  for select using (status = 'published' or public.has_permission('content.manage'));
create policy pages_write on public.pages
  for all using (public.has_permission('content.manage'))
  with check (public.has_permission('content.manage'));
create policy page_tr_read on public.page_translations for select using (true);
create policy page_tr_write on public.page_translations
  for all using (public.has_permission('content.manage'))
  with check (public.has_permission('content.manage'));

create policy blog_read on public.blog_posts
  for select using (status = 'published' or public.has_permission('content.manage'));
create policy blog_write on public.blog_posts
  for all using (public.has_permission('content.manage'))
  with check (public.has_permission('content.manage'));
create policy blog_tr_read on public.blog_post_translations for select using (true);
create policy blog_tr_write on public.blog_post_translations
  for all using (public.has_permission('content.manage'))
  with check (public.has_permission('content.manage'));

create policy banners_read on public.banners
  for select using (is_active = true or public.has_permission('marketing.manage'));
create policy banners_write on public.banners
  for all using (public.has_permission('marketing.manage'))
  with check (public.has_permission('marketing.manage'));
create policy banner_tr_read on public.banner_translations for select using (true);
create policy banner_tr_write on public.banner_translations
  for all using (public.has_permission('marketing.manage'))
  with check (public.has_permission('marketing.manage'));

-- Audit log: chỉ đọc, chỉ Admin. Không ai sửa được (đã có trigger chặn).
create policy audit_read_admin on public.audit_logs
  for select using (public.has_permission('audit.read'));

create policy settings_read on public.platform_settings
  for select using (public.is_platform_admin());
create policy settings_write on public.platform_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());
