import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { Logo } from '@/components/ui/Logo';
import { SignUpForm } from '@/components/account/AuthForms';
import { getSessionUser } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Tạo tài khoản',
  description: 'Tạo tài khoản DubaiWay để đặt dịch vụ, lưu yêu thích và nhận thưởng giới thiệu.',
  robots: { index: false, follow: true },
};

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SignUpPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) redirect('/tai-khoan');

  const sp = await searchParams;
  // Mã giới thiệu đến từ link chia sẻ: /dang-ky?ref=LINH2K7X
  const referralCode = typeof sp.ref === 'string' ? sp.ref.toUpperCase() : undefined;

  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-medium text-midnight">Tạo tài khoản</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Miễn phí. Đặt dịch vụ nhanh hơn và theo dõi voucher ở một nơi.
        </p>

        {referralCode ? (
          <p className="mt-4 rounded-xl bg-champagne/[0.08] px-4 py-2.5 text-center text-sm text-champagne-600">
            Bạn được giới thiệu với mã <strong className="font-mono">{referralCode}</strong>
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-mist bg-ivory-100 p-6">
          <SignUpForm referralCode={referralCode} />
        </div>
      </div>
    </Section>
  );
}
