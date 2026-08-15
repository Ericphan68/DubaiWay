import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { img, photo } from '@/data/images';
import { Logo } from '@/components/ui/Logo';
import { LoginForm } from '@/components/account/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập (mẫu)',
  description: 'Trang đăng nhập mẫu của DubaiWay — minh hoạ giao diện tài khoản khách hàng.',
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <section className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Cột hình */}
      <div className="relative hidden lg:block">
        <Image src={img(photo.airplaneWindow, 1200)} alt="" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/40 to-midnight/30" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="font-display text-3xl font-medium">Hành trình của bạn, ở một nơi</p>
          <p className="mt-2 max-w-md text-white/75">
            Đăng nhập để theo dõi đơn đặt, yêu cầu báo giá và hành trình đã lưu cùng DubaiWay.
          </p>
        </div>
      </div>

      {/* Cột form */}
      <div className="flex items-center justify-center bg-ivory px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center lg:justify-start">
            <Link href="/"><Logo tone="dark" /></Link>
          </div>
          <h1 className="font-display text-2xl font-medium text-midnight">Đăng nhập tài khoản</h1>
          <p className="mt-1 text-sm text-ink-muted">Chào mừng trở lại với DubaiWay.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
