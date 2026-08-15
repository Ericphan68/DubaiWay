import { Suspense } from 'react';
import type { Metadata } from 'next';
import { img, photo } from '@/data/images';
import { siteConfig } from '@/config/site';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { PageHero } from '@/components/ui/PageHero';
import { QuoteRequestForm } from '@/components/shared/QuoteRequestForm';
import { IconWhatsapp, IconPhone, IconMail, IconClock } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Yêu cầu báo giá & tư vấn',
  description:
    'Gửi yêu cầu để nhận tư vấn và báo giá cho tour, vé máy bay, khách sạn, visa, sự kiện hoặc hành trình luxury từ đội ngũ DubaiWay.',
};

const reassurances = [
  { Icon: IconClock, title: 'Phản hồi nhanh', desc: 'Chuyên viên liên hệ trong giờ làm việc.' },
  { Icon: IconMail, title: 'Tư vấn miễn phí', desc: 'Không mất phí để nhận đề xuất và báo giá.' },
  { Icon: IconWhatsapp, title: 'Hỗ trợ đa kênh', desc: 'Qua WhatsApp, điện thoại hoặc email.' },
];

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Yêu cầu báo giá"
        title="Nhận tư vấn & báo giá từ DubaiWay"
        description="Chia sẻ nhu cầu của bạn — tour, vé, khách sạn, visa, sự kiện hay hành trình luxury. Đội ngũ DubaiWay sẽ liên hệ với đề xuất phù hợp."
        image={img(photo.conference, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Yêu cầu báo giá' }]}
      />

      <section className="shell grid gap-10 py-12 lg:grid-cols-[1fr_20rem] lg:py-16">
        <Suspense fallback={<div className="h-[32rem] rounded-2xl bg-mist-200" />}>
          <QuoteRequestForm />
        </Suspense>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-midnight p-6 text-white">
            <p className="font-display text-lg font-medium">Cần hỗ trợ ngay?</p>
            <p className="mt-1 text-sm text-white/70">Liên hệ trực tiếp với đội ngũ DubaiWay.</p>
            <div className="mt-4 space-y-2.5">
              <a
                href={whatsappLink(whatsappMessages.default)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white hover:bg-[#1eb757]"
              >
                <IconWhatsapp className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.contact.hotline}`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/25 text-sm font-medium text-white hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" /> {siteConfig.contact.hotline}
              </a>
            </div>
          </div>

          {reassurances.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-mist bg-ivory-100 p-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist-200 text-royal">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-midnight">{title}</p>
                <p className="text-xs text-ink-muted">{desc}</p>
              </div>
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}
