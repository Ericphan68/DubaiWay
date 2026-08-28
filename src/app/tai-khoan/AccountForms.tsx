'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  addTravelerAction, cancelBookingAction, openDisputeAction, removeTravelerAction,
  replyDisputeAction, toggleFavoriteAction, type AccountState,
} from './actions';

const initial: AccountState = { error: null, notice: null };
const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

function Feedback({ state }: { state: AccountState }) {
  if (state.error) {
    return <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  if (state.notice) {
    return <p role="status" className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.notice}</p>;
  }
  return null;
}

// ─── YÊU THÍCH ──────────────────────────────────────────────────────────────
export function FavoriteButton({ slug, isFavorite }: { slug: string; isFavorite: boolean }) {
  const [state, action, pending] = useActionState(toggleFavoriteAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit" disabled={pending}
        aria-pressed={isFavorite}
        className="inline-flex items-center gap-2 rounded-full border border-mist px-4 py-2 text-sm text-ink-muted transition-colors hover:border-champagne hover:text-champagne-600 disabled:opacity-50"
      >
        <span aria-hidden className={isFavorite ? 'text-champagne' : ''}>{isFavorite ? '♥' : '♡'}</span>
        {isFavorite ? 'Đã lưu' : 'Lưu yêu thích'}
      </button>
      {state.error ? <p role="alert" className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

// ─── NGƯỜI ĐI CÙNG ──────────────────────────────────────────────────────────
export function AddTravelerForm() {
  const [state, action, pending] = useActionState(addTravelerAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-medium text-midnight">Thêm người đi cùng</p>
      <p className="mt-1 text-sm text-ink-soft">
        Lưu sẵn để lần sau đặt nhanh hơn. Chúng tôi chỉ giữ 4 số cuối hộ chiếu, không lưu số đầy đủ.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên *</span>
          <input name="fullName" required className={inputCls} placeholder="Nguyễn Văn A" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày sinh</span>
          <input name="dateOfBirth" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc tịch (mã 2 chữ)</span>
          <input name="nationality" maxLength={2} className={inputCls} placeholder="VN" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số hộ chiếu</span>
          <input name="passportNumber" maxLength={20} className={inputCls} placeholder="C1234567" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Hộ chiếu hết hạn</span>
          <input name="passportExpiry" type="date" className={inputCls} />
        </label>
        <label className="flex items-end gap-2 text-sm text-ink-muted">
          <input type="checkbox" name="isPrimary" className="mb-3 accent-champagne" />
          <span className="mb-2.5">Đặt làm người liên hệ chính</span>
        </label>
      </div>
      <Button type="submit" variant="primary" className="mt-4" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Lưu người đi cùng'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function RemoveTravelerButton({ travelerId }: { travelerId: string }) {
  const [state, action, pending] = useActionState(removeTravelerAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="travelerId" value={travelerId} />
      <button type="submit" disabled={pending} className="text-sm text-red-600 hover:underline disabled:opacity-50">
        Xoá
      </button>
      {state.error ? <p role="alert" className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

// ─── HUỶ ĐƠN ────────────────────────────────────────────────────────────────
export function CancelBookingForm({
  reference, refundLabel, canCancel, blockReason,
}: {
  reference: string; refundLabel: string; canCancel: boolean; blockReason: string | null;
}) {
  const [state, action, pending] = useActionState(cancelBookingAction, initial);

  if (!canCancel) {
    return <p className="text-sm text-ink-soft">{blockReason ?? 'Đơn này không huỷ được.'}</p>;
  }

  return (
    <details className="rounded-xl border border-mist bg-ivory-200 p-4">
      <summary className="cursor-pointer text-sm font-medium text-midnight">Huỷ đơn này</summary>
      <form action={action} className="mt-3">
        <input type="hidden" name="reference" value={reference} />
        <p className="rounded-xl bg-ivory-100 px-3 py-2 text-sm text-ink-muted">
          Nếu huỷ bây giờ, bạn được hoàn <strong className="text-midnight">{refundLabel}</strong>.
        </p>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Lý do huỷ *</span>
          <input name="reason" required minLength={5} className={inputCls}
                 placeholder="VD: Đổi lịch bay, có việc đột xuất…" />
        </label>
        <Button type="submit" variant="outline" className="mt-3" disabled={pending}>
          {pending ? 'Đang xử lý…' : 'Xác nhận huỷ đơn'}
        </Button>
        <Feedback state={state} />
      </form>
    </details>
  );
}

// ─── KHIẾU NẠI ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'service_quality', label: 'Chất lượng dịch vụ không như mô tả' },
  { value: 'no_show', label: 'Đối tác không phục vụ / không đón' },
  { value: 'safety', label: 'Vấn đề an toàn' },
  { value: 'billing', label: 'Sai lệch về tiền' },
  { value: 'other', label: 'Vấn đề khác' },
];

export function OpenDisputeForm({ references }: { references: readonly { reference: string; title: string }[] }) {
  const [state, action, pending] = useActionState(openDisputeAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-medium text-midnight">Mở khiếu nại mới</p>
      <div className="mt-4 grid gap-3">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Đơn hàng *</span>
          <select name="reference" required className={inputCls} defaultValue="">
            <option value="" disabled>Chọn đơn hàng…</option>
            {references.map((r) => (
              <option key={r.reference} value={r.reference}>{r.reference} — {r.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Loại vấn đề *</span>
          <select name="category" required className={inputCls} defaultValue={CATEGORIES[0].value}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tiêu đề *</span>
          <input name="subject" required minLength={5} className={inputCls}
                 placeholder="Tóm tắt vấn đề trong một câu" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Mô tả chi tiết *</span>
          <textarea name="description" required rows={4} minLength={20}
                    className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
                    placeholder="Chuyện gì đã xảy ra, khác gì so với mô tả trên trang dịch vụ, bạn mong muốn xử lý thế nào." />
        </label>
      </div>
      <Button type="submit" variant="primary" className="mt-4" disabled={pending}>
        {pending ? 'Đang gửi…' : 'Gửi khiếu nại'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function DisputeReplyForm({ disputeId }: { disputeId: string }) {
  const [state, action, pending] = useActionState(replyDisputeAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="disputeId" value={disputeId} />
      <input name="body" required minLength={2} placeholder="Trả lời…"
             className="h-10 min-w-[200px] flex-1 rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal" />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? 'Đang gửi…' : 'Gửi'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
