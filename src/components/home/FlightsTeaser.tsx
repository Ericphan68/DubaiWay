import Image from 'next/image';
import { flightOffers } from '@/data/flights';
import { img, photo } from '@/data/images';
import { formatPrice } from '@/lib/format';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { IconArrowUpRight, IconPlane } from '@/components/ui/icons';

export function FlightsTeaser() {
  return (
    <Section background="ivory">
      <SectionHeader
        eyebrow="Vé máy bay"
        title="So sánh giá từ nhiều nền tảng, đặt nơi bạn thấy tốt nhất"
        description="DubaiWay tổng hợp giá tham khảo từ các đối tác. Bạn chọn được vé ưng ý, hoặc để đội ngũ săn giá giúp."
        link={{ label: 'Tới trang vé máy bay', href: '/ve-may-bay' }}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Bảng so sánh 3 đối tác */}
        <div className="rounded-2xl bg-ivory-100 p-5 shadow-card ring-1 ring-mist">
          <div className="flex items-center justify-between border-b border-mist pb-3 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-midnight">
              <IconPlane className="h-4 w-4 text-royal" /> SGN → DXB · 12/09
            </span>
            <span className="text-xs text-ink-soft">Khứ hồi · Phổ thông</span>
          </div>
          <ul className="divide-y divide-mist">
            {flightOffers.map((offer) => (
              <li key={offer.partner} className="flex items-center gap-4 py-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-midnight text-xs font-bold text-champagne-400">
                  {offer.logoInitial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-midnight">{offer.partner}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {offer.duration} · {offer.stops} · {offer.baggage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-semibold text-midnight">
                    {formatPrice(offer.price)}
                  </p>
                  <span className="text-[0.65rem] text-champagne-600">tham khảo</span>
                </div>
              </li>
            ))}
          </ul>
          <Button href="/ve-may-bay" variant="outline" className="mt-4 w-full">
            Xem tất cả lựa chọn
          </Button>
        </div>

        {/* Vé thương gia */}
        <div className="relative flex flex-col justify-end overflow-hidden rounded-2xl p-7 text-white shadow-card">
          <Image
            src={img(photo.businessClass, 1200)}
            alt="Khoang thương gia"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/20" />
          <div className="relative max-w-md">
            <span className="eyebrow text-champagne-400">DubaiWay Signature</span>
            <h3 className="mt-2 font-display text-2xl font-medium">
              Vé thương gia &amp; hạng nhất giá tốt
            </h3>
            <p className="mt-2 text-sm text-white/75">
              Gửi hành trình và ngân sách, chuyên viên DubaiWay săn giá khoang thương gia từ nhiều hãng
              và báo lại qua WhatsApp.
            </p>
            <Button href="/ve-may-bay#business" variant="gold" className="mt-5">
              Yêu cầu báo giá vé thương gia
              <IconArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
