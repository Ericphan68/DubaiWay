import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { visaCountries } from '@/data/visas';
import { getVisaBySlug, getVisaDetail } from '@/data/visa-details';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { VisaDisclaimer } from '@/components/visa/VisaDisclaimer';
import { VisaConsultForm } from '@/components/visa/VisaConsultForm';
import { IconCheck, IconClock, IconPassport, IconWhatsapp, IconArrowRight } from '@/components/ui/icons';

export function generateStaticParams() {
  return visaCountries.map((v) => ({ country: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const visa = getVisaBySlug(country);
  if (!visa) return { title: 'Không tìm thấy thông tin visa' };
  return { title: `Visa ${visa.country}`, description: visa.summary };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-midnight">{title}</h2>
      <div className="route-line mt-3 w-16" />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function VisaCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const visa = getVisaBySlug(country);
  if (!visa) notFound();

  const detail = getVisaDetail(visa);
  const waMessage = `${whatsappMessages.visa} (${visa.country})`;

  const facts = [
    { label: 'Loại visa', value: visa.visaTypes.join(', ') },
    { label: 'Thời gian lưu trú', value: visa.stayDuration },
    { label: 'Số lần nhập cảnh', value: detail.entries },
    { label: 'Thời gian xử lý', value: visa.processingTime },
  ];

  return (
    <>
      <div className="bg-ivory-100">
        <div className="shell pt-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Visa', href: '/visa' },
              { label: visa.country },
            ]}
          />
        </div>
        <div className="shell pb-8 pt-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden>{visa.flag}</span>
            <div>
              <h1 className="font-display text-3xl font-medium text-midnight sm:text-display-md">
                Visa {visa.country}
              </h1>
              <p className="text-sm text-ink-soft">{visa.region}</p>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-ink-muted">{visa.summary}</p>
        </div>
      </div>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_20rem] lg:py-14">
        <div className="min-w-0 space-y-12">
          {/* Facts */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-mist bg-ivory-100 p-5 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-ink-soft">{f.label}</p>
                <p className="mt-0.5 text-sm font-medium text-midnight">{f.value}</p>
              </div>
            ))}
          </div>

          <Block title="Ai có thể nộp & điều kiện">
            <p className="text-ink-muted">{detail.whoCanApply}</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {detail.eligibility.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm text-ink-muted">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {e}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Hồ sơ cần chuẩn bị">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {detail.documents.map((d) => (
                <li key={d} className="flex items-start gap-2 rounded-xl bg-mist-200/50 px-4 py-3 text-sm text-ink">
                  <IconPassport className="mt-0.5 h-4 w-4 shrink-0 text-royal" /> {d}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Quy trình thực hiện">
            <ol className="relative space-y-5">
              <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-champagne via-champagne/50 to-transparent" aria-hidden />
              {detail.process.map((step, i) => (
                <li key={step} className="relative flex gap-4">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-champagne-400 ring-4 ring-ivory">
                    {i + 1}
                  </span>
                  <p className="pt-1.5 text-sm text-ink-muted">{step}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block title="Lưu ý quan trọng">
            <ul className="space-y-2">
              {detail.notes.map((n) => (
                <li key={n} className="flex items-start gap-2 text-sm text-ink-muted">
                  <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-champagne-600" /> {n}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Câu hỏi thường gặp">
            <Accordion items={detail.faqs} />
          </Block>

          <VisaDisclaimer />
        </div>

        {/* Sidebar CTA */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-ivory-100 p-5 shadow-card ring-1 ring-mist">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-champagne-600">
              <IconClock className="h-3.5 w-3.5" /> Xử lý: {visa.processingTime}
            </p>
            <p className="mt-2 font-display text-lg font-medium text-midnight">Cần hỗ trợ hồ sơ {visa.country}?</p>
            <p className="mt-1 text-sm text-ink-muted">Kiểm tra điều kiện và nhận báo giá dịch vụ từ chuyên viên.</p>

            <div className="mt-4 space-y-2.5">
              <Button href={`/yeu-cau-bao-gia?type=visa&country=${visa.slug}`} variant="primary" className="w-full">
                Kiểm tra điều kiện & báo giá
              </Button>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1eb757]"
              >
                <IconWhatsapp className="h-4 w-4" /> Nhắn WhatsApp
              </a>
              <Button href="/lien-he#callback" variant="outline" className="w-full">
                Yêu cầu gọi lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form tư vấn */}
      <section className="bg-mist-200/50 py-14">
        <div className="shell">
          <div className="max-w-2xl">
            <span className="eyebrow text-champagne-600"><span className="route-dot" /> Tư vấn hồ sơ</span>
            <h2 className="mt-3 text-display-md font-medium text-midnight">Gửi thông tin để được đánh giá hồ sơ</h2>
            <p className="mt-2 text-ink-muted">Điền form dưới đây, chuyên viên visa của DubaiWay sẽ liên hệ với bạn.</p>
          </div>
          <div className="mt-8">
            <VisaConsultForm defaultCountry={visa.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
