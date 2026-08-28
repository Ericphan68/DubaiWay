'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitReviewAction, type ReviewFormState } from './actions';

const initial: ReviewFormState = { error: null, notice: null };

const DETAIL_RATINGS = [
  { name: 'ratingQuality', label: 'Chất lượng' },
  { name: 'ratingValue', label: 'Đáng tiền' },
  { name: 'ratingService', label: 'Phục vụ' },
  { name: 'ratingAccuracy', label: 'Đúng mô tả' },
] as const;

export function ReviewForm({ reference, serviceTitle }: { reference: string; serviceTitle: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, initial);

  if (state.notice) {
    return (
      <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {state.notice}
      </p>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <input type="hidden" name="reference" value={reference} />
      <p className="font-medium text-midnight">Đánh giá “{serviceTitle}”</p>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Điểm tổng thể <span className="text-red-500">*</span>
        </legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="ratingOverall" value={n} required className="peer sr-only" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-mist text-sm text-ink-muted transition-colors peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-white">
                {n}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DETAIL_RATINGS.map((d) => (
          <label key={d.name}>
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              {d.label} <span className="font-normal text-ink-soft">(không bắt buộc)</span>
            </span>
            <select name={d.name} defaultValue=""
                    className="h-10 w-full rounded-xl border border-mist bg-ivory-100 px-2 text-sm">
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sao</option>)}
            </select>
          </label>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Nhận xét <span className="text-red-500">*</span>
        </span>
        <textarea
          name="comment" rows={4} required minLength={10} maxLength={2000}
          placeholder="Điều gì tốt, điều gì chưa ổn? Chi tiết cụ thể giúp khách sau chọn đúng."
          className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
        />
      </label>

      {state.error ? (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" variant="primary" className="mt-4" disabled={pending}>
        {pending ? 'Đang gửi…' : 'Gửi đánh giá'}
      </Button>
      <p className="mt-2 text-xs text-ink-soft">
        Đánh giá hiển thị công khai kèm tên bạn. Đối tác được phản hồi nhưng không sửa hay xoá được.
      </p>
    </form>
  );
}
