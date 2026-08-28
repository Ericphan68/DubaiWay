import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listHistory, listMerchants } from '@/server/services/merchant-store';
import { StatusChip } from '@/components/marketplace/StatusBadges';
import { MerchantReviewForm } from './ReviewControls';

export const metadata: Metadata = { title: 'Duyệt đối tác', robots: { index: false, follow: false } };

/** Trạng thái tiếp theo hợp lệ — khớp máy trạng thái ở src/core/state-machines.ts */
const NEXT_STATES: Record<string, { value: string; label: string }[]> = {
  draft:             [{ value: 'submitted', label: 'Đánh dấu đã nộp' }],
  submitted:         [{ value: 'under_review', label: 'Bắt đầu thẩm định' }],
  under_review:      [
    { value: 'approved', label: 'Duyệt hồ sơ' },
    { value: 'changes_requested', label: 'Yêu cầu bổ sung' },
    { value: 'rejected', label: 'Từ chối' },
  ],
  changes_requested: [{ value: 'submitted', label: 'Đã nhận bổ sung' }],
  approved:          [{ value: 'suspended', label: 'Đình chỉ' }],
  rejected:          [{ value: 'draft', label: 'Mở lại để sửa' }],
  suspended:         [{ value: 'approved', label: 'Khôi phục' }, { value: 'rejected', label: 'Từ chối hẳn' }],
};

export default async function AdminMerchantsPage() {
  const user = await getSessionUser();
  const canReview = hasPermission(user, 'merchant.review');
  const merchants = listMerchants();

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Duyệt đối tác</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {merchants.length} hồ sơ. Đối tác chỉ công khai được dịch vụ sau khi hồ sơ được duyệt.
      </p>

      {!canReview ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được danh sách nhưng không có quyền <code>merchant.review</code> để duyệt.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {merchants.length === 0 ? (
          <EmptyState title="Chưa có hồ sơ đối tác nào" />
        ) : (
          merchants.map((m) => {
            const history = listHistory(m.id);
            return (
              <article key={m.id} className="rounded-2xl border border-mist bg-ivory-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-medium text-midnight">{m.displayName}</h2>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {m.kind === 'business' ? 'Doanh nghiệp' : 'Cá nhân'} · {m.city}, {m.country} ·{' '}
                      {m.contactEmail}
                    </p>
                  </div>
                  <StatusChip status={m.status} />
                </div>

                <p className="mt-3 text-sm text-ink-muted">{m.description}</p>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {m.kind === 'business' ? (
                    <>
                      <Row label="Tên pháp lý" value={m.legalName ?? '—'} />
                      <Row label="Số ĐKKD" value={m.registrationNumber ?? '—'} />
                      <Row label="Mã số thuế" value={m.taxNumber ?? '—'} />
                    </>
                  ) : (
                    <>
                      <Row label="Họ tên" value={m.individualFullName ?? '—'} />
                      <Row label="Quốc tịch" value={m.nationality ?? '—'} />
                    </>
                  )}
                  <Row label="Điện thoại" value={m.contactPhone} />
                </dl>

                {/* Giấy tờ KYC/KYB — chỉ hiện TÊN file, không bao giờ nhúng link công khai */}
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Giấy tờ KYC/KYB ({m.documents.length})
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {m.documents.map((d) => (
                      <li key={d.id}
                          className="rounded-lg border border-mist bg-ivory-200 px-2.5 py-1 text-xs text-ink-muted">
                        {d.docType} · {d.fileName}
                        <span className={d.status === 'verified' ? ' text-emerald-700' : ' text-amber-700'}>
                          {' '}({d.status})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[0.7rem] text-ink-soft">
                    Giấy tờ nằm trong kho lưu trữ riêng tư. Mở file cần link ký có hạn, không dùng URL công khai.
                  </p>
                </div>

                {canReview && NEXT_STATES[m.status]?.length ? (
                  <MerchantReviewForm merchantId={m.id} options={NEXT_STATES[m.status]} />
                ) : null}

                {history.length > 0 ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-royal">
                      Lịch sử xét duyệt ({history.length})
                    </summary>
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
          })
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-midnight">{value}</dd>
    </div>
  );
}
