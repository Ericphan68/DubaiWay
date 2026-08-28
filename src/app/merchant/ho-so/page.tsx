import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth';
import { getMerchantForUser, listHistory } from '@/server/services/merchant-store';
import { StatusChip } from '@/components/marketplace/StatusBadges';
import { SubmitMerchantButton } from '../dang-ky/OnboardForm';

export const metadata: Metadata = { title: 'Hồ sơ đối tác', robots: { index: false, follow: false } };

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function MerchantProfilePage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) redirect('/dang-nhap?next=/merchant/ho-so');
  const merchant = getMerchantForUser(user.id);
  if (!merchant) redirect('/merchant/dang-ky');

  const sp = await searchParams;
  const history = listHistory(merchant.id);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-midnight">Hồ sơ đối tác</h1>
          <p className="mt-1 font-mono text-xs text-ink-soft">/doi-tac/{merchant.slug}</p>
        </div>
        <StatusChip status={merchant.status} />
      </div>

      {sp.created ? (
        <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Đã tạo hồ sơ ở dạng nháp. Kiểm tra lại thông tin rồi nộp cho DubaiWay thẩm định.
        </p>
      ) : null}

      {merchant.status === 'draft' ? (
        <div className="mt-5 rounded-2xl border border-mist bg-ivory-200 p-4">
          <p className="text-sm text-ink-muted">
            Hồ sơ đang là nháp. Chỉ sau khi được duyệt, dịch vụ của bạn mới hiển thị công khai.
          </p>
          <div className="mt-3"><SubmitMerchantButton merchantId={merchant.id} /></div>
        </div>
      ) : null}

      {merchant.status === 'changes_requested' ? (
        <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>DubaiWay cần bạn bổ sung:</strong> {merchant.rejectionReason ?? 'Xem lịch sử bên dưới.'}
        </p>
      ) : null}

      {merchant.status === 'approved' ? (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Hồ sơ đã được duyệt. Bạn có thể{' '}
          <Link href="/merchant/dich-vu/moi" className="underline underline-offset-2">tạo dịch vụ</Link>{' '}
          và bắt đầu nhận đơn.
        </p>
      ) : null}

      <dl className="mt-8 grid gap-x-8 gap-y-4 rounded-2xl border border-mist bg-ivory-100 p-5 sm:grid-cols-2">
        <Row label="Loại đối tác" value={merchant.kind === 'business' ? 'Doanh nghiệp' : 'Cá nhân'} />
        <Row label="Tên hiển thị" value={merchant.displayName} />
        {merchant.kind === 'business' ? (
          <>
            <Row label="Tên pháp lý" value={merchant.legalName ?? '—'} />
            <Row label="Số ĐKKD" value={merchant.registrationNumber ?? '—'} />
            <Row label="Mã số thuế" value={merchant.taxNumber ?? '—'} />
          </>
        ) : (
          <>
            <Row label="Họ và tên" value={merchant.individualFullName ?? '—'} />
            <Row label="Quốc tịch" value={merchant.nationality ?? '—'} />
          </>
        )}
        <Row label="Email" value={merchant.contactEmail} />
        <Row label="Điện thoại" value={merchant.contactPhone} />
        <Row label="Địa điểm" value={`${merchant.city}, ${merchant.country}`} />
      </dl>

      <section className="mt-6">
        <h2 className="font-display text-lg font-medium text-midnight">Mô tả</h2>
        <p className="mt-2 leading-relaxed text-ink-muted">{merchant.description}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-lg font-medium text-midnight">
          Giấy tờ đã khai ({merchant.documents.length})
        </h2>
        {merchant.documents.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Chưa khai giấy tờ nào.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {merchant.documents.map((d) => (
              <li key={d.id} className="rounded-lg border border-mist bg-ivory-200 px-3 py-1.5 text-xs text-ink-muted">
                {d.fileName}
                <span className={d.status === 'verified' ? ' text-emerald-700' : ' text-amber-700'}>
                  {' '}({d.status === 'verified' ? 'đã xác minh' : 'chờ xác minh'})
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Giấy tờ được lưu riêng tư. Chỉ đội thẩm định của DubaiWay xem được, và mỗi lần mở đều
          để lại dấu vết trong nhật ký hệ thống.
        </p>
      </section>

      {history.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium text-midnight">Lịch sử xét duyệt</h2>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.at).toLocaleString('vi-VN')} · {h.fromStatus ?? '—'} → {h.toStatus}
                {h.reason ? ` · ${h.reason}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-midnight">{value}</dd>
    </div>
  );
}
