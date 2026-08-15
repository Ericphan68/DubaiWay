import { Suspense } from 'react';
import type { Metadata } from 'next';
import { visaCountries, popularVisas } from '@/data/visas';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { VisaWizard } from '@/components/visa/VisaWizard';
import { VisaCountryCard } from '@/components/visa/VisaCountryCard';
import { VisaDisclaimer } from '@/components/visa/VisaDisclaimer';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Visa — Kiểm tra điều kiện & hỗ trợ hồ sơ',
  description:
    'Kiểm tra điều kiện visa theo quốc gia đến, quốc tịch và nơi cư trú. DubaiWay tư vấn và hỗ trợ hồ sơ cho nhiều quốc gia.',
};

export default function VisaPage() {
  const others = visaCountries.filter((v) => !v.popular);

  return (
    <>
      <PageHero
        eyebrow="Visa"
        title="Kiểm tra điều kiện visa của bạn"
        description="Chọn nơi bạn muốn đến, DubaiWay tư vấn điều kiện hồ sơ theo quốc tịch và nơi cư trú. Chúng tôi hỗ trợ hồ sơ — không cam kết đậu visa."
        image={img(photo.visa, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Visa' }]}
      >
        <Suspense fallback={<div className="h-40 rounded-2xl bg-mist-200" />}>
          <VisaWizard />
        </Suspense>
      </PageHero>

      <section className="shell py-12">
        <div className="mb-2">
          <span className="eyebrow text-champagne-600"><span className="route-dot" /> Điểm đến phổ biến</span>
          <h2 className="mt-3 text-display-md font-medium text-midnight">Visa theo quốc gia</h2>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularVisas.map((visa) => (
            <VisaCountryCard key={visa.slug} visa={visa} />
          ))}
        </div>

        <h3 className="mt-12 font-display text-xl font-medium text-midnight">Các quốc gia khác</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((visa) => (
            <VisaCountryCard key={visa.slug} visa={visa} />
          ))}
        </div>

        <div className="mt-10">
          <VisaDisclaimer />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-midnight">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div className="max-w-xl text-white">
            <h2 className="font-display text-2xl font-medium">Không chắc mình đủ điều kiện?</h2>
            <p className="mt-2 text-white/70">
              Gửi thông tin, chuyên viên visa của DubaiWay sẽ đánh giá hồ sơ và tư vấn lộ trình phù hợp cho bạn.
            </p>
          </div>
          <Button href="/yeu-cau-bao-gia?type=visa" variant="gold" className="shrink-0">
            Nhận tư vấn hồ sơ
          </Button>
        </div>
      </section>
    </>
  );
}
