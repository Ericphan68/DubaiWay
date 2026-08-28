import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Danh mục dịch vụ',
  description: 'Toàn bộ nhóm dịch vụ du lịch tại Dubai và UAE trên DubaiWay: tour, vé tham quan, safari sa mạc, du thuyền, đưa đón sân bay, visa và nhiều hơn nữa.',
  alternates: { canonical: `${siteConfig.url}/danh-muc` },
};

export default async function CategoriesPage() {
  const locale = await getLocale();
  const repo = getRepositories();

  let categories;
  try {
    categories = await repo.catalog.listCategories(locale);
  } catch {
    return (
      <Section>
        <ErrorState body="Không tải được danh mục dịch vụ." retryHref="/danh-muc" />
      </Section>
    );
  }

  if (categories.length === 0) {
    return (
      <Section>
        <EmptyState title="Chưa có danh mục nào" action={{ label: 'Về trang chủ', href: '/' }} />
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader
        eyebrow="Khám phá"
        title="Bạn muốn trải nghiệm gì?"
        description="Chọn nhóm dịch vụ để xem toàn bộ lựa chọn từ các đối tác đã được DubaiWay xác minh."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/danh-muc/${c.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors duration-300 ease-dubaiway hover:border-champagne hover:bg-champagne/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
          >
            <span>
              <span className="block font-display text-[1.05rem] font-medium text-midnight">{c.name}</span>
              {typeof c.serviceCount === 'number' ? (
                <span className="mt-0.5 block text-sm text-ink-soft">
                  {c.serviceCount > 0 ? `${c.serviceCount} dịch vụ` : 'Đang cập nhật'}
                </span>
              ) : null}
            </span>
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-mist-400 transition-transform duration-300 ease-dubaiway group-hover:translate-x-1 group-hover:text-champagne" fill="none" aria-hidden>
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>
    </Section>
  );
}
