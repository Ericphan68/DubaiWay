import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listCategories } from '@/server/services/catalog-store';
import { listCoupons, listRedemptions } from '@/server/services/coupon-store';
import { CouponForm, ToggleCoupon } from '../OpsForms';

export const metadata: Metadata = { title: 'Khuyến mãi — Quản trị', robots: { index: false, follow: false } };

export default async function AdminCouponsPage() {
  const user = await getSessionUser();
  const canManage = hasPermission(user, 'marketing.manage');
  const coupons = listCoupons();
  const redemptions = listRedemptions();
  const categories = listCategories().map((c) => ({ slug: c.slug, name: c.name.vi }));

  const totalDiscount = redemptions.reduce((s, r) => s + r.discountMinor, 0);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Mã khuyến mãi</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {coupons.length} mã · {redemptions.length} lượt sử dụng · đã giảm{' '}
        {formatMoney(fromMinorUnits(totalDiscount, 'USD'), 'vi-VN')}
      </p>

      {!canManage ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được nhưng không có quyền <code>marketing.manage</code> để sửa.
        </p>
      ) : null}

      <div className="mt-6">
        {coupons.length === 0 ? (
          <EmptyState title="Chưa có mã nào" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mist">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-ivory-200 text-left">
                <tr>
                  <Th>Mã</Th><Th>Giảm</Th><Th>Điều kiện</Th><Th>Ai chịu</Th>
                  <Th>Lượt dùng</Th><Th>Hiệu lực</Th><Th>Trạng thái</Th>
                  {canManage ? <Th>Thao tác</Th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-ivory-100">
                {coupons.map((c) => (
                  <tr key={c.code}>
                    <Td className="font-mono font-medium text-midnight">{c.code}</Td>
                    <Td>
                      {c.kind === 'percent'
                        ? `${(c.percentBps ?? 0) / 100}%`
                        : formatMoney(fromMinorUnits(c.amountMinor ?? 0, 'USD'), 'vi-VN')}
                      {c.maxDiscountMinor !== null ? (
                        <span className="block text-xs text-ink-soft">
                          tối đa {formatMoney(fromMinorUnits(c.maxDiscountMinor, 'USD'), 'vi-VN')}
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-xs">
                      {c.minOrderMinor > 0
                        ? `Đơn từ ${formatMoney(fromMinorUnits(c.minOrderMinor, 'USD'), 'vi-VN')}`
                        : 'Không điều kiện'}
                      {c.categorySlug ? <span className="block">Chỉ {c.categorySlug}</span> : null}
                    </Td>
                    <Td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.fundedBy === 'platform' ? 'bg-royal/[0.08] text-royal' : 'bg-champagne/[0.12] text-champagne-600'}`}>
                        {c.fundedBy === 'platform' ? 'DubaiWay' : 'Đối tác'}
                      </span>
                    </Td>
                    <Td>
                      {c.usedCount}{c.usageLimitTotal !== null ? ` / ${c.usageLimitTotal}` : ''}
                      <span className="block text-xs text-ink-soft">{c.usageLimitPerUser} lượt/khách</span>
                    </Td>
                    <Td className="text-xs">
                      {c.startsAt ? new Date(c.startsAt).toLocaleDateString('vi-VN') : '—'}
                      {' → '}
                      {c.endsAt ? new Date(c.endsAt).toLocaleDateString('vi-VN') : '—'}
                    </Td>
                    <Td>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-mist-200 text-ink-soft'}`}>
                        {c.isActive ? 'Đang chạy' : 'Đã tắt'}
                      </span>
                    </Td>
                    {canManage ? <Td><ToggleCoupon code={c.code} isActive={c.isActive} /></Td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage ? (
        <div className="mt-8"><CouponForm categories={categories} /></div>
      ) : null}

      {redemptions.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-medium text-midnight">Lượt sử dụng gần đây</h2>
          <ul className="mt-3 divide-y divide-mist overflow-hidden rounded-2xl border border-mist bg-ivory-100">
            {redemptions.slice(0, 20).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="font-mono text-midnight">{r.code}</span>
                  <span className="ml-2 text-ink-soft">đơn {r.bookingReference}</span>
                </span>
                <span className="text-ink-muted">
                  − {formatMoney(fromMinorUnits(r.discountMinor, 'USD'), 'vi-VN')}
                  <span className="ml-2 text-xs text-ink-soft">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink-muted ${className ?? ''}`}>{children}</td>;
}
