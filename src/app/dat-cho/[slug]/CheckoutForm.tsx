'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitBooking, type BookingActionState } from '../actions';
import { cn } from '@/lib/utils';

const initial: BookingActionState = { error: null };

const inputCls =
  'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal';

export function CheckoutForm({
  slug, packageId, date, adults, childCount,
}: {
  slug: string; packageId: string; date: string; adults: number;
  /** Không đặt tên là `children` vì React dành riêng tên đó cho nội dung lồng bên trong. */
  childCount: number;
}) {
  const [state, formAction, pending] = useActionState(submitBooking, initial);

  return (
    <form action={formAction} className="rounded-2xl border border-mist bg-ivory-100 p-5 sm:p-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="packageId" value={packageId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={childCount} />

      <h2 className="font-display text-xl font-medium text-midnight">Thông tin người sử dụng dịch vụ</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Chúng tôi gửi voucher và thông tin đón khách tới email này.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Họ và tên" name="fullName" error={state.fieldErrors?.fullName} required
               placeholder="Nguyễn Văn A" autoComplete="name" />
        <Field label="Email" name="email" type="email" error={state.fieldErrors?.email} required
               placeholder="ban@email.com" autoComplete="email" />
        <Field label="Số điện thoại" name="phone" type="tel" error={state.fieldErrors?.phone} required
               placeholder="+84 90 000 0000" autoComplete="tel" />
        <div className="sm:col-span-2">
          <label htmlFor="note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Ghi chú cho đối tác <span className="font-normal normal-case text-ink-soft">(không bắt buộc)</span>
          </label>
          <textarea
            id="note" name="note" rows={3} maxLength={1000}
            placeholder="Tên khách sạn để đón, dị ứng thực phẩm, yêu cầu đặc biệt…"
            className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm text-midnight outline-none focus:border-royal"
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="mt-5 w-full" disabled={pending}>
        {pending ? 'Đang xử lý…' : 'Xác nhận và thanh toán'}
      </Button>

      <p className="mt-3 text-center text-xs text-ink-soft">
        Bằng việc đặt dịch vụ, bạn đồng ý với{' '}
        <a href="/dieu-khoan" className="underline underline-offset-2">Điều khoản sử dụng</a> và{' '}
        <a href="/dieu-khoan" className="underline underline-offset-2">Chính sách bảo mật</a> của DubaiWay.
      </p>
    </form>
  );
}

function Field({
  label, name, error, type = 'text', required, placeholder, autoComplete,
}: {
  label: string; name: string; error?: string; type?: string;
  required?: boolean; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={name} name={name} type={type} required={required}
        placeholder={placeholder} autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(inputCls, error && 'border-red-400')}
      />
      {error ? <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
