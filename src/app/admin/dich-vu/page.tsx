import type { Metadata } from 'next';
import { formatMoney, fromMinorUnits } from '@/core/money';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { getMerchant, listHistory, listServices } from '@/server/services/merchant-store';
import { ServiceReviewForm } from '../merchant/ReviewControls';

export const metadata: Metadata = { title: 'Duyệt dịch vụ', robots: { index: false, follow: false } };

const NEXT_STATES: Record<string, { value: string; label: string }[]> = {
  draft:             [{ value: 'submitted', label: 'Đánh dấu đã nộp' }],
  submitted:         [{ value: 'under_review', label: 'Bắt đầu duyệt' }],
  under_review:      [
    { value: 'approved', label: 'Duyệt' },
    { value: 'changes_requested', label: 'Yêu cầu bổ sung' },
  ],
  changes_requested: [{ value: 'submitted', label: 'Đã nhận bổ sung' }],
  approved:          [{ value: 'active', label: 'Cho lên sàn' }, { value: 'inactive', label: 'Giữ ẩn' }],
  active:            [{ value: 'inactive', label: 'Tạm ngừng' }, { value: 'suspended', label: 'Đình chỉ' }],
  inactive:          [{ value: 'active', label: 'Bật lại' }, { value: 'suspended', label: 'Đình chỉ' }],
  suspended:         [{ value: 'inactive', label: 'Gỡ đình chỉ' }],
};

const LABEL: Record<string, string> = {
  draft: 'Nháp', submitted: 'Đã nộp', under_review: 'Đang duyệt',
  changes_requested: 'Cần bổ sung', approved: 'Đã duyệt', active: 'Đang bán',
  inactive: 'Tạm ngừng', suspended: 'Đình chỉ',
};

export default async function AdminServicesPage() {
  const user = await getSessionUser();
  const canReview = hasPermission(user, 'service.review');
  const services = listServices();
  const pending = services.filter((s) => s.status === 'submitted' || s.status === 'under_review');
  const others = services.filter((s) => !pending.includes(s));

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Duyệt dịch vụ</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {pending.length} dịch vụ đang chờ · {services.length} tổng cộng
      </p>

      {!canReview ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được danh sách nhưng không có quyền <code>service.review</code> để duyệt.
        </p>
      ) : null}

      <h2 className="mt-6 font-display text-lg font-medium text-midnight">Đang chờ duyệt</h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 ? (
          <EmptyState title="Không có dịch vụ nào chờ duyệt" body="Mọi dịch vụ đã được xử lý." />
        ) : (
          pending.map((s) => <Card key={s.id} service={s} canReview={canReview} />)
        )}
      </div>

      <h2 className="mt-8 font-display text-lg font-medium text-midnight">Toàn bộ dịch vụ</h2>
      <div className="mt-3 space-y-3">
        {others.map((s) => <Card key={s.id} service={s} canReview={canReview} />)}
      </div>
    </>
  );
}

function Card({
  service, canReview,
}: {
  service: ReturnType<typeof listServices>[number];
  canReview: boolean;
}) {
  const merchant = getMerchant(service.merchantId);
  const history = listHistory(service.id);
  return (
    <article className="rounded-2xl border border-mist bg-ivory-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-midnight">{service.title}</h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            {merchant?.displayName ?? '—'} · {service.categorySlug} · từ{' '}
            {formatMoney(fromMinorUnits(service.priceFromMinor, 'AED'), 'vi-VN')}
          </p>
        </div>
        <span className="rounded-full bg-mist-200 px-2.5 py-0.5 text-xs font-medium text-ink-muted">
          {LABEL[service.status] ?? service.status}
        </span>
      </div>

      {canReview && NEXT_STATES[service.status]?.length ? (
        <ServiceReviewForm serviceId={service.id} options={NEXT_STATES[service.status]} />
      ) : null}

      {history.length > 0 ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-royal">Lịch sử ({history.length})</summary>
          <ul className="mt-2 space-y-1 text-xs text-ink-soft">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.at).toLocaleString('vi-VN')} · {h.fromStatus ?? '—'} → {h.toStatus}
                {h.reason ? ` · ${h.reason}` : ''}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}
