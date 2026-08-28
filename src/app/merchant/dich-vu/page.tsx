import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser, listServices } from '@/server/services/merchant-store';

export const metadata: Metadata = { title: 'Dịch vụ — Đối tác', robots: { index: false, follow: false } };

const SERVICE_STATUS: Record<string, { text: string; cls: string }> = {
  draft:             { text: 'Nháp',            cls: 'bg-mist-200 text-ink-soft' },
  submitted:         { text: 'Đã nộp duyệt',    cls: 'bg-amber-50 text-amber-800' },
  under_review:      { text: 'Đang duyệt',      cls: 'bg-amber-50 text-amber-800' },
  changes_requested: { text: 'Cần bổ sung',     cls: 'bg-amber-50 text-amber-800' },
  approved:          { text: 'Đã duyệt',        cls: 'bg-royal/[0.08] text-royal' },
  active:            { text: 'Đang bán',        cls: 'bg-emerald-50 text-emerald-700' },
  inactive:          { text: 'Tạm ngừng',       cls: 'bg-mist-200 text-ink-soft' },
  suspended:         { text: 'Bị đình chỉ',     cls: 'bg-red-50 text-red-700' },
};

export default async function MerchantServicesPage() {
  const user = await getSessionUser();
  const merchant = user ? getMerchantForUser(user.id) : null;
  const services = merchant ? listServices(merchant.id) : [];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-midnight">Dịch vụ của bạn</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Dịch vụ mới và thay đổi quan trọng phải được DubaiWay duyệt trước khi hiển thị công khai.
          </p>
        </div>
        <Link
          href="/merchant/dich-vu/moi"
          className="inline-flex h-11 items-center rounded-full bg-champagne px-5 text-sm font-medium text-white transition-colors hover:bg-champagne-600"
        >
          + Tạo dịch vụ mới
        </Link>
      </div>

      <div className="mt-6">
        {services.length === 0 ? (
          <EmptyState
            title="Chưa có dịch vụ nào"
            body="Tạo dịch vụ đầu tiên để bắt đầu nhận đơn."
            action={{ label: 'Tạo dịch vụ mới', href: '/merchant/dich-vu/moi' }}
          />
        ) : (
          <ul className="space-y-3">
            {services.map((s) => {
              const st = SERVICE_STATUS[s.status] ?? SERVICE_STATUS.draft;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist bg-ivory-100 p-4">
                  <span className="min-w-0">
                    <span className="block font-medium text-midnight">{s.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      {s.categorySlug} · từ {formatMoney(fromMinorUnits(s.priceFromMinor, 'AED'), 'vi-VN')}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                    <Link href={`/merchant/dich-vu/${s.id}`} className="text-sm text-royal hover:underline">
                      Sửa
                    </Link>
                    {s.status === 'active' ? (
                      <Link href={`/dich-vu/${s.slug}`} className="text-sm text-royal hover:underline">
                        Xem trang
                      </Link>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>


    </>
  );
}
