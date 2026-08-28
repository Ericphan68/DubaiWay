import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser, listHistory } from '@/server/services/merchant-store';
import { getService, listCategories } from '@/server/services/catalog-store';
import { ServiceForm } from '../ServiceForm';
import { SubmitForReview, ToggleActive } from './StatusActions';

export const metadata: Metadata = { title: 'Chỉnh sửa dịch vụ', robots: { index: false, follow: false } };

const LABEL: Record<string, { text: string; cls: string }> = {
  draft:             { text: 'Nháp — chưa nộp duyệt', cls: 'bg-mist-200 text-ink-soft' },
  submitted:         { text: 'Đã nộp, chờ DubaiWay xem', cls: 'bg-amber-50 text-amber-800' },
  under_review:      { text: 'DubaiWay đang duyệt', cls: 'bg-amber-50 text-amber-800' },
  changes_requested: { text: 'Cần bổ sung', cls: 'bg-amber-50 text-amber-800' },
  approved:          { text: 'Đã duyệt — chưa mở bán', cls: 'bg-royal/[0.08] text-royal' },
  active:            { text: 'Đang bán trên sàn', cls: 'bg-emerald-50 text-emerald-700' },
  inactive:          { text: 'Tạm ngừng bán', cls: 'bg-mist-200 text-ink-soft' },
  suspended:         { text: 'Bị DubaiWay đình chỉ', cls: 'bg-red-50 text-red-700' },
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EditServicePage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) redirect('/tro-thanh-doi-tac');
  const merchant = getMerchantForUser(user.id);

  const s = getService(id);
  if (!s) notFound();
  // Chặn ở máy chủ: không xem được dịch vụ của đối tác khác.
  if (!merchant || s.merchantId !== merchant.id) redirect('/merchant/dich-vu');

  const categories = listCategories().filter((c) => c.isActive).map((c) => ({ slug: c.slug, name: c.name.vi }));
  const status = LABEL[s.status] ?? LABEL.draft;
  const history = listHistory(s.id);
  const pkg = s.packages[0];

  return (
    <>
      <nav className="text-sm text-ink-soft">
        <Link href="/merchant/dich-vu" className="hover:text-champagne-600">← Quay lại danh sách dịch vụ</Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-midnight">{s.i18n.vi.title}</h1>
          <p className="mt-1 font-mono text-xs text-ink-soft">/{s.slug}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.cls}`}>{status.text}</span>
      </div>

      {sp.created ? (
        <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Đã tạo dịch vụ ở dạng nháp. Xem lại nội dung rồi nộp cho DubaiWay duyệt.
        </p>
      ) : null}

      {/* Hành động theo trạng thái */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-mist bg-ivory-200 p-4">
        {(s.status === 'draft' || s.status === 'changes_requested') ? (
          <SubmitForReview serviceId={s.id} disabled={merchant.status !== 'approved'} />
        ) : null}
        {s.status === 'approved' || s.status === 'inactive' ? (
          <ToggleActive serviceId={s.id} to="active" />
        ) : null}
        {s.status === 'active' ? (
          <>
            <ToggleActive serviceId={s.id} to="inactive" />
            <Link href={`/dich-vu/${s.slug}`} className="text-sm text-royal hover:underline">
              Xem trang công khai →
            </Link>
          </>
        ) : null}
        {s.status === 'active' || s.status === 'approved' ? (
          <Link href={`/merchant/lich?service=${s.id}`} className="text-sm text-royal hover:underline">
            Quản lý lịch & tồn kho →
          </Link>
        ) : null}
        {s.status === 'submitted' || s.status === 'under_review' ? (
          <p className="text-sm text-ink-muted">
            Đang chờ DubaiWay duyệt. Bạn vẫn sửa nội dung được trong lúc chờ.
          </p>
        ) : null}
      </div>

      {history.length > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-royal">Lịch sử xét duyệt ({history.length})</summary>
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

      <div className="mt-8">
        <ServiceForm
          mode="edit"
          categories={categories}
          values={{
            id: s.id,
            titleVi: s.i18n.vi.title, titleEn: s.i18n.en.title,
            summaryVi: s.i18n.vi.summary, summaryEn: s.i18n.en.summary,
            descriptionVi: s.i18n.vi.description, descriptionEn: s.i18n.en.description,
            categorySlug: s.categorySlug,
            city: s.city ?? 'Dubai',
            meetingPoint: s.meetingPoint ?? '',
            durationMinutes: s.durationMinutes ?? 120,
            languages: s.languages.join(', '),
            minGuests: s.minGuests, maxGuests: s.maxGuests ?? 20,
            priceAdult: (pkg?.priceAdult.amount ?? 0) / 100,
            priceChild: pkg?.priceChild ? pkg.priceChild.amount / 100 : null,
            taxRateBps: pkg?.taxRateBps ?? 500,
            bookingCutoffHours: s.bookingCutoffHours,
            instantConfirmation: s.instantConfirmation,
            freeCancellation: s.freeCancellation,
            pickupAvailable: s.pickupAvailable,
            highlights: s.i18n.vi.highlights.join('\n'),
            included: s.i18n.vi.included.join('\n'),
            excluded: s.i18n.vi.excluded.join('\n'),
            cancellationText: s.policies?.cancellationText ?? '',
          }}
        />
      </div>
    </>
  );
}
