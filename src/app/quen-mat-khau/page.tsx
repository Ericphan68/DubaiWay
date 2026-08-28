import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Logo } from '@/components/ui/Logo';
import { ResetPasswordForm } from '@/components/account/AuthForms';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-medium text-midnight">Quên mật khẩu</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>
        <div className="mt-7 rounded-2xl border border-mist bg-ivory-100 p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </Section>
  );
}
