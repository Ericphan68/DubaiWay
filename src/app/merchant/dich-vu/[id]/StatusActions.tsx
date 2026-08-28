'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  submitForReviewAction, toggleServiceActiveAction, type ServiceFormState,
} from '../actions';

const initial: ServiceFormState = { error: null, notice: null };

export function SubmitForReview({ serviceId, disabled }: { serviceId: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(submitForReviewAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <Button type="submit" variant="primary" disabled={pending || disabled}>
        {pending ? 'Đang nộp…' : 'Nộp cho DubaiWay duyệt'}
      </Button>
      {state.error ? <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}

export function ToggleActive({ serviceId, to }: { serviceId: string; to: 'active' | 'inactive' }) {
  const [state, action, pending] = useActionState(toggleServiceActiveAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="to" value={to} />
      <Button type="submit" variant={to === 'active' ? 'primary' : 'outline'} disabled={pending}>
        {pending ? 'Đang lưu…' : to === 'active' ? 'Mở bán trở lại' : 'Tạm ngừng bán'}
      </Button>
      {state.error ? <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}
