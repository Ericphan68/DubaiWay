import { siteConfig } from '@/config/site';
import { whatsappLink } from '@/lib/whatsapp';
import { IconWhatsapp, IconFacebook, IconMail, IconPhone, IconArrowUpRight } from '@/components/ui/icons';

/** Bốn kênh liên hệ nhanh — dùng lại ở nhiều trang, tin nhắn WhatsApp theo ngữ cảnh. */
export function ConsultChannels({
  waMessage,
  quoteHref = '/yeu-cau-bao-gia',
}: {
  waMessage: string;
  quoteHref?: string;
}) {
  const channels = [
    { label: 'WhatsApp', desc: 'Phản hồi nhanh nhất', href: whatsappLink(waMessage), Icon: IconWhatsapp, external: true },
    { label: 'Facebook Fanpage', desc: 'Nhắn tin qua trang', href: siteConfig.contact.fanpage, Icon: IconFacebook, external: true },
    { label: 'Gửi yêu cầu báo giá', desc: 'Điền nhu cầu chi tiết', href: quoteHref, Icon: IconMail, external: false },
    { label: 'Yêu cầu gọi lại', desc: 'DubaiWay gọi cho bạn', href: '/lien-he#callback', Icon: IconPhone, external: false },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {channels.map(({ label, desc, href, Icon, external }) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="group flex items-center gap-3 rounded-2xl border border-mist bg-ivory-100 p-4 transition-colors hover:border-royal/30 hover:shadow-card"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist-200 text-royal">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-midnight">{label}</p>
            <p className="truncate text-xs text-ink-soft">{desc}</p>
          </div>
          <IconArrowUpRight className="h-4 w-4 text-ink-soft transition-colors group-hover:text-royal" />
        </a>
      ))}
    </div>
  );
}
