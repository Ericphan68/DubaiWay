'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  requestResetAction, signInAction, signUpAction, type AuthFormState,
} from '@/app/dang-nhap/actions';

const initial: AuthFormState = { error: null };

const inputCls =
  'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal';

function Field({
  label, name, type = 'text', error, required, placeholder, autoComplete, defaultValue, hint,
}: {
  label: string; name: string; type?: string; error?: string; required?: boolean;
  placeholder?: string; autoComplete?: string; defaultValue?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={name} name={name} type={type} required={required} placeholder={placeholder}
        autoComplete={autoComplete} defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(inputCls, error && 'border-red-400')}
      />
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
      {error ? <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);

  // Khu đối tác / quản trị: tải lại đầy đủ để khung trang dựng đúng theo tên miền.
  useEffect(() => {
    if (state.hardRedirect) window.location.assign(state.hardRedirect);
  }, [state.hardRedirect]);

  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email" name="email" type="email" required autoComplete="email"
             placeholder="ban@email.com" error={state.fieldErrors?.email}
             defaultValue={state.values?.email} />
      {/* Mật khẩu KHÔNG bao giờ được điền lại từ máy chủ. */}
      <Field label="Mật khẩu" name="password" type="password" required autoComplete="current-password"
             placeholder="••••••••" error={state.fieldErrors?.password} />

      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full"
              disabled={pending || Boolean(state.hardRedirect)}>
        {pending || state.hardRedirect ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/quen-mat-khau" className="text-royal hover:underline">Quên mật khẩu?</Link>
        <Link href="/dang-ky" className="text-royal hover:underline">Tạo tài khoản mới</Link>
      </div>
    </form>
  );
}

export function SignUpForm({ referralCode }: { referralCode?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="Họ và tên" name="fullName" required autoComplete="name"
             placeholder="Nguyễn Văn A" error={state.fieldErrors?.fullName}
             defaultValue={state.values?.fullName} />
      <Field label="Email" name="email" type="email" required autoComplete="email"
             placeholder="ban@email.com" error={state.fieldErrors?.email}
             defaultValue={state.values?.email} />
      <Field label="Mật khẩu" name="password" type="password" required autoComplete="new-password"
             placeholder="Ít nhất 8 ký tự" error={state.fieldErrors?.password}
             hint="Dùng ít nhất 8 ký tự, nên có cả chữ và số." />
      <Field label="Mã giới thiệu" name="referralCode" placeholder="Nếu có"
             defaultValue={state.values?.referralCode ?? referralCode}
             hint="Người giới thiệu bạn sẽ nhận thưởng khi bạn hoàn tất giao dịch đầu tiên." />

      <label className="flex items-start gap-2.5 text-sm text-ink-muted">
        <input type="checkbox" name="accept" className="mt-0.5 accent-champagne" required />
        <span>
          Tôi đồng ý với <Link href="/dieu-khoan" className="text-royal hover:underline">Điều khoản sử dụng</Link>
          {' '}và <Link href="/dieu-khoan" className="text-royal hover:underline">Chính sách bảo mật</Link>.
        </span>
      </label>
      {state.fieldErrors?.accept ? (
        <p className="text-xs text-red-600">{state.fieldErrors.accept}</p>
      ) : null}

      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Đã có tài khoản? <Link href="/dang-nhap" className="text-royal hover:underline">Đăng nhập</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(requestResetAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" required autoComplete="email"
             placeholder="ban@email.com" error={state.fieldErrors?.email} />

      {state.notice ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {state.notice}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Đang gửi…' : 'Gửi hướng dẫn đặt lại'}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        <Link href="/dang-nhap" className="text-royal hover:underline">← Quay lại đăng nhập</Link>
      </p>
    </form>
  );
}
