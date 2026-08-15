import { siteConfig } from '@/config/site';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Section } from '@/components/ui/Section';
import {
  IconWhatsapp,
  IconFacebook,
  IconMail,
  IconPhone,
  IconArrowUpRight,
} from '@/components/ui/icons';

const channels = [
  {
    label: 'WhatsApp',
    desc: 'Nhắn trực tiếp, phản hồi nhanh',
    href: whatsappLink(whatsappMessages.default),
    Icon: IconWhatsapp,
    external: true,
  },
  {
    label: 'Facebook Fanpage',
    desc: 'Theo dõi ưu đãi mới nhất',
    href: siteConfig.contact.fanpage,
    Icon: IconFacebook,
    external: true,
  },
  {
    label: 'Yêu cầu báo giá',
    desc: 'Gửi nhu cầu, nhận tư vấn chi tiết',
    href: '/yeu-cau-bao-gia',
    Icon: IconMail,
    external: false,
  },
  {
    label: 'Yêu cầu gọi lại',
    desc: 'Để lại số, DubaiWay gọi cho bạn',
    href: '/lien-he#callback',
    Icon: IconPhone,
    external: false,
  },
];

export function ConsultCTA() {
  return (
    <Section background="midnight">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div className="text-white">
          <span className="eyebrow text-champagne-400">
            <span className="route-dot" /> Cần tư vấn?
          </span>
          <h2 className="mt-3 text-display-md font-medium">
            Nói chuyện với người thật, không phải chatbot
          </h2>
          <p className="mt-3 max-w-md text-white/70">
            Chọn kênh bạn thấy tiện. Đội ngũ DubaiWay tư vấn miễn phí, giúp bạn so sánh phương án và
            chốt lịch trình phù hợp nhất.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map(({ label, desc, href, Icon, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex items-center gap-4 rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.09] hover:ring-champagne-400/40"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-champagne text-midnight">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{label}</p>
                <p className="truncate text-xs text-white/60">{desc}</p>
              </div>
              <IconArrowUpRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-champagne-400" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
