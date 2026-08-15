import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { IconClock } from '@/components/ui/icons';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/cam-nang/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="onImage">{article.topic}</Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" /> {article.readingMinutes} phút đọc
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-medium leading-snug text-midnight">
          <Link href={`/cam-nang/${article.slug}`} className="hover:text-royal">{article.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{article.excerpt}</p>
        <p className="mt-3 text-xs text-ink-soft">{article.author}</p>
      </div>
    </article>
  );
}
