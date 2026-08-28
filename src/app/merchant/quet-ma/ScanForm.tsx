'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { scanVoucherAction, type ScanState } from './actions';

// Giá trị khởi tạo khai báo ở đây, không ở file 'use server':
// Next.js chỉ cho phép file server action export hàm async.
const initialScanState: ScanState = { outcome: 'idle', message: '' };

const TONE: Record<string, string> = {
  success:        'border-emerald-300 bg-emerald-50 text-emerald-900',
  duplicate:      'border-red-300 bg-red-50 text-red-900',
  invalid:        'border-red-300 bg-red-50 text-red-900',
  expired:        'border-amber-300 bg-amber-50 text-amber-900',
  cancelled:      'border-amber-300 bg-amber-50 text-amber-900',
  wrong_merchant: 'border-red-300 bg-red-50 text-red-900',
  forbidden:      'border-red-300 bg-red-50 text-red-900',
};

export function ScanForm() {
  const [state, action, pending] = useActionState(scanVoucherAction, initialScanState);

  return (
    <>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="code" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Mã voucher hoặc nội dung QR
          </label>
          <input
            id="code" name="code" autoFocus autoComplete="off"
            placeholder="DW-XXXXXX-01"
            className="h-12 w-full rounded-xl border border-mist bg-ivory-100 px-3 font-mono text-sm text-midnight outline-none focus:border-royal"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? 'Đang kiểm tra…' : 'Xác nhận sử dụng'}
        </Button>
      </form>

      {state.outcome !== 'idle' ? (
        <div
          role="status"
          className={`mt-5 rounded-2xl border p-5 ${TONE[state.outcome] ?? 'border-mist bg-ivory-100'}`}
        >
          <p className="flex items-center gap-2 font-display text-lg">
            {state.outcome === 'success' ? '✓' : '✕'} {state.message}
          </p>

          {state.detail ? (
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              <Row label="Mã đơn" value={state.detail.reference} mono />
              <Row label="Dịch vụ" value={state.detail.serviceTitle} />
              <Row label="Khách" value={state.detail.guestName} />
              <Row label="Số khách" value={`${state.detail.guestCount} người`} />
              <Row label="Ngày sử dụng" value={new Date(`${state.detail.serviceDate}T00:00:00`).toLocaleDateString('vi-VN')} />
              {state.detail.redeemedAt ? (
                <Row label="Đã quét lúc" value={new Date(state.detail.redeemedAt).toLocaleString('vi-VN')} />
              ) : null}
            </dl>
          ) : null}

          {state.outcome === 'duplicate' ? (
            <p className="mt-3 text-sm">
              Voucher này đã được xác nhận trước đó. Nếu khách khiếu nại, liên hệ DubaiWay để kiểm tra lịch sử quét.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="opacity-70">{label}</dt>
      <dd className={mono ? 'font-mono' : ''}>{value}</dd>
    </div>
  );
}
