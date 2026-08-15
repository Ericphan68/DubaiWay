import Image from 'next/image';
import { img, photo } from '@/data/images';
import { signatureServices } from '@/data/services';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { IconSparkle } from '@/components/ui/icons';

export function SignatureSection() {
  return (
    <Section background="ivory">
      <div className="relative overflow-hidden rounded-3xl bg-midnight text-white">
        <Image
          src={img(photo.yacht, 1600)}
          alt="Trải nghiệm luxury"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/50" />

        <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="eyebrow text-champagne-400">
              <IconSparkle className="h-4 w-4" /> DubaiWay Signature
            </span>
            <h2 className="mt-3 text-display-md font-medium">
              Hành trình luxury thiết kế riêng cho bạn
            </h2>
            <p className="mt-3 max-w-lg text-white/75">
              Khoang thương gia, khách sạn 5 sao, private tour, chauffeur và visa concierge — mỗi chi
              tiết được chăm chút bởi chuyên viên riêng, phục vụ 24/7.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/signature" variant="gold">Khám phá Signature</Button>
              <Button href="/yeu-cau-bao-gia?type=signature" variant="onDark">
                Thiết kế hành trình riêng
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {signatureServices.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-white/85">
                <span className="route-dot" /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
