'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  savePostAction, saveBannerAction, setPostStatusAction, toggleBannerAction, type ContentState,
} from './actions';

const initial: ContentState = { error: null, notice: null };
const inputCls = 'h-10 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';
const areaCls = 'w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal';

function Feedback({ state }: { state: ContentState }) {
  if (state.error) return <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>;
  if (state.notice) return <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p>;
  return null;
}

export interface PostValues {
  id: string; titleVi: string; titleEn: string;
  excerptVi: string; excerptEn: string;
  bodyVi: string; bodyEn: string;
  categorySlug: string | null; status: string;
}

export function PostForm({ values, categories }: {
  values?: PostValues;
  categories: readonly { slug: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(savePostAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      {values ? <input type="hidden" name="id" value={values.id} /> : null}
      <p className="font-medium text-midnight">{values ? 'Sửa bài viết' : 'Viết bài mới'}</p>
      <p className="mt-1 text-sm text-ink-soft">
        Nội dung viết bằng Markdown đơn giản: <code>## Tiêu đề</code>, đoạn văn, và <code>- </code> cho danh sách.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tiêu đề (Tiếng Việt) *</span>
          <input name="titleVi" required defaultValue={values?.titleVi} className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tiêu đề (English)</span>
          <input name="titleEn" defaultValue={values?.titleEn} className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tóm tắt (Tiếng Việt) *</span>
          <textarea name="excerptVi" rows={2} required defaultValue={values?.excerptVi} className={areaCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tóm tắt (English)</span>
          <textarea name="excerptEn" rows={2} defaultValue={values?.excerptEn} className={areaCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Nội dung (Tiếng Việt) *</span>
          <textarea name="bodyVi" rows={10} required defaultValue={values?.bodyVi} className={areaCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Nội dung (English)</span>
          <textarea name="bodyEn" rows={10} defaultValue={values?.bodyEn} className={areaCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Danh mục liên quan</span>
          <select name="categorySlug" defaultValue={values?.categorySlug ?? ''} className={inputCls}>
            <option value="">Không gắn danh mục</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Trạng thái *</span>
          <select name="status" defaultValue={values?.status ?? 'draft'} className={inputCls}>
            <option value="draft">Nháp</option>
            <option value="published">Đăng công khai</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </label>
      </div>

      <Button type="submit" variant="primary" size="sm" className="mt-4" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Lưu bài viết'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function PostStatusButton({ id, to, label }: { id: string; to: string; label: string }) {
  const [state, action, pending] = useActionState(setPostStatusAction, initial);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={to} />
      <button type="submit" disabled={pending} className="text-sm text-royal hover:underline disabled:opacity-50">
        {label}
      </button>
      {state.error ? <p role="alert" className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

export function BannerForm() {
  const [state, action, pending] = useActionState(saveBannerAction, initial);
  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-medium text-midnight">Thêm / sửa banner</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Vị trí *</span>
          <select name="placement" className={inputCls} defaultValue="home_hero">
            <option value="home_hero">Trang chủ — khu hero</option>
            <option value="category_top">Đầu trang danh mục</option>
            <option value="checkout_side">Cạnh trang thanh toán</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Thứ tự</span>
          <input name="sortOrder" type="number" min={0} max={99} defaultValue="1" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tiêu đề (Tiếng Việt) *</span>
          <input name="headlineVi" required className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Tiêu đề (English)</span>
          <input name="headlineEn" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Mô tả phụ (Tiếng Việt)</span>
          <input name="subheadVi" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Mô tả phụ (English)</span>
          <input name="subheadEn" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Nhãn nút</span>
          <input name="ctaLabelVi" defaultValue="Xem ngay" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Đường dẫn *</span>
          <input name="linkUrl" required defaultValue="/danh-muc" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Bắt đầu</span>
          <input name="startsAt" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Kết thúc</span>
          <input name="endsAt" type="date" className={inputCls} />
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="isActive" defaultChecked className="accent-champagne" />
        Đang hiển thị
      </label>
      <Button type="submit" variant="primary" size="sm" className="mt-4" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Lưu banner'}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function ToggleBanner({ id, isActive }: { id: string; isActive: boolean }) {
  const [state, action, pending] = useActionState(toggleBannerAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={isActive ? 'off' : 'on'} />
      <button type="submit" disabled={pending} className="text-sm text-royal hover:underline disabled:opacity-50">
        {isActive ? 'Tắt' : 'Bật'}
      </button>
      {state.error ? <p role="alert" className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
