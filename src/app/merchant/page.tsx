import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser, listServices } from '@/server/services/merchant-store';
import { listBookingsForMerchant, merchantTotals } from '@/server/services/booking-store';
import { ConsolePageHeader } from '@/components/layout/ConsoleShell';
import { ActionQueue, ConsoleCard, ConsoleEmpty, ConsoleStat, StatRow } from '@/components/console';

export const metadata: Metadata = { title: 'Tổng quan đối tác', robots: { index: false, follow: false } };

export default async function MerchantDashboard() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  if (!merchant) {
    return (
      <ConsoleCard>
        <ConsoleEmpty
          title="Chưa có hồ sơ đối tác"
          body="Đăng ký hồ sơ để bắt đầu đăng bán dịch vụ của bạn trên DubaiWay."
          action={{ label: 'Đăng ký đối tác', href: '/tro-thanh-doi-tac' }}
        />
      </ConsoleCard>
    );
  }

  const totals = merchantTotals(merchant.id, 'USD');
  const bookings = listBookingsForMerchant(merchant.id);
  const services = listServices(merchant.id);
  const usd = (minor: number) => formatMoney(fromMinorUnits(minor, 'USD'), 'vi-VN');

  const pendingRedeem = bookings.filter((b) => b.voucher.status === 'confirmed').length;
  const draftServices = services.filter((s) => s.status === 'draft').length;
  const reviewServices = services.filter(
    (s) => s.status === 'under_review' || s.status === 'submitted',
  ).length;
  const activeServices = services.filter((s) => s.status === 'active').length;

  return (
    <>
      <ConsolePageHeader
        title="Tổng quan"
        description="Việc cần làm hôm nay, tiền bạn nhận được và đơn hàng mới nhất."
      />

      <ActionQueue
        emptyLabel="Không có việc nào đang chờ bạn."
        items={[
          { count: pendingRedeem, label: 'voucher khách đã mua, chờ bạn quét khi họ đến', href: '/merchant/quet-ma' },
          { count: draftServices, label: 'dịch vụ còn ở bản nháp, chưa gửi duyệt', href: '/merchant/dich-vu' },
          { count: reviewServices, label: 'dịch vụ đang chờ DubaiWay duyệt', href: '/merchant/dich-vu' },
        ]}
      />

      <h2 className="mb-3 mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Tiền về
      </h2>
      <div className="overflow-hidden rounded-2xl border border-mist bg-ivory-100">
        <div className="border-b border-mist bg-champagne/[0.05] px-5 py-4">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-champagne-600">
            Bạn thực nhận
          </p>
          <p className="mt-0.5 font-display text-[2rem] font-semibold leading-none tabular-nums text-midnight">
            {usd(totals.netRevenue)}
          </p>
        </div>
        <dl className="grid divide-y divide-mist sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-3.5">
            <dt className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">
              Khách đã trả
            </dt>
            <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-midnight">
              {usd(totals.grossSales)}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">
              Hoa hồng DubaiWay
            </dt>
            <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-midnight">
              {usd(totals.commission)}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="text-[0.7rem] font-medium uppercase tracking-[0.09em] text-ink-soft">
              Đơn đã thanh toán
            </dt>
            <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-midnight">
              {totals.bookingCount}
            </dd>
          </div>
        </dl>
        {/* Đối tác đã đăng ký thì phải biết rõ mình bị trừ bao nhiêu.
            Con số này KHÔNG xuất hiện trên bất kỳ trang công khai nào —
            xem src/app/__tests__/commission-privacy.test.ts. */}
        <p className="border-t border-mist bg-ivory-200/50 px-5 py-2.5 text-xs text-ink-soft">
          Hoa hồng nền tảng <strong className="font-semibold text-ink-muted">10%</strong> tính trên
          tiền hàng sau giảm giá, chưa gồm thuế thu hộ. Chỉ tính đơn đã thanh toán trở lên.
        </p>
      </div>

      <h2 className="mb-3 mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Gian hàng của bạn
      </h2>
      <StatRow>
        <ConsoleStat label="Đang bán" value={activeServices} hint={`${services.length} dịch vụ tất cả`} />
        <ConsoleStat label="Chờ DubaiWay duyệt" value={reviewServices} />
        <ConsoleStat label="Bản nháp" value={draftServices} />
        <ConsoleStat label="Voucher chờ quét" value={pendingRedeem} />
      </StatRow>

      <div className="mt-8">
        <ConsoleCard
          title="Đơn hàng mới nhất"
          description={bookings.length > 0 ? `${bookings.length} đơn tất cả` : undefined}
          actions={
            bookings.length > 0 ? (
              <Link href="/merchant/don-hang" className="text-sm font-medium text-champagne-600 hover:text-champagne">
                Xem tất cả
              </Link>
            ) : null
          }
        >
          {bookings.length === 0 ? (
            <ConsoleEmpty
              title="Chưa có đơn hàng nào"
              body="Khi khách đặt dịch vụ của bạn, đơn sẽ hiện ở đây kèm số tiền bạn nhận được."
              action={activeServices === 0 ? { label: 'Đăng dịch vụ đầu tiên', href: '/merchant/dich-vu' } : undefined}
            />
          ) : (
            <ul className="divide-y divide-mist">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.reference} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-midnight">{b.serviceTitle}</span>
                    <span className="text-xs text-ink-soft">
                      {b.reference} · {b.travelers[0]?.fullName ?? '—'} · {b.adults + b.children} khách
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-midnight">
                      {formatMoney(b.financials.merchantRevenue, 'vi-VN')}
                    </span>
                    <span className="text-xs text-ink-soft">bạn nhận</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ConsoleCard>
      </div>
    </>
  );
}
