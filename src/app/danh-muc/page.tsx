import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';
import { CATEGORY_GROUPS, categoryIcon } from '@/config/category-groups';
import type { CategorySummary } from '@/server/repositories/types';

/** Danh mục thuộc nhóm nào — quyết định biểu tượng hiển thị. */
const GROUP_OF_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.slugs.map((slug) => [slug, g.id])),
);
const groupOf = (slug: string) => GROUP_OF_SLUG[slug] ?? 'other';

/**
 * Một danh mục trong lưới.
 * Có biểu tượng để khách quét mắt qua 20 ô mà vẫn nhận ra loại dịch vụ, thay vì
 * phải đọc từng dòng chữ.
 */
function CategoryTile({ category, groupId }: { category: CategorySummary; groupId: string }) {
  const Icon = categoryIcon(category.slug, groupId);
  const count = category.serviceCount ?? 0;
  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className="group flex items-center gap-3.5 rounded-2xl border border-mist bg-ivory-100 p-4 transition-all duration-300 ease-dubaiway hover:-translate-y-0.5 hover:border-champagne hover:bg-champagne/[0.04] hover:shadow-[0_10px_24px_-16px_rgba(54,74,99,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-champagne/[0.1] text-champagne-600 transition-colors duration-300 ease-dubaiway group-hover:bg-champagne/[0.18]">
        <Icon className="h-[1.35rem] w-[1.35rem]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.02rem] font-medium leading-snug text-midnight">
          {category.name}
        </span>
        <span className="mt-0.5 block text-sm text-ink-soft">
          {count > 0 ? `${count} dịch vụ` : 'Đang cập nhật'}
        </span>
      </span>
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-mist-400 transition-transform duration-300 ease-dubaiway group-hover:translate-x-1 group-hover:text-champagne" fill="none" aria-hidden>
        <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

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
          <CategoryTile key={c.id} category={c} groupId={groupOf(c.slug)} />
        ))}
      </div>
    </Section>
  );
}
