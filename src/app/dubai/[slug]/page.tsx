import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dubaiExperiences } from '@/data/dubai';
import { getDubaiBySlug, getDubaiDetail, relatedExperiences } from '@/data/dubai-details';
import { formatPrice } from '@/lib/format';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Gallery } from '@/components/tours/Gallery';
import { ExperienceCard } from '@/components/cards/ExperienceCard';
import { IconClock, IconMapPin, IconCalendar, IconCheck, IconClose, IconWhatsapp } from '@/components/ui/icons';

export function generateStaticParams() {
  return dubaiExperiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = getDubaiBySlug(slug);
  if (!exp) return { title: 'Không tìm thấy trải nghiệm' };
  return {
    title: exp.title,
    description: exp.summary,
    openGraph: { title: exp.title, description: exp.summary, images: [exp.image] },
  };
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

export default async function DubaiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = getDubaiBySlug(slug);
  if (!exp) notFound();

  const detail = getDubaiDetail(exp);
  const related = relatedExperiences(exp);
  const waMessage = `${whatsappMessages.dubai} (${exp.title})`;

  const meta = [
    { Icon: IconClock, label: 'Thời lượng', value: exp.duration },
    { Icon: IconCalendar, label: 'Lịch hoạt động', value: exp.schedule },
    { Icon: IconMapPin, label: 'Điểm đón', value: exp.pickup },
  ];

  return (
    <>
      <div className="bg-ivory-100">
        <div className="shell pt-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Dubai Experiences', href: '/dubai' },
              { label: exp.title },
            ]}
          />
        </div>
        <div className="shell pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{exp.category}</Badge>
            <ActionBadge action={exp.action} />
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-medium text-midnight sm:text-display-md">
            {exp.title}
          </h1>
          <p className="mt-2 max-w-3xl text-ink-muted">{exp.summary}</p>
        </div>
        <div className="shell mt-6">
          <Gallery images={detail.gallery} title={exp.title} />
        </div>
      </div>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_22rem] lg:py-14">
        <div className="min-w-0 space-y-12">
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-mist bg-ivory-100 p-5 sm:grid-cols-3">
            {meta.map((m) => (
              <div key={m.label} className="flex items-start gap-2.5">
                <m.Icon className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                <div>
                  <p className="text-xs text-ink-soft">{m.label}</p>
                  <p className="text-sm font-medium text-midnight">{m.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Block title="Điểm nổi bật">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {detail.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 rounded-xl bg-mist-200/60 px-4 py-3 text-sm text-ink">
                  <span className="route-dot shrink-0" /> {h}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Bao gồm & không bao gồm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-emerald-700">Bao gồm</p>
                <ul className="space-y-2">
                  {detail.includes.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Không bao gồm</p>
                <ul className="space-y-2">
                  {detail.excludes.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <IconClose className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Block>

          <Block title="Câu hỏi thường gặp">
            <Accordion items={detail.faqs} />
          </Block>
        </div>

        {/* Booking sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-ivory-100 p-5 shadow-card ring-1 ring-mist">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-ink-soft">Giá từ</span>
                <p className="font-display text-2xl font-semibold text-midnight">{formatPrice(exp.price)}</p>
                <span className="text-xs text-ink-soft">{exp.price.unit}</span>
              </div>
              <ActionBadge action={exp.action} />
            </div>

            <div className="mt-5 space-y-2.5">
              {exp.action === 'book' ? (
                <Button href={`/yeu-cau-bao-gia?dubai=${exp.slug}&type=book`} variant="primary" className="w-full">
                  Đặt ngay
                </Button>
              ) : (
                <Button href={`/yeu-cau-bao-gia?dubai=${exp.slug}`} variant="primary" className="w-full">
                  Yêu cầu báo giá
                </Button>
              )}
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1eb757]"
              >
                <IconWhatsapp className="h-4 w-4" /> Nhắn nhân viên
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              {exp.action === 'book' ? 'Bạn đang đặt trực tiếp với DubaiWay.' : 'Bạn đang gửi yêu cầu để DubaiWay báo giá.'} Giá là tham khảo, xác nhận khi đặt.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-ivory-100 py-14">
          <div className="shell">
            <h2 className="font-display text-2xl font-medium text-midnight">Trải nghiệm khác tại Dubai</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((e) => (
                <ExperienceCard key={e.slug} item={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
