import type { ReactNode } from 'react';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Logo } from '@/components/ui/Logo';
import { SignInForm } from '@/components/account/AuthForms';
import { getAuthProvider } from '@/server/auth';
import { DEMO_CREDENTIALS } from '@/server/auth/memory-provider';
import { urlForArea } from '@/config/hosts';

/**
 * Khung trang đăng nhập dùng cho khu đối tác và khu quản trị.
 *
 * Đặt NGOÀI thư mục /merchant và /admin là có chủ ý: layout của hai khu đó
 * đẩy người chưa đăng nhập về trang đăng nhập, nên nếu trang đăng nhập nằm
 * trong chính layout ấy thì sẽ chuyển hướng vòng tròn không dứt.
 */
export function AreaSignIn({
  landing, eyebrow, title, description, footer, demoFilter,
}: {
  /**
   * Nơi đến sau khi đăng nhập, viết dạng CÓ TIỀN TỐ (`/merchant`, `/admin`).
   *
   * Không dùng `/` ở đây. Server action chuyển hướng bằng điều hướng mềm của
   * Next.js, và lệnh viết lại đường dẫn trong middleware không phải lúc nào
   * cũng áp được cho loại yêu cầu đó — kết quả là hiện nhầm trang khách. Đi
   * qua đường dẫn có tiền tố thì middleware trả về một lệnh chuyển hướng thật,
   * buộc trình duyệt tải lại đầy đủ nên luôn ra đúng khu.
   */
  landing: string;
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
  /** Lọc danh sách tài khoản thử nghiệm cho đúng khu, tránh bày thừa. */
  demoFilter: (roles: readonly string[]) => boolean;
}) {
  const provider = getAuthProvider();
  const demo = DEMO_CREDENTIALS.accounts.filter((a) => demoFilter(a.roles));

  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="flex justify-center"><Logo prefetch={false} /></div>
        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-champagne-600">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-center font-display text-2xl font-medium text-midnight">
          {title}
        </h1>
        <p className="mt-1 text-center text-sm text-ink-muted">{description}</p>

        <div className="mt-7 rounded-2xl border border-mist bg-ivory-100 p-6">
          <SignInForm next={landing} />
        </div>

        {footer ? <div className="mt-5 text-center text-sm text-ink-muted">{footer}</div> : null}

        <p className="mt-6 text-center text-xs text-ink-soft">
          Không phải khu vực bạn cần?{' '}
          <Link href={urlForArea('customer')} className="text-royal hover:underline">
            Về trang DubaiWay dành cho khách
          </Link>
        </p>

        {provider.isMemoryMode && demo.length > 0 ? (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Chế độ thử nghiệm — chưa kết nối Supabase</p>
            <p className="mt-1">
              Tài khoản demo dùng chung mật khẩu{' '}
              <code className="font-mono">{DEMO_CREDENTIALS.password}</code>:
            </p>
            <ul className="mt-2 space-y-0.5 font-mono text-xs">
              {demo.map((a) => <li key={a.email}>{a.email} — {a.roles.join(', ')}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

/** Vai trò thuộc nhân sự nền tảng — dùng để lọc tài khoản demo cho khu quản trị. */
export const STAFF_ROLES = ['super_admin', 'finance', 'merchant_reviewer', 'service_reviewer', 'support'];
