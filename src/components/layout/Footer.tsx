import Link from 'next/link';
import { footerNav } from '@/config/nav';
import { siteConfig } from '@/config/site';
import { Logo } from '@/components/ui/Logo';
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconFacebook,
  IconInstagram,
  IconYoutube,
} from '@/components/ui/icons';

const socials = [
  { href: siteConfig.contact.fanpage, label: 'Facebook', Icon: IconFacebook },
  { href: siteConfig.contact.instagram, label: 'Instagram', Icon: IconInstagram },
  { href: siteConfig.contact.youtube, label: 'YouTube', Icon: IconYoutube },
];

export function Footer() {
  return (
    <footer className="bg-midnight-950 text-white/70">
      {/* Dải cam kết */}
      <div className="border-b border-white/10">
        <div className="shell grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Tư vấn tận tâm', 'Đội ngũ am hiểu điểm đến, phản hồi nhanh qua WhatsApp.'],
            ['Giá minh bạch', 'Mọi giá đều là tham khảo, xác nhận rõ trước khi đặt.'],
            ['Trọn gói linh hoạt', 'Vé, khách sạn, visa, tour và sự kiện trong một đầu mối.'],
            ['Đồng hành toàn cầu', 'Văn phòng tại Việt Nam và Dubai, hỗ trợ đa múi giờ.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <div className="route-line mb-3 w-10" />
              <p className="font-display text-base text-white">{title}</p>
              <p className="mt-1 text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="shell grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {siteConfig.description}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-400" />
              <span>{siteConfig.contact.officeVN}</span>
            </li>
            <li className="flex items-center gap-2">
              <IconPhone className="h-4 w-4 text-champagne-400" />
              <a href={`tel:${siteConfig.contact.hotline}`} className="hover:text-white">
                {siteConfig.contact.hotline}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <IconMail className="h-4 w-4 text-champagne-400" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-champagne-400 hover:text-champagne-400"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {footerNav.map((group) => (
          <div key={group.heading}>
            <p className="eyebrow mb-4 text-champagne-400">{group.heading}</p>
            <ul className="space-y-2.5 text-sm">
              {group.children.map((child) => (
                <li key={child.label}>
                  <Link href={child.href} className="text-white/65 transition-colors hover:text-white">
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {2026} {siteConfig.name}. Giá hiển thị là giá tham khảo, có thể thay đổi.</p>
          <div className="flex gap-5">
            <Link href="/dieu-khoan" className="hover:text-white/80">Điều khoản</Link>
            <Link href="/dieu-khoan#privacy" className="hover:text-white/80">Bảo mật</Link>
            <Link href="/lien-he" className="hover:text-white/80">Liên hệ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
