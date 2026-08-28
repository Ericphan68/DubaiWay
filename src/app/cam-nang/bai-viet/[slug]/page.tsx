import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { getPostBySlug, incrementViews, listPosts } from '@/server/services/content-store';
import { getLocale } from '@/server/locale';
import { siteConfig } from '@/config/site';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.status !== 'published') return { title: 'Không tìm thấy bài viết' };
  return {
    title: post.titleVi,
    description: post.excerptVi,
    alternates: { canonical: `${siteConfig.url}/cam-nang/bai-viet/${slug}` },
    openGraph: { title: post.titleVi, description: post.excerptVi, type: 'article' },
  };
}

/**
 * Hiển thị Markdown đơn giản: ## tiêu đề, - danh sách, đoạn văn.
 * Cố ý không dùng thư viện Markdown đầy đủ để không nhận HTML thô từ nội dung.
 */
function renderBody(body: string) {
  const blocks = body.split('\n\n');
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-8 font-display text-xl font-medium text-midnight">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').map((l) => l.replace(/^-\s*/, '')).filter(Boolean);
      return (
        <ul key={i} className="mt-3 space-y-1.5">
          {items.map((it) => (
            <li key={it} className="flex gap-2.5 text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" aria-hidden />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i} className="mt-3 leading-relaxed text-ink-muted">{trimmed}</p>;
  });
}

export default async function AdminPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  incrementViews(slug);

  const title = locale === 'en' ? post.titleEn : post.titleVi;
  const body = locale === 'en' ? post.bodyEn : post.bodyVi;

  const others = listPosts({ status: 'published' }).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Đường dẫn" className="text-sm text-ink-soft">
          <Link href="/" className="hover:text-champagne-600">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link href="/cam-nang" className="hover:text-champagne-600">Cẩm nang</Link>
        </nav>

        <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-midnight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {post.authorName}
          {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}` : ''}
        </p>

        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          {locale === 'en' ? post.excerptEn : post.excerptVi}
        </p>

        <div className="mt-6 border-t border-mist pt-6">{renderBody(body)}</div>

        {post.categorySlug ? (
          <p className="mt-10 rounded-2xl border border-mist bg-ivory-200 px-5 py-4 text-sm text-ink-muted">
            Đọc xong rồi?{' '}
            <Link href={`/danh-muc/${post.categorySlug}`} className="text-royal underline underline-offset-2">
              Xem dịch vụ thuộc nhóm này
            </Link>
          </p>
        ) : null}
      </article>

      {others.length > 0 ? (
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-medium text-midnight">Bài viết khác</h2>
          <ul className="mt-4 space-y-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/cam-nang/bai-viet/${p.slug}`}
                  className="block rounded-2xl border border-mist bg-ivory-100 p-4 transition-colors hover:border-champagne"
                >
                  <span className="block font-medium text-midnight">{p.titleVi}</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{p.excerptVi}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
