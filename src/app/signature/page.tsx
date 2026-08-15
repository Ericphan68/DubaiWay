import type { Metadata } from 'next';
import Image from 'next/image';
import { signaturePillars, signatureProcess } from '@/data/signature';
import { signatureServices } from '@/data/services';
import { img, photo } from '@/data/images';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { IconSparkle, IconWhatsapp, IconArrowUpRight } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'DubaiWay Signature — Hành trình luxury thiết kế riêng',
  description:
    'Vé thương gia, khách sạn 5 sao, private tour, chauffeur, du thuyền, VIP airport và visa concierge — hành trình bespoke với chuyên viên riêng 24/7.',
};

export default function SignaturePage() {
  return (
    <>
      {/* Hero luxury tối, cinematic */}
      <section className="relative isolate overflow-hidden bg-midnight text-white">
        <div className="absolute inset-0 -z-10">
          <Image src={img(photo.luxuryHotel, 2000, 70)} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/80 to-midnight/50" />
        </div>

        <svg className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-24 w-full opacity-60" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" aria-hidden>
          <path d="M-20 60 C 320 20, 720 20, 1220 50" stroke="#B88A3B" strokeWidth="1.5" strokeDasharray="2 7" />
        </svg>

        <div className="shell py-10 sm:py-16">
          <div className="[&_a:hover]:text-champagne-400 [&_span]:text-white/50 [&_[aria-current]]:text-white">
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'DubaiWay Signature' }]} />
          </div>
          <span className="eyebrow mt-6 text-champagne-400">
            <IconSparkle className="h-4 w-4" /> DubaiWay Signature
          </span>
          <h1 className="mt-4 max-w-3xl text-display-lg font-medium text-balance">
            Hành trình luxury, thiết kế riêng cho bạn
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Mỗi chi tiết được chăm chút bởi chuyên viên riêng — từ khoang thương gia đến butler khách sạn,
            từ chauffeur đến visa concierge. Bạn chỉ việc tận hưởng.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/yeu-cau-bao-gia?type=signature" variant="gold" size="lg">
              Yêu cầu tư vấn
              <IconArrowUpRight className="h-4 w-4" />
            </Button>
            <Button href="/yeu-cau-bao-gia?type=signature-bespoke" variant="onDark" size="lg">
              Thiết kế hành trình riêng
            </Button>
          </div>
        </div>
      </section>

      {/* Trụ cột dịch vụ */}
      <section className="shell py-14 lg:py-20">
        <div className="max-w-2xl">
          <span className="eyebrow text-champagne-600"><span className="route-dot" /> Dịch vụ đặc quyền</span>
          <h2 className="mt-3 text-display-md font-medium text-midnight">Trọn vẹn từng đẳng cấp</h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {signaturePillars.map((pillar) => (
            <article key={pillar.title} className="group relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-card">
              <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-midnight/10" />
              <div className="relative">
                <h3 className="font-display text-xl font-medium">{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/75">{pillar.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quy trình bespoke — Route Line */}
      <section className="bg-midnight py-14 lg:py-20">
        <div className="shell">
          <div className="max-w-2xl text-white">
            <span className="eyebrow text-champagne-400"><span className="route-dot" /> Cách chúng tôi làm việc</span>
            <h2 className="mt-3 text-display-md font-medium">Từ ý tưởng đến hành trình hoàn hảo</h2>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signatureProcess.map((item, i) => (
              <li key={item.step} className="relative rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
                <span className="font-display text-3xl font-semibold text-champagne-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="route-line mt-3 w-10" />
                <h3 className="mt-3 font-display text-lg font-medium text-white">{item.step}</h3>
                <p className="mt-1.5 text-sm text-white/65">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Danh mục dịch vụ + CTA */}
      <section className="shell py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="eyebrow text-champagne-600"><span className="route-dot" /> Bao gồm trong Signature</span>
            <h2 className="mt-3 text-display-md font-medium text-midnight">Mọi đặc quyền, một chuyên viên</h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {signatureServices.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-ink">
                  <span className="route-dot shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-ivory-100 p-8 shadow-card ring-1 ring-mist">
            <h3 className="font-display text-2xl font-medium text-midnight">Bắt đầu hành trình riêng</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Chia sẻ mong muốn của bạn, chuyên viên Signature sẽ liên hệ trong vòng 24 giờ với đề xuất
              được cá nhân hoá.
            </p>
            <div className="mt-6 space-y-3">
              <Button href="/yeu-cau-bao-gia?type=signature" variant="primary" size="lg" className="w-full">
                Yêu cầu tư vấn Signature
              </Button>
              <a
                href={whatsappLink(whatsappMessages.signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-base font-medium text-white transition-colors hover:bg-[#1eb757]"
              >
                <IconWhatsapp className="h-5 w-5" /> Nhắn chuyên viên
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-soft">Dịch vụ ưu tiên 24/7. Mọi báo giá là tham khảo, xác nhận theo từng hành trình.</p>
          </div>
        </div>
      </section>
    </>
  );
}
