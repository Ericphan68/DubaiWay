'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { respondReviewAction, type RespondState } from './actions';

const initial: RespondState = { error: null, notice: null };

export function RespondForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(respondReviewAction, initial);
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="body" rows={2} required minLength={5} maxLength={1000}
        placeholder="Phản hồi công khai. Trả lời cụ thể vào vấn đề khách nêu sẽ hiệu quả hơn lời cảm ơn chung chung."
        className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
      />
      <Button type="submit" variant="outline" size="sm" className="mt-2" disabled={pending}>
        {pending ? 'Đang đăng…' : 'Đăng phản hồi'}
      </Button>
      {state.error ? <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}
