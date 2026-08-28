'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { reviewMerchantAction, reviewServiceAction, type ReviewState } from './actions';

const initial: ReviewState = { error: null, notice: null };

export function MerchantReviewForm({
  merchantId, options,
}: {
  merchantId: string;
  options: { value: string; label: string; needsReason?: boolean }[];
}) {
  const [state, action, pending] = useActionState(reviewMerchantAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="merchantId" value={merchantId} />
      <div className="min-w-[150px]">
        <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">
          Chuyển sang
        </label>
        <select name="to" className="h-10 w-full rounded-lg border border-mist bg-ivory-100 px-2 text-sm">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">
          Lý do <span className="font-normal normal-case">(bắt buộc khi từ chối hoặc yêu cầu bổ sung)</span>
        </label>
        <input name="reason" maxLength={500} placeholder="VD: Giấy phép hết hạn 03/2026"
               className="h-10 w-full rounded-lg border border-mist bg-ivory-100 px-2 text-sm" />
      </div>
      <Button type="submit" variant="navy" size="sm" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Áp dụng'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}

export function ServiceReviewForm({
  serviceId, options,
}: {
  serviceId: string;
  options: { value: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(reviewServiceAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="serviceId" value={serviceId} />
      <select name="to" className="h-10 rounded-lg border border-mist bg-ivory-100 px-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input name="reason" maxLength={500} placeholder="Lý do (nếu yêu cầu bổ sung)"
             className="h-10 min-w-[200px] flex-1 rounded-lg border border-mist bg-ivory-100 px-2 text-sm" />
      <Button type="submit" variant="navy" size="sm" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Áp dụng'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}
