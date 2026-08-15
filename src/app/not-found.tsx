import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IconArrowRight } from '@/components/ui/icons';

const links = [
  { label: 'Tour du lịch', href: '/du-lich' },
  { label: 'Dubai Experiences', href: '/dubai' },
  { label: 'Holy Land', href: '/holy-land' },
  { label: 'Visa', href: '/visa' },
  { label: 'Vé máy bay', href: '/ve-may-bay' },
  { label: 'Cẩm nang', href: '/cam-nang' },
];

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-midnight text-white">
      <svg className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-24 w-full opacity-50" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d="M-20 60 C 320 20, 720 20, 1220 50" stroke="#B88A3B" strokeWidth="1.5" strokeDasharray="2 7" />
      </svg>

      <div className="shell py-20 text-center">
        <p className="font-display text-7xl font-semibold text-champagne-400 sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-3xl font-medium">Hành trình này chưa có trên bản đồ</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Trang bạn tìm không tồn tại hoặc đã được chuyển. Hãy quay lại và tiếp tục khám phá cùng DubaiWay.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="gold" size="lg">Về trang chủ <IconArrowRight className="h-4 w-4" /></Button>
          <Button href="/tim-kiem" variant="onDark" size="lg">Tìm kiếm</Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-champagne-400 hover:text-champagne-400">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
