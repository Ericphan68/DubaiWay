import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../test-db';

let db: PGlite;
const LINH  = 'c0000000-0000-4000-8000-000000000001';
const MINH  = 'c0000000-0000-4000-8000-000000000002';
const SARAH = 'c0000000-0000-4000-8000-000000000003';

beforeAll(async () => { db = await createTestDb(true); }, 90_000);
afterAll(async () => { await db?.close(); });

describe('Dữ liệu mẫu nạp đầy đủ', () => {
  const dem = async (table: string) =>
    (await db.query<{ n: number }>(`select count(*)::int n from public.${table}`)).rows[0].n;

  it('có đủ 20 danh mục dịch vụ theo yêu cầu', async () => {
    expect(await dem('categories')).toBe(20);
  });

  it('có cả merchant doanh nghiệp và merchant cá nhân', async () => {
    const r = await db.query<{ kind: string; status: string }>(
      `select kind, status from public.merchants order by kind`);
    expect(r.rows.map((x) => x.kind)).toEqual(['business', 'individual']);
    expect(r.rows.find((x) => x.kind === 'business')?.status).toBe('approved');
    expect(r.rows.find((x) => x.kind === 'individual')?.status).toBe('under_review');
  });

  it('có dịch vụ Dubai thật: safari, Burj Khalifa, yacht, đưa đón, Abu Dhabi, voucher ăn uống', async () => {
    const r = await db.query<{ slug: string }>(`select slug from public.services order by slug`);
    const slugs = r.rows.map((x) => x.slug);
    expect(slugs).toContain('evening-desert-safari-bbq');
    expect(slugs).toContain('burj-khalifa-124-125-floor');
    expect(slugs).toContain('dubai-marina-luxury-yacht');
    expect(slugs).toContain('dxb-airport-transfer-private');
    expect(slugs).toContain('abu-dhabi-full-day-tour');
    expect(slugs).toContain('pierchic-seafood-dinner-voucher');
  });

  it('mọi dịch vụ có nội dung cả tiếng Việt lẫn tiếng Anh', async () => {
    const r = await db.query<{ n: number }>(`
      select count(*)::int n from public.services s
       where not exists (select 1 from public.service_translations t
                          where t.service_id = s.id and t.locale = 'vi')
          or not exists (select 1 from public.service_translations t
                          where t.service_id = s.id and t.locale = 'en')`);
    expect(r.rows[0].n).toBe(0);
  });

  it('có đơn hàng ở nhiều trạng thái khác nhau', async () => {
    const r = await db.query<{ status: string }>(
      `select distinct status::text from public.bookings order by 1`);
    const st = r.rows.map((x) => x.status);
    expect(st).toContain('completed');
    expect(st).toContain('paid');
    expect(st).toContain('pending_payment');
    expect(st).toContain('refunded');
  });

  it('có tồn kho cho 60 ngày tới', async () => {
    expect(await dem('service_availability')).toBeGreaterThan(300);
  });

  it('có đánh giá và phản hồi của merchant', async () => {
    expect(await dem('reviews')).toBeGreaterThan(0);
    expect(await dem('merchant_responses')).toBeGreaterThan(0);
  });

  it('điểm đánh giá của dịch vụ được trigger tự cập nhật', async () => {
    const r = await db.query<{ rating_avg_x100: number; rating_count: number }>(`
      select rating_avg_x100, rating_count from public.services
       where slug = 'evening-desert-safari-bbq'`);
    expect(r.rows[0].rating_count).toBe(1);
    expect(r.rows[0].rating_avg_x100).toBe(500); // 5,00 sao
  });
});

describe('Dữ liệu mẫu chứng minh GIỚI THIỆU MỘT TẦNG', () => {
  // Linh → Minh → Sarah
  it('Linh giới thiệu Minh, Minh giới thiệu Sarah', async () => {
    const r = await db.query<{ referred: string; referrer: string }>(`
      select referred_user_id referred, referrer_user_id referrer
        from public.referral_attributions order by created_at`);
    expect(r.rows).toEqual([
      { referred: MINH, referrer: LINH },
      { referred: SARAH, referrer: MINH },
    ]);
  });

  it('đơn của Sarah ghi nhận người giới thiệu là MINH', async () => {
    const r = await db.query<{ referrer_user_id: string }>(`
      select referrer_user_id from public.bookings where user_id = '${SARAH}' and status = 'paid'`);
    expect(r.rows[0].referrer_user_id).toBe(MINH);
  });

  it('LINH KHÔNG nhận đồng nào từ giao dịch của Sarah', async () => {
    const r = await db.query<{ n: number }>(`
      select count(*)::int n from public.referral_rewards rr
        join public.bookings b on b.id = rr.booking_id
       where rr.referrer_user_id = '${LINH}' and b.user_id = '${SARAH}'`);
    expect(r.rows[0].n).toBe(0);
  });

  it('mỗi đơn có tối đa MỘT khoản thưởng — không có chuỗi hoa hồng', async () => {
    const r = await db.query<{ booking_id: string; n: number }>(`
      select booking_id, count(*)::int n from public.referral_rewards
       group by booking_id having count(*) > 1`);
    expect(r.rows).toHaveLength(0);
  });

  it('đơn safari 300 USD: hoa hồng 30, Linh nhận 9, DubaiWay giữ 21', async () => {
    const r = await db.query<{
      customer_total_minor: number; platform_commission_minor: number;
      merchant_revenue_minor: number; referral_reward_minor: number; platform_net_minor: number;
    }>(`select customer_total_minor, platform_commission_minor, merchant_revenue_minor,
               referral_reward_minor, platform_net_minor
          from public.bookings where reference = 'DW-7K2M4P'`);
    const b = r.rows[0];
    expect(b.platform_commission_minor).toBe(3000);  // 30,00 USD = 10% của 300
    expect(b.merchant_revenue_minor).toBe(27000);    // 270,00 USD
    expect(b.referral_reward_minor).toBe(900);       // 9,00 USD = 30% của 30
    expect(b.platform_net_minor).toBe(2100);         // 21,00 USD
    expect(b.referral_reward_minor + b.platform_net_minor).toBe(b.platform_commission_minor);
  });

  it('thưởng đã hết hạn khiếu nại thì rút được, chưa dùng dịch vụ thì còn pending', async () => {
    const r = await db.query<{ status: string; amount_minor: number }>(`
      select status::text, amount_minor from public.referral_rewards
       order by created_at`);
    expect(r.rows.find((x) => x.amount_minor === 900)?.status).toBe('available');
    expect(r.rows.find((x) => x.amount_minor === 1554)?.status).toBe('pending');
  });

  it('số dư ví của Linh khớp với thưởng đã mở khoá', async () => {
    const r = await db.query<{ balance_available_minor: number }>(`
      select balance_available_minor from public.wallets where user_id = '${LINH}'`);
    expect(r.rows[0].balance_available_minor).toBe(900);
  });

  it('tổng tiền trong sổ luôn cân trên MỌI đơn hàng', async () => {
    const r = await db.query<{ n: number }>(`
      select count(*)::int n from public.bookings
       where merchant_revenue_minor + platform_commission_minor <> commission_base_minor
          or referral_reward_minor + platform_net_minor <> platform_commission_minor
          or customer_total_minor <> subtotal_minor - discount_minor + tax_minor + fee_minor`);
    expect(r.rows[0].n).toBe(0);
  });
});
