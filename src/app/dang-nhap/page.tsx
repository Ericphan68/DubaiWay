import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { Logo } from '@/components/ui/Logo';
import { SignInForm } from '@/components/account/AuthForms';
import { getSessionUser, getAuthProvider } from '@/server/auth';
import { DEMO_CREDENTIALS } from '@/server/auth/memory-provider';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản DubaiWay để quản lý đơn hàng, voucher và thưởng giới thiệu.',
  robots: { index: false, follow: true },
};

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SignInPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) redirect('/tai-khoan');

  const sp = await searchParams;
  const next = typeof sp.next === 'string' ? sp.next : undefined;
  const provider = getAuthProvider();

  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-medium text-midnight">
          Đăng nhập
        </h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Quản lý đơn hàng, voucher và thưởng giới thiệu của bạn.
        </p>

        <div className="mt-7 rounded-2xl border border-mist bg-ivory-100 p-6">
          <SignInForm next={next} />
        </div>

        {provider.isMemoryMode ? (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Chế độ thử nghiệm — chưa kết nối Supabase</p>
            <p className="mt-1">Tài khoản demo dùng chung mật khẩu <code className="font-mono">{DEMO_CREDENTIALS.password}</code>:</p>
            <ul className="mt-2 space-y-0.5 font-mono text-xs">
              {DEMO_CREDENTIALS.accounts.map((a) => (
                <li key={a.email}>{a.email} — {a.roles.join(', ')}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
