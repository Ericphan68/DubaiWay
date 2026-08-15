'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

/** Form đăng nhập MẪU — chỉ giao diện, không xác thực thật (Phase demo). */
export function LoginForm() {
  const router = useRouter();

  return (
    <form
      className="w-full rounded-2xl border border-mist bg-ivory-100 p-6 shadow-card sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/tai-khoan');
      }}
    >
      <p className="mb-4 rounded-xl bg-champagne-200/30 px-3 py-2 text-xs text-ink-muted">
        Đây là trang đăng nhập <strong>mẫu</strong> để minh hoạ giao diện — chưa kết nối hệ thống xác thực thật.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
        <input type="email" className={inputCls} placeholder="ban@email.com" />
      </label>
      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Mật khẩu</span>
        <input type="password" className={inputCls} placeholder="••••••••" />
      </label>

      <div className="mt-3 flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-ink-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-mist-400" /> Ghi nhớ đăng nhập
        </label>
        <Link href="/lien-he" className="text-royal hover:underline">Quên mật khẩu?</Link>
      </div>

      <Button type="submit" variant="primary" size="lg" className="mt-5 w-full">Đăng nhập</Button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-mist" /> hoặc <span className="h-px flex-1 bg-mist" />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button type="button" onClick={() => router.push('/tai-khoan')} className="h-11 rounded-full border border-mist-400 text-sm font-medium text-midnight transition-colors hover:bg-mist-200">
          Tiếp tục với Google
        </button>
        <button type="button" onClick={() => router.push('/tai-khoan')} className="h-11 rounded-full border border-mist-400 text-sm font-medium text-midnight transition-colors hover:bg-mist-200">
          Tiếp tục với Facebook
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Chưa có tài khoản? <Link href="/tai-khoan" className="font-semibold text-royal hover:underline">Xem tài khoản mẫu</Link>
      </p>
    </form>
  );
}
