-- ============================================================================
-- DubaiWay — 0007 HÀM NGHIỆP VỤ: giữ chỗ, quét voucher, tra cấu hình hoa hồng
-- ============================================================================
-- Những việc dưới đây KHÔNG được làm ở client vì phải chống chạy đồng thời.
-- ============================================================================

-- ─── GIỮ CHỖ ────────────────────────────────────────────────────────────────
-- Dùng `for update` để khoá đúng dòng tồn kho. Hai người đặt cùng lúc chỗ cuối cùng
-- thì người sau bị từ chối, không bao giờ bán quá số chỗ.
create or replace function public.hold_inventory(
  p_availability_id uuid,
  p_seats integer
)
returns table (ok boolean, remaining integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total    integer;
  v_reserved integer;
  v_closed   boolean;
begin
  if p_seats is null or p_seats <= 0 then
    return query select false, 0, 'Số chỗ phải lớn hơn 0';
    return;
  end if;

  select capacity_total, capacity_reserved, is_closed
    into v_total, v_reserved, v_closed
    from public.service_availability
   where id = p_availability_id
   for update;                     -- khoá dòng cho tới hết transaction

  if not found then
    return query select false, 0, 'Không tìm thấy suất dịch vụ';
    return;
  end if;

  if v_closed then
    return query select false, 0, 'Suất này đã đóng';
    return;
  end if;

  if v_reserved + p_seats > v_total then
    return query select false, (v_total - v_reserved), 'Không đủ chỗ trống';
    return;
  end if;

  update public.service_availability
     set capacity_reserved = capacity_reserved + p_seats
   where id = p_availability_id;

  return query select true, (v_total - v_reserved - p_seats), 'Đã giữ chỗ';
end;
$$;

-- Trả chỗ khi huỷ / hết hạn giữ chỗ.
create or replace function public.release_inventory(
  p_availability_id uuid,
  p_seats integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.service_availability
     set capacity_reserved = greatest(0, capacity_reserved - p_seats)
   where id = p_availability_id;
  return found;
end;
$$;

-- ─── QUÉT VOUCHER ───────────────────────────────────────────────────────────
-- Voucher chỉ redeem được ĐÚNG MỘT LẦN.
-- Hai máy quét cùng lúc: một máy thành công, máy còn lại nhận 'duplicate'.
-- Bảo đảm bởi (1) khoá dòng voucher và (2) unique index trên lần redeem thành công.
create or replace function public.redeem_voucher(
  p_code text,
  p_merchant_id uuid,
  p_device_info text default null
)
returns table (outcome text, voucher_id uuid, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id         uuid;
  v_status     voucher_status;
  v_valid_from timestamptz;
  v_valid_until timestamptz;
  v_booking_merchant uuid;
begin
  select v.id, v.status, v.valid_from, v.valid_until, b.merchant_id
    into v_id, v_status, v_valid_from, v_valid_until, v_booking_merchant
    from public.vouchers v
    join public.bookings b on b.id = v.booking_id
   where v.code = p_code
   for update of v;

  if not found then
    return query select 'invalid'::text, null::uuid, 'Mã voucher không tồn tại';
    return;
  end if;

  -- Merchant chỉ được quét voucher của chính mình.
  if v_booking_merchant <> p_merchant_id then
    return query select 'invalid'::text, v_id, 'Voucher không thuộc đơn vị của bạn';
    return;
  end if;

  if v_status = 'redeemed' then
    insert into public.voucher_redemptions(voucher_id, redeemed_by, merchant_id, outcome, device_info)
    values (v_id, auth.uid(), p_merchant_id, 'duplicate', p_device_info);
    return query select 'duplicate'::text, v_id, 'Voucher đã được sử dụng trước đó';
    return;
  end if;

  if v_status in ('cancelled','refunded') then
    insert into public.voucher_redemptions(voucher_id, redeemed_by, merchant_id, outcome, device_info)
    values (v_id, auth.uid(), p_merchant_id, 'cancelled', p_device_info);
    return query select 'cancelled'::text, v_id, 'Voucher đã bị huỷ hoặc hoàn tiền';
    return;
  end if;

  if v_status = 'expired' or (v_valid_until is not null and now() > v_valid_until) then
    update public.vouchers set status = 'expired' where id = v_id and status <> 'expired';
    insert into public.voucher_redemptions(voucher_id, redeemed_by, merchant_id, outcome, device_info)
    values (v_id, auth.uid(), p_merchant_id, 'expired', p_device_info);
    return query select 'expired'::text, v_id, 'Voucher đã hết hạn';
    return;
  end if;

  if v_status <> 'confirmed' then
    return query select 'invalid'::text, v_id, 'Voucher chưa được xác nhận';
    return;
  end if;

  if v_valid_from is not null and now() < v_valid_from then
    return query select 'invalid'::text, v_id, 'Chưa tới ngày sử dụng';
    return;
  end if;

  update public.vouchers
     set status = 'redeemed', redeemed_at = now(), redeemed_by = auth.uid()
   where id = v_id;

  insert into public.voucher_redemptions(voucher_id, redeemed_by, merchant_id, outcome, device_info)
  values (v_id, auth.uid(), p_merchant_id, 'success', p_device_info);

  return query select 'success'::text, v_id, 'Đã xác nhận sử dụng';
exception
  -- Nếu hai giao dịch cùng lọt tới đây, unique index sẽ chặn dòng thứ hai.
  when unique_violation then
    return query select 'duplicate'::text, v_id, 'Voucher đã được sử dụng trước đó';
end;
$$;

-- ─── TRA TỶ LỆ HOA HỒNG ─────────────────────────────────────────────────────
-- Độ ưu tiên: merchant > danh mục > toàn nền tảng. Luôn lấy bản có hiệu lực.
create or replace function public.resolve_commission(
  p_merchant_id uuid,
  p_category_id uuid
)
returns table (
  commission_rate_bps integer,
  referral_share_bps  integer,
  commission_base     commission_base
)
language sql
stable
security definer
set search_path = public
as $$
  select c.commission_rate_bps, c.referral_share_bps, c.commission_base
    from public.commissions c
   where c.effective_from <= now()
     and (c.effective_to is null or c.effective_to > now())
     and (
       (c.scope = 'merchant' and c.merchant_id = p_merchant_id) or
       (c.scope = 'category' and c.category_id = p_category_id) or
       (c.scope = 'platform')
     )
   order by case c.scope when 'merchant' then 1 when 'category' then 2 else 3 end,
            c.effective_from desc
   limit 1;
$$;

-- ─── TRA NGƯỜI GIỚI THIỆU TRỰC TIẾP ─────────────────────────────────────────
-- CHỈ MỘT TẦNG. Hàm này cố ý không có đệ quy và không nhận tham số độ sâu.
create or replace function public.get_direct_referrer(p_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select referrer_user_id
    from public.referral_attributions
   where referred_user_id = p_user_id
     and status = 'active'
   limit 1;
$$;

-- ─── SINH MÃ ────────────────────────────────────────────────────────────────
create or replace function public.generate_reference(p_prefix text)
returns text
language plpgsql
as $$
declare
  alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  out text := '';
  i integer;
begin
  for i in 1..6 loop
    out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return p_prefix || '-' || out;
end;
$$;
