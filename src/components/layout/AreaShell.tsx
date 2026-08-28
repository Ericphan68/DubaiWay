import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { urlForArea, type Area } from '@/config/hosts';
import { siteConfig } from '@/config/site';

/**
 * Khung đầu và cuối trang cho tên miền đối tác và quản trị.
 *
 * Hai khu này KHÔNG dùng menu của trang khách. Đối tác đang quản lý dịch vụ
 * không cần thấy "Vé máy bay", "Cẩm nang" hay nút "Nhận tư vấn"; hiện lên chỉ
 * gây rối và làm trang nội bộ trông như trang bán hàng.
 */

const AREA_LABEL: Record<Exclude<Area, 'customer'>, string> = {
  merchant: 'Khu đối tác',
  admin: 'Khu quản trị',
};

export function AreaHeader({ area }: { area: Exclude<Area, 'customer'> }) {
  return (
    <header className="border-b border-mist bg-ivory">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo tone="dark" prefetch={false} />
          <span aria-hidden className="h-5 w-px bg-mist" />
          <span className="text-sm font-medium text-ink-muted">{AREA_LABEL[area]}</span>
        </div>
        <a
          href={urlForArea('customer')}
          className="text-sm text-ink-muted transition-colors hover:text-champagne-600"
        >
          Về trang khách ↗
        </a>
      </div>
    </header>
  );
}

export function AreaFooter({ area }: { area: Exclude<Area, 'customer'> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-mist bg-ivory-100">
      <div className="shell flex flex-col gap-2 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {siteConfig.name} — {AREA_LABEL[area]}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/dieu-khoan-doi-tac" className="hover:text-champagne-600">Điều khoản đối tác</Link>
          <Link href="/chinh-sach-bao-mat" className="hover:text-champagne-600">Chính sách bảo mật</Link>
          <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-champagne-600">
            {siteConfig.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
