'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { requestWithdrawalAction, type WithdrawState } from './actions';

const initial: WithdrawState = { error: null, notice: null };

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-xl border border-mist bg-ivory-200 px-3 py-2.5 font-mono text-sm text-midnight">
        {url}
      </code>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Trình duyệt chặn clipboard — người dùng vẫn bôi đen chép tay được.
            setCopied(false);
          }
        }}
      >
        {copied ? 'Đã chép ✓' : 'Chép link'}
      </Button>
    </div>
  );
}

export function WithdrawForm({ availableMajor }: { availableMajor: number }) {
  const [state, action, pending] = useActionState(requestWithdrawalAction, initial);

  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[160px] flex-1">
        <label htmlFor="amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Số tiền muốn rút (USD)
        </label>
        <input
          id="amount" name="amount" type="number" min={100} step="0.01" max={availableMajor}
          placeholder="100.00"
          className="h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal"
        />
      </div>
      <Button type="submit" variant="primary" disabled={pending || availableMajor <= 0}>
        {pending ? 'Đang gửi…' : 'Yêu cầu rút tiền'}
      </Button>

      {state.error ? (
        <p role="alert" className="w-full rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.notice ? (
        <p role="status" className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.notice}</p>
      ) : null}
    </form>
  );
}
