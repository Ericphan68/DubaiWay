import Link from 'next/link';
import { footerNav } from '@/config/nav';
import { siteConfig } from '@/config/site';
import { Logo } from '@/components/ui/Logo';
import { getLocale } from '@/server/locale';
import { getDictionary } from '@/i18n';
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

export async function Footer() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <footer className="bg-midnight-950 text-white/70">
      {/*
        Dải mời đối tác — đặt ngay đầu footer nên xuất hiện ở cuối MỌI trang.
        Đây là kênh tăng nguồn cung của sàn: không có đối tác thì không có gì để bán.
      */}
      <section className="border-b border-white/10 bg-gradient-to-r from-midnight-950 via-midnight-900 to-midnight-800">
        <div className="shell grid gap-8 py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-400">
              {t.partnerCta.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium leading-tight text-white sm:text-3xl">
              {t.partnerCta.title}{' '}
              {/* Xuống dòng ở màn rộng; màn hẹp cần dấu cách để hai câu không dính nhau. */}
              <br className="hidden sm:block" />
              {t.partnerCta.titleLine2}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              {t.partnerCta.body}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/merchant/dang-ky"
                className="inline-flex h-12 items-center rounded-full bg-champagne px-7 text-sm font-medium text-white transition-colors hover:bg-champagne-600"
              >
                {t.partnerCta.primary}
              </Link>
              <Link
                href="/tro-thanh-doi-tac"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-sm font-medium text-white transition-colors hover:border-champagne-400 hover:text-champagne-400"
              >
                {t.partnerCta.secondary}
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              [t.partnerCta.stat2Value, t.partnerCta.stat2Title, t.partnerCta.stat2Desc],
              [t.partnerCta.stat3Value, t.partnerCta.stat3Title, t.partnerCta.stat3Desc],
            ].map(([value, title, desc]) => (
              <li key={title} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                <p className="font-display text-xl font-semibold text-champagne-400">{value}</p>
                <p className="mt-1 text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
