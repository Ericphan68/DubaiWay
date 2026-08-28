import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/states';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listAvailability, listBlackoutDates, listServices } from '@/server/services/catalog-store';
import { CalendarGrid, GenerateDays } from './CalendarControls';

export const metadata: Metadata = { title: 'Lịch & tồn kho', robots: { index: false, follow: false } };

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CalendarPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) redirect('/tro-thanh-doi-tac');
  const merchant = getMerchantForUser(user.id);
  if (!merchant) redirect('/tro-thanh-doi-tac');

  const sp = await searchParams;
  const services = listServices({ merchantId: merchant.id })
    .filter((s) => s.status === 'active' || s.status === 'approved' || s.status === 'inactive');

  const selectedId = typeof sp.service === 'string' ? sp.service : services[0]?.id;
  const selected = services.find((s) => s.id === selectedId);

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 45);
  const days = selected
    ? listAvailability(selected.id, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10))
    : [];
  const blackout = selected ? listBlackoutDates(selected.id) : [];

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Lịch & tồn kho</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Đặt số chỗ từng ngày, đóng ngày không phục vụ. Ngày đã có khách đặt không đóng hay chặn được —
        để không huỷ đơn của khách một cách bất ngờ.
      </p>

      {services.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Chưa có dịch vụ nào để xếp lịch"
            body="Chỉ dịch vụ đã được duyệt mới quản lý lịch được."
            action={{ label: 'Tạo dịch vụ mới', href: '/merchant/dich-vu/moi' }}
          />
        </div>
      ) : (
        <>
          {/* Chọn dịch vụ */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/merchant/lich?service=${s.id}`}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  s.id === selectedId
                    ? 'border-royal bg-royal text-white'
                    : 'border-mist text-ink-muted hover:border-mist-400'
                }`}
              >
                {s.i18n.vi.title}
              </Link>
            ))}
          </nav>

          {selected ? (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-mist bg-ivory-200 p-4">
                <div>
                  <p className="font-medium text-midnight">{selected.i18n.vi.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {days.length} ngày đang mở · sức chứa mặc định {selected.maxGuests ?? 20} khách/ngày
                  </p>
                </div>
                <GenerateDays serviceId={selected.id} />
              </div>

              <h2 className="mt-8 font-display text-lg font-medium text-midnight">45 ngày tới</h2>
              <div className="mt-3">
                {days.length === 0 ? (
                  <EmptyState
                    title="Chưa mở ngày nào"
                    body="Bấm “Mở lịch” ở trên để mở bán các ngày sắp tới."
                  />
                ) : (
                  <CalendarGrid serviceId={selected.id} days={days} blackout={blackout} />
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </>
  );
}
