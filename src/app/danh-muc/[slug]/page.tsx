import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getRepositories } from '@/server/repositories';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const category = await getRepositories().catalog.getCategoryBySlug(slug, locale).catch(() => null);
  if (!category) return { title: 'Không tìm thấy danh mục' };
  return {
    title: category.name,
    description: `Toàn bộ dịch vụ thuộc nhóm ${category.name} tại Dubai và UAE trên DubaiWay.`,
    alternates: { canonical: `${siteConfig.url}/danh-muc/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = await getLocale();
  const repo = getRepositories();

  const category = await repo.catalog.getCategoryBySlug(slug, locale).catch(() => null);
  if (!category) notFound();

  const sortParam = typeof sp.sort === 'string' ? sp.sort : undefined;
  const sort = (['price_asc', 'price_desc', 'rating_desc', 'newest'] as const).find((s) => s === sortParam);

  let result;
  try {
    result = await repo.catalog.searchServices({ categorySlug: slug, sort: sort ?? 'featured', pageSize: 24 }, locale);
  } catch {
    return (
      <Section>
        <ErrorState body={`Không tải được dịch vụ thuộc nhóm ${category.name}.`} retryHref={`/danh-muc/${slug}`} />
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader
        eyebrow="Danh mục"
        title={category.name}
        description={result.total > 0 ? `${result.total} dịch vụ từ các đối tác đã xác minh.` : undefined}
      />

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="Nhóm này chưa có dịch vụ nào"
            body="Chúng tôi đang mời thêm đối tác cho nhóm dịch vụ này. Bạn xem các nhóm khác trong lúc chờ nhé."
            action={{ label: 'Xem tất cả danh mục', href: '/danh-muc' }}
          />
        ) : (
          <ServiceGrid services={result.items} />
        )}
      </div>
    </Section>
  );
}
