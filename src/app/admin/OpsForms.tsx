'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  hideReviewAction, saveCategoryAction, saveCouponAction, toggleCategoryAction,
  toggleCouponAction, updateDisputeAction, type OpsState,
} from './ops-actions';

const initial: OpsState = { error: null, notice: null };
const inputCls = 'h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

function Feedback({ state }: { state: OpsState }) {
  if (state.error) return <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>;
  if (state.notice) return <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p>;
  return null;
}

// ─── DANH MỤC ───────────────────────────────────────────────────────────────
export function CategoryForm({ values }: {
  values?: { slug: string; nameVi: string; nameEn: string; sortOrder: number; isActive: boolean };
}) {
  const [state, action, pending] = useActionState(saveCategoryAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-medium text-midnight">{values ? 'Sửa danh mục' : 'Thêm danh mục mới'}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Slug (đường dẫn) *</span>
          <input name="slug" required defaultValue={values?.slug} readOnly={Boolean(values)}
                 className={inputCls} placeholder="spa-wellness" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Thứ tự hiển thị</span>
          <input name="sortOrder" type="number" min={0} max={999}
                 defaultValue={String(values?.sortOrder ?? 99)} className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tên tiếng Việt *</span>
          <input name="nameVi" required defaultValue={values?.nameVi} className={inputCls}
                 placeholder="Spa & chăm sóc sức khoẻ" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tên tiếng Anh *</span>
          <input name="nameEn" required defaultValue={values?.nameEn} className={inputCls}
                 placeholder="Spa & Wellness" />
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="isActive" defaultChecked={values?.isActive ?? true} className="accent-champagne" />
        Hiển thị trên sàn
      </label>
      <Button type="submit" variant="primary" size="sm" className="mt-4" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Lưu danh mục'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function ToggleCategory({ slug, isActive }: { slug: string; isActive: boolean }) {
  const [state, action, pending] = useActionState(toggleCategoryAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="to" value={isActive ? 'off' : 'on'} />
      <button type="submit" disabled={pending} className="text-sm text-royal hover:underline disabled:opacity-50">
        {isActive ? 'Tắt' : 'Bật'}
      </button>
      {state.error ? <p role="alert" className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

// ─── KHUYẾN MÃI ─────────────────────────────────────────────────────────────
export function CouponForm({ categories }: { categories: readonly { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveCouponAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-medium text-midnight">Tạo / sửa mã khuyến mãi</p>
      <p className="mt-1 text-sm text-ink-soft">
        Nhập mã đã có để sửa. Số lượt đã dùng được giữ nguyên.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Mã *</span>
          <input name="code" required maxLength={20} className={`${inputCls} font-mono uppercase`} placeholder="DUBAI10" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Loại *</span>
          <select name="kind" className={inputCls} defaultValue="percent">
            <option value="percent">Giảm theo %</option>
            <option value="fixed">Giảm số tiền cố định</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ai chịu chi phí *</span>
          <select name="fundedBy" className={inputCls} defaultValue="platform">
            <option value="platform">DubaiWay</option>
            <option value="merchant">Đối tác</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Giảm (%)</span>
          <input name="percent" type="number" min={0} max={100} step="0.01" className={inputCls} placeholder="10" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Giảm (USD)</span>
          <input name="amountMajor" type="number" min={0} step="0.01" className={inputCls} placeholder="50" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Giảm tối đa (USD)</span>
          <input name="maxDiscountMajor" type="number" min={0} step="0.01" className={inputCls} placeholder="100" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Đơn tối thiểu (USD)</span>
          <input name="minOrderMajor" type="number" min={0} step="0.01" defaultValue="0" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tổng lượt</span>
          <input name="usageLimitTotal" type="number" min={1} className={inputCls} placeholder="Không giới hạn" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Lượt / khách *</span>
          <input name="usageLimitPerUser" type="number" min={1} defaultValue="1" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Bắt đầu</span>
          <input name="startsAt" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Kết thúc</span>
          <input name="endsAt" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Chỉ áp dụng danh mục</span>
          <select name="categorySlug" className={inputCls} defaultValue="">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="isActive" defaultChecked className="accent-champagne" />
        Đang áp dụng
      </label>
      <Button type="submit" variant="primary" size="sm" className="mt-4" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Lưu mã'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function ToggleCoupon({ code, isActive }: { code: string; isActive: boolean }) {
  const [state, action, pending] = useActionState(toggleCouponAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="to" value={isActive ? 'off' : 'on'} />
      <button type="submit" disabled={pending} className="text-sm text-royal hover:underline disabled:opacity-50">
        {isActive ? 'Tắt' : 'Bật'}
      </button>
      {state.error ? <p role="alert" className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

// ─── ẨN ĐÁNH GIÁ ────────────────────────────────────────────────────────────
export function HideReviewForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(hideReviewAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input name="reason" required placeholder="Lý do ẩn (bắt buộc)"
             className={`${inputCls} min-w-[220px] flex-1`} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? 'Đang ẩn…' : 'Ẩn đánh giá'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}

// ─── KHIẾU NẠI ──────────────────────────────────────────────────────────────
export function DisputeControls({ disputeId, options }: {
  disputeId: string; options: readonly { value: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(updateDisputeAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="disputeId" value={disputeId} />
      <select name="to" className={`${inputCls} w-auto`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input name="resolution" placeholder="Kết luận (bắt buộc khi đóng)"
             className={`${inputCls} min-w-[220px] flex-1`} />
      <Button type="submit" variant="navy" size="sm" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Áp dụng'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}
