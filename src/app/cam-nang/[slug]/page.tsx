import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { getArticleBySlug, getArticleBody, getArticleCta, relatedArticles } from '@/data/article-details';
import { formatDate } from '@/lib/format';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { IconClock, IconArrowRight } from '@/components/ui/icons';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Không tìm thấy bài viết' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: [article.image], type: 'article' },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const body = getArticleBody(article);
  const cta = getArticleCta(article);
  const related = relatedArticles(article);

  return (
    <>
      <div className="bg-ivory-100">
        <div className="shell pt-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Cẩm nang', href: '/cam-nang' },
              { label: article.title },
            ]}
          />
        </div>
        <div className="shell max-w-3xl pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{article.topic}</Badge>
            <Badge tone="navy">{article.destination}</Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-medium text-midnight sm:text-display-md">{article.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            <span>{article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="inline-flex items-center gap-1"><IconClock className="h-4 w-4" /> {article.readingMinutes} phút đọc</span>
          </div>
        </div>
        <div className="shell mt-6">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image src={article.image} alt={article.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </div>

      <article className="shell grid gap-10 py-12 lg:grid-cols-[1fr_18rem] lg:py-16">
        <div className="min-w-0 max-w-3xl">
          {body.map((section) => (
            <section key={section.heading} className="mb-9">
              <h2 className="font-display text-2xl font-medium text-midnight">{section.heading}</h2>
              <div className="route-line mt-3 w-14" />
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-ink-muted">{p}</p>
              ))}
            </section>
          ))}
        </div>

        {/* CTA liên quan dính */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-midnight p-6 text-white">
            <span className="eyebrow text-champagne-400"><span className="route-dot" /> Bước tiếp theo</span>
            <p className="mt-3 font-display text-lg font-medium">{cta.label}</p>
            <p className="mt-1.5 text-sm text-white/70">{cta.description}</p>
            <Link
              href={cta.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-midnight transition-colors hover:bg-champagne-400"
            >
              {cta.label} <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section className="bg-ivory-100 py-14">
          <div className="shell">
            <h2 className="font-display text-2xl font-medium text-midnight">Bài viết liên quan</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
