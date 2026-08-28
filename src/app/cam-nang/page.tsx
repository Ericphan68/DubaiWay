import type { Metadata } from 'next';
import Link from 'next/link';
import { articles, articleTopics } from '@/data/articles';
import { img, photo } from '@/data/images';
import { PageHero } from '@/components/ui/PageHero';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Section } from '@/components/ui/Section';
import { listPosts } from '@/server/services/content-store';

export const metadata: Metadata = {
  title: 'Cẩm nang du lịch DubaiWay',
  description:
    'Kinh nghiệm visa, vé máy bay, khách sạn, tour, sự kiện và hành hương — viết bởi đội ngũ DubaiWay, mỗi bài kèm hành động liên quan.',
};

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const results = topic ? articles.filter((a) => a.topic === topic) : articles;
  // Bài viết do Admin soạn trong khu quản trị.
  const managedPosts = listPosts({ status: 'published' });

  return (
    <>
      <PageHero
        eyebrow="DubaiWay Travel Journal"
        title="Cẩm nang cho hành trình của bạn"
        description="Kinh nghiệm thật, viết bởi những người đã trực tiếp đồng hành cùng khách — mỗi bài đều dẫn tới một hành động cụ thể."
        image={img(photo.europe, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Cẩm nang' }]}
      />

      {managedPosts.length > 0 ? (
        <Section background="white">
          <h2 className="font-display text-2xl font-medium text-midnight">Bài viết mới nhất</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {managedPosts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/cam-nang/bai-viet/${p.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-mist bg-ivory-100 p-5 transition-colors hover:border-champagne"
                >
                  <span className="font-display text-lg font-medium leading-snug text-midnight">
                    {p.titleVi}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.excerptVi}</span>
                  <span className="mt-3 text-xs text-ink-soft">
                    {p.authorName}
                    {p.publishedAt ? ` · ${new Date(p.publishedAt).toLocaleDateString('vi-VN')}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <section className="shell py-12">
        {/* Lọc theo chủ đề */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/cam-nang"
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              !topic ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
            )}
          >
            Tất cả chủ đề
          </Link>
          {articleTopics.map((t) => (
            <Link
              key={t}
              href={`/cam-nang?topic=${encodeURIComponent(t)}`}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                topic === t ? 'border-royal bg-royal text-white' : 'border-mist-400 text-ink-muted hover:border-royal/40',
              )}
            >
              {t}
            </Link>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có bài viết cho chủ đề này"
            description="Chúng tôi liên tục cập nhật cẩm nang. Trong lúc chờ, bạn có thể nhắn đội ngũ DubaiWay để được tư vấn trực tiếp."
            action={<Button href="/yeu-cau-bao-gia" variant="primary">Nhận tư vấn</Button>}
          />
        )}
      </section>
    </>
  );
}
