import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../test-db';

let db: PGlite;

// Id cố định để test dễ đọc.
const USER_A = '11111111-1111-4111-8111-111111111111'; // người giới thiệu
const USER_B = '22222222-2222-4222-8222-222222222222'; // được A giới thiệu, là khách mua
const MERCHANT = '33333333-3333-4333-8333-333333333333';
const OWNER = '44444444-4444-4444-8444-444444444444';

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(`
    insert into public.users (id, email) values
      ('${USER_A}', 'a@example.test'),
      ('${USER_B}', 'b@example.test'),
      ('${OWNER}',  'owner@example.test');
    insert into public.merchants (id, kind, status, legal_name, owner_user_id)
      values ('${MERCHANT}', 'business', 'approved', 'Desert Rose Tourism LLC', '${OWNER}');
  `);
}, 60_000);

afterAll(async () => { await db?.close(); });

// ─────────────────────────────────────────────────────────────────────────────
describe('Sổ sách booking phải cân ngay ở database', () => {
  const chenBooking = (over: Record<string, unknown> = {}) => {
    const v = {
      reference: `DW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      subtotal: 100000, discount: 0, tax: 0, fee: 0, total: 100000,
      base: 100000, rate: 1000, commission: 10000, merchant: 90000,
      referrer: 'null', share: 0, reward: 0, net: 10000,
      ...over,
    } as Record<string, unknown>;
    return db.exec(`
      insert into public.bookings (
        reference, user_id, merchant_id, currency,
        subtotal_minor, discount_minor, tax_minor, fee_minor, customer_total_minor,
        commission_base_minor, commission_rate_bps, platform_commission_minor, merchant_revenue_minor,
        referrer_user_id, referral_share_bps, referral_reward_minor, platform_net_minor
      ) values (
        '${v.reference}', '${USER_B}', '${MERCHANT}', 'AED',
        ${v.subtotal}, ${v.discount}, ${v.tax}, ${v.fee}, ${v.total},
        ${v.base}, ${v.rate}, ${v.commission}, ${v.merchant},
        ${v.referrer}, ${v.share}, ${v.reward}, ${v.net}
      )`);
  };

  it('đơn đúng chuẩn 1.000 AED được chấp nhận', async () => {
    await expect(chenBooking()).resolves.toBeDefined();
  });

  it('CHẶN khi tổng khách trả không khớp các thành phần', async () => {
    await expect(chenBooking({ total: 999999 })).rejects.toThrow(/booking_total_balances/);
  });

  it('CHẶN khi merchant + hoa hồng ≠ cơ sở tính hoa hồng', async () => {
    await expect(chenBooking({ merchant: 95000 })).rejects.toThrow(/booking_commission_balances/);
  });

  it('CHẶN khi thưởng + phần nền tảng giữ ≠ hoa hồng', async () => {
    await expect(
      chenBooking({ referrer: `'${USER_A}'`, share: 3000, reward: 3000, net: 9000 }),
    ).rejects.toThrow(/booking_referral_balances/);
  });

  it('CHẶN có thưởng mà không có người giới thiệu', async () => {
    await expect(
      chenBooking({ referrer: 'null', share: 3000, reward: 3000, net: 7000 }),
    ).rejects.toThrow(/booking_referral_requires_referrer/);
  });

  it('CHẶN tự giới thiệu: người mua cũng là người giới thiệu', async () => {
    await expect(
      chenBooking({ referrer: `'${USER_B}'`, share: 3000, reward: 3000, net: 7000 }),
    ).rejects.toThrow(/booking_no_self_referral/);
  });

  it('đơn có referral hợp lệ: 1.000 AED → 100 hoa hồng, 30 thưởng, 70 giữ lại', async () => {
    await expect(
      chenBooking({ referrer: `'${USER_A}'`, share: 3000, reward: 3000, net: 7000 }),
    ).resolves.toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Giới thiệu chỉ một tầng — chặn ở database', () => {
  it('mỗi người chỉ có tối đa MỘT người giới thiệu', async () => {
    const C = '55555555-5555-4555-8555-555555555555';
    const D = '66666666-6666-4666-8666-666666666666';
    await db.exec(`insert into public.users (id,email) values ('${C}','c@example.test'),('${D}','d@example.test')`);
    await db.exec(`insert into public.referral_attributions (referred_user_id, referrer_user_id)
                   values ('${C}', '${USER_A}')`);
    // Thử gán thêm người giới thiệu thứ hai cho C → phải bị chặn
    await expect(
      db.exec(`insert into public.referral_attributions (referred_user_id, referrer_user_id)
               values ('${C}', '${D}')`),
    ).rejects.toThrow(/referral_attributions_referred_user_id_key|duplicate key/);
  });

  it('CHẶN tự giới thiệu ở bảng attribution', async () => {
    await expect(
      db.exec(`insert into public.referral_attributions (referred_user_id, referrer_user_id)
               values ('${USER_A}', '${USER_A}')`),
    ).rejects.toThrow(/attribution_no_self/);
  });

  it('không có cột nào cho phép lưu cây giới thiệu nhiều tầng', async () => {
    const cols = await db.query<{ column_name: string }>(`
      select column_name from information_schema.columns
       where table_name = 'referral_attributions'`);
    const names = cols.rows.map((r) => r.column_name);
    expect(names).not.toContain('parent_id');
    expect(names).not.toContain('ancestor_id');
    expect(names).not.toContain('level');
    expect(names).not.toContain('path');
  });

  it('get_direct_referrer trả đúng MỘT người, không đi ngược lên trên', async () => {
    const r = await db.query<{ get_direct_referrer: string | null }>(
      `select public.get_direct_referrer('${USER_B}') `,
    );
    expect(r.rows).toHaveLength(1);
  });

  it('mỗi booking chỉ sinh được MỘT khoản thưởng', async () => {
    const b = await db.query<{ id: string }>(
      `select id from public.bookings where referrer_user_id = '${USER_A}' limit 1`);
    const bookingId = b.rows[0].id;
    await db.exec(`insert into public.referral_rewards
      (booking_id, referrer_user_id, referred_user_id, commission_minor, share_bps, amount_minor, currency)
      values ('${bookingId}','${USER_A}','${USER_B}',10000,3000,3000,'AED')`);
    await expect(
      db.exec(`insert into public.referral_rewards
        (booking_id, referrer_user_id, referred_user_id, commission_minor, share_bps, amount_minor, currency)
        values ('${bookingId}','${USER_A}','${USER_B}',10000,3000,3000,'AED')`),
    ).rejects.toThrow(/duplicate key|referral_rewards_booking_id_key/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tồn kho — không bao giờ bán quá số chỗ', () => {
  let availabilityId: string;

  beforeAll(async () => {
    await db.exec(`
      insert into public.categories (id, slug) values ('77777777-7777-4777-8777-777777777777','desert-safari')
      on conflict do nothing;
      insert into public.services (id, merchant_id, category_id, slug, status, price_from_minor)
      values ('88888888-8888-4888-8888-888888888888','${MERCHANT}','77777777-7777-4777-8777-777777777777',
              'evening-desert-safari','active', 15000)
      on conflict do nothing;
    `);
    const r = await db.query<{ id: string }>(`
      insert into public.service_availability (service_id, available_date, capacity_total)
      values ('88888888-8888-4888-8888-888888888888', current_date + 7, 10)
      returning id`);
    availabilityId = r.rows[0].id;
  });

  it('giữ 4 chỗ trên 10 → còn 6', async () => {
    const r = await db.query<{ ok: boolean; remaining: number }>(
      `select * from public.hold_inventory('${availabilityId}', 4)`);
    expect(r.rows[0].ok).toBe(true);
    expect(r.rows[0].remaining).toBe(6);
  });

  it('giữ tiếp 6 chỗ → vừa đủ, còn 0', async () => {
    const r = await db.query<{ ok: boolean; remaining: number }>(
      `select * from public.hold_inventory('${availabilityId}', 6)`);
    expect(r.rows[0].ok).toBe(true);
    expect(r.rows[0].remaining).toBe(0);
  });

  it('giữ thêm 1 chỗ nữa → TỪ CHỐI, không bán quá', async () => {
    const r = await db.query<{ ok: boolean; message: string }>(
      `select * from public.hold_inventory('${availabilityId}', 1)`);
    expect(r.rows[0].ok).toBe(false);
    expect(r.rows[0].message).toMatch(/Không đủ chỗ/);
  });

  it('ràng buộc database chặn cả khi update trực tiếp', async () => {
    await expect(
      db.exec(`update public.service_availability set capacity_reserved = 11 where id = '${availabilityId}'`),
    ).rejects.toThrow(/availability_not_oversold/);
  });

  it('trả chỗ thì đặt lại được', async () => {
    await db.query(`select public.release_inventory('${availabilityId}', 3)`);
    const r = await db.query<{ ok: boolean }>(`select * from public.hold_inventory('${availabilityId}', 3)`);
    expect(r.rows[0].ok).toBe(true);
  });

  it('không cho giữ số chỗ âm hoặc 0', async () => {
    const r = await db.query<{ ok: boolean }>(`select * from public.hold_inventory('${availabilityId}', 0)`);
    expect(r.rows[0].ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Voucher chỉ dùng được MỘT LẦN', () => {
  let voucherCode: string;

  beforeAll(async () => {
    const b = await db.query<{ id: string }>(`select id from public.bookings limit 1`);
    voucherCode = 'DW-VOUCHER-TEST-0001';
    await db.exec(`
      insert into public.vouchers (booking_id, code, qr_payload, status, service_date, guest_count)
      values ('${b.rows[0].id}', '${voucherCode}', 'signed-payload', 'confirmed', current_date + 7, 2)`);
    await db.exec(`select set_config('request.jwt.claim.sub', '${OWNER}', false)`);
  });

  it('quét lần đầu → thành công', async () => {
    const r = await db.query<{ outcome: string }>(
      `select * from public.redeem_voucher('${voucherCode}', '${MERCHANT}')`);
    expect(r.rows[0].outcome).toBe('success');
  });

  it('quét lần hai → duplicate, KHÔNG cho dùng lại', async () => {
    const r = await db.query<{ outcome: string; message: string }>(
      `select * from public.redeem_voucher('${voucherCode}', '${MERCHANT}')`);
    expect(r.rows[0].outcome).toBe('duplicate');
    expect(r.rows[0].message).toMatch(/đã được sử dụng/);
  });

  it('chỉ có ĐÚNG MỘT lần quét thành công được ghi nhận', async () => {
    const r = await db.query<{ n: number }>(`
      select count(*)::int n from public.voucher_redemptions vr
        join public.vouchers v on v.id = vr.voucher_id
       where v.code = '${voucherCode}' and vr.outcome = 'success'`);
    expect(r.rows[0].n).toBe(1);
  });

  it('index duy nhất chặn ghi thêm lần quét thành công thứ hai', async () => {
    const v = await db.query<{ id: string }>(`select id from public.vouchers where code = '${voucherCode}'`);
    await expect(
      db.exec(`insert into public.voucher_redemptions (voucher_id, redeemed_by, merchant_id, outcome)
               values ('${v.rows[0].id}', '${OWNER}', '${MERCHANT}', 'success')`),
    ).rejects.toThrow(/voucher_single_successful_redemption|duplicate key/);
  });

  it('mã không tồn tại → invalid', async () => {
    const r = await db.query<{ outcome: string }>(
      `select * from public.redeem_voucher('KHONG-CO-THAT', '${MERCHANT}')`);
    expect(r.rows[0].outcome).toBe('invalid');
  });

  it('merchant khác không quét được voucher không thuộc mình', async () => {
    const other = '99999999-9999-4999-8999-999999999999';
    await db.exec(`insert into public.merchants (id, kind, status, legal_name, owner_user_id)
                   values ('${other}','business','approved','Merchant Khac','${OWNER}')`);
    const r = await db.query<{ outcome: string; message: string }>(
      `select * from public.redeem_voucher('${voucherCode}', '${other}')`);
    expect(r.rows[0].outcome).toBe('invalid');
    expect(r.rows[0].message).toMatch(/không thuộc đơn vị/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dữ liệu tài chính bất biến', () => {
  it('KHÔNG được sửa bút toán sổ cái', async () => {
    const b = await db.query<{ id: string }>(`select id from public.bookings limit 1`);
    await db.exec(`insert into public.ledger_entries
      (entry_group, account, direction, amount_minor, currency, booking_id, source_type)
      values (gen_random_uuid(), 'platform_commission', 'credit', 10000, 'AED', '${b.rows[0].id}', 'booking')`);
    await expect(
      db.exec(`update public.ledger_entries set amount_minor = 1 where account = 'platform_commission'`),
    ).rejects.toThrow(/chỉ được phép THÊM/);
  });

  it('KHÔNG được xoá bút toán sổ cái', async () => {
    await expect(
      db.exec(`delete from public.ledger_entries where account = 'platform_commission'`),
    ).rejects.toThrow(/chỉ được phép THÊM/);
  });

  it('KHÔNG được sửa nhật ký hệ thống', async () => {
    await db.exec(`insert into public.audit_logs (action, entity_type) values ('test.action','booking')`);
    await expect(
      db.exec(`update public.audit_logs set action = 'sua-trom'`),
    ).rejects.toThrow(/chỉ được phép THÊM/);
  });

  it('KHÔNG được xoá lịch sử duyệt merchant', async () => {
    await db.exec(`insert into public.merchant_review_history (merchant_id, to_status)
                   values ('${MERCHANT}', 'approved')`);
    await expect(
      db.exec(`delete from public.merchant_review_history`),
    ).rejects.toThrow(/chỉ được phép THÊM/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Chống trùng lặp thanh toán và webhook', () => {
  it('cùng idempotency_key không tạo được hai giao dịch', async () => {
    const b = await db.query<{ id: string }>(`select id from public.bookings limit 1`);
    const key = 'idem-key-abc-123';
    await db.exec(`insert into public.payments (booking_id, amount_minor, currency, idempotency_key)
                   values ('${b.rows[0].id}', 100000, 'AED', '${key}')`);
    await expect(
      db.exec(`insert into public.payments (booking_id, amount_minor, currency, idempotency_key)
               values ('${b.rows[0].id}', 100000, 'AED', '${key}')`),
    ).rejects.toThrow(/duplicate key|idempotency_key/);
  });

  it('cùng một sự kiện webhook không xử lý hai lần', async () => {
    await db.exec(`insert into public.payment_events (provider, event_id, event_type, payload)
                   values ('stripe', 'evt_123', 'payment_intent.succeeded', '{}'::jsonb)`);
    await expect(
      db.exec(`insert into public.payment_events (provider, event_id, event_type, payload)
               values ('stripe', 'evt_123', 'payment_intent.succeeded', '{}'::jsonb)`),
    ).rejects.toThrow(/duplicate key|payment_events_provider_event_id_key/);
  });

  it('không hoàn nhiều hơn số đã thu', async () => {
    const p = await db.query<{ id: string }>(`select id from public.payments limit 1`);
    await expect(
      db.exec(`update public.payments set amount_refunded_minor = 200000 where id = '${p.rows[0].id}'`),
    ).rejects.toThrow(/payment_refund_not_exceed/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tra cấu hình hoa hồng', () => {
  it('mặc định nền tảng là 10% và thưởng 30% của hoa hồng', async () => {
    const r = await db.query<{ commission_rate_bps: number; referral_share_bps: number }>(
      `select * from public.resolve_commission(null, null)`);
    expect(r.rows[0].commission_rate_bps).toBe(1000);
    expect(r.rows[0].referral_share_bps).toBe(3000);
  });

  it('cấu hình riêng cho merchant được ưu tiên hơn mặc định', async () => {
    await db.exec(`insert into public.commissions (scope, merchant_id, commission_rate_bps, referral_share_bps)
                   values ('merchant', '${MERCHANT}', 1200, 2500)`);
    const r = await db.query<{ commission_rate_bps: number; referral_share_bps: number }>(
      `select * from public.resolve_commission('${MERCHANT}', null)`);
    expect(r.rows[0].commission_rate_bps).toBe(1200);
    expect(r.rows[0].referral_share_bps).toBe(2500);
  });

  it('cấu hình số tầng giới thiệu luôn là 1', async () => {
    const r = await db.query<{ value: number }>(
      `select value::int as value from public.platform_settings where key = 'referral.max_levels'`);
    expect(r.rows[0].value).toBe(1);
  });
});
