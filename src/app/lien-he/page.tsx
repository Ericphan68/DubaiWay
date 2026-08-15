import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { img, photo } from '@/data/images';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { PageHero } from '@/components/ui/PageHero';
import { ContactForm, CallbackForm } from '@/components/contact/ContactForms';
import { IconMapPin, IconPhone, IconMail, IconWhatsapp, IconFacebook } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Liên hệ DubaiWay',
  description: 'Liên hệ đội ngũ DubaiWay qua WhatsApp, điện thoại, email hoặc form. Văn phòng tại TP.HCM và Dubai.',
};

const offices = [
  { city: 'Văn phòng Việt Nam', address: siteConfig.contact.officeVN },
  { city: 'Văn phòng Dubai', address: siteConfig.contact.officeDXB },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Liên hệ"
        title="Nói chuyện với đội ngũ DubaiWay"
        description="Chọn kênh bạn thấy tiện. Chúng tôi luôn sẵn sàng tư vấn và hỗ trợ hành trình của bạn."
        image={img(photo.dubaiMarina, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]}
      />

      <section className="shell py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href={whatsappLink(whatsappMessages.default)} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-royal/30">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white"><IconWhatsapp className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-midnight">WhatsApp</p>
            <p className="text-xs text-ink-soft">Nhắn tin phản hồi nhanh</p>
          </a>
          <a href={`tel:${siteConfig.contact.hotline}`} className="group rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-royal/30">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist-200 text-royal"><IconPhone className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-midnight">Hotline</p>
            <p className="text-xs text-ink-soft">{siteConfig.contact.hotline}</p>
          </a>
          <a href={`mailto:${siteConfig.contact.email}`} className="group rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-royal/30">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist-200 text-royal"><IconMail className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-midnight">Email</p>
            <p className="text-xs text-ink-soft">{siteConfig.contact.email}</p>
          </a>
          <a href={siteConfig.contact.fanpage} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-royal/30">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist-200 text-royal"><IconFacebook className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-midnight">Fanpage</p>
            <p className="text-xs text-ink-soft">Theo dõi ưu đãi mới</p>
          </a>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm />
          <div className="space-y-6">
            <CallbackForm />
            <div className="rounded-2xl border border-mist bg-ivory-100 p-6">
              <h2 className="font-display text-lg font-medium text-midnight">Văn phòng</h2>
              <ul className="mt-4 space-y-4">
                {offices.map((o) => (
                  <li key={o.city} className="flex items-start gap-3">
                    <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-champagne-600" />
                    <div>
                      <p className="text-sm font-semibold text-midnight">{o.city}</p>
                      <p className="text-sm text-ink-muted">{o.address}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
