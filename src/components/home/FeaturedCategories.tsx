import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { groupCategories } from '@/config/category-groups';
import { AllCategoriesButton } from '@/components/categories/AllCategoriesButton';

/** Danh mục nổi bật — lấy từ dữ liệu thật, ưu tiên nhóm đã có dịch vụ. */
export async function FeaturedCategories() {
  const locale = await getLocale();
  const categories = await getRepositories().catalog.listCategories(locale).catch(() => []);
  if (categories.length === 0) return null;

  const withServices = categories.filter((c) => (c.serviceCount ?? 0) > 0);
  // Chừa một ô cuối lưới cho nút mở toàn bộ danh mục.
  const shown = (withServices.length >= 8 ? withServices : categories).slice(0, 11);
  const groups = groupCategories(categories, locale);

  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Danh mục nổi bật"
        title="Bạn muốn trải nghiệm gì ở Dubai?"
        description="Chọn nhóm dịch vụ để xem toàn bộ lựa chọn từ các đối tác đã được xác minh."
        link={{ label: 'Xem tất cả danh mục', href: '/danh-muc' }}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((c) => (
          <Link
            key={c.id}
            href={`/danh-muc/${c.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-mist bg-ivory-100 px-4 py-3.5 transition-colors duration-300 ease-dubaiway hover:border-champagne hover:bg-champagne/[0.04]"
          >
            <span>
              <span className="block text-sm font-medium text-midnight">{c.name}</span>
              {(c.serviceCount ?? 0) > 0 ? (
                <span className="text-xs text-ink-soft">{c.serviceCount} dịch vụ</span>
              ) : null}
            </span>
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-mist-400 transition-transform duration-300 ease-dubaiway group-hover:translate-x-1 group-hover:text-champagne" fill="none" aria-hidden>
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
        <AllCategoriesButton groups={groups} locale={locale} variant="tile" />
      </div>
    </Section>
  );
}
