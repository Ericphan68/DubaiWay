import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { listTravelers } from '@/server/services/customer-store';
import { AddTravelerForm, RemoveTravelerButton } from '../AccountForms';

export const metadata: Metadata = { title: 'Người đi cùng', robots: { index: false, follow: false } };

export default async function TravelersPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const travelers = listTravelers(user.id);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Người đi cùng</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Lưu sẵn thông tin để lần sau đặt dịch vụ nhanh hơn.
      </p>

      <div className="mt-6">
        {travelers.length === 0 ? (
          <EmptyState title="Chưa lưu ai" body="Thêm người đi cùng ở form bên dưới." />
        ) : (
          <ul className="space-y-3">
            {travelers.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist bg-ivory-100 p-4">
                <span>
                  <span className="block font-medium text-midnight">
                    {t.fullName}
                    {t.isPrimary ? (
                      <span className="ml-2 rounded-full bg-champagne/[0.12] px-2 py-0.5 text-xs font-medium text-champagne-600">
                        Liên hệ chính
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    {[
                      t.dateOfBirth ? `Sinh ${new Date(t.dateOfBirth).toLocaleDateString('vi-VN')}` : null,
                      t.nationality,
                      t.passportLast4 ? `Hộ chiếu ••••${t.passportLast4}` : null,
                      t.passportExpiry ? `HH ${new Date(t.passportExpiry).toLocaleDateString('vi-VN')}` : null,
                    ].filter(Boolean).join(' · ') || 'Chưa có thông tin thêm'}
                  </span>
                </span>
                <RemoveTravelerButton travelerId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <AddTravelerForm />
      </div>
    </>
  );
}
