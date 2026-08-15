import Link from 'next/link';
import Image from 'next/image';
import type { DubaiExperience } from '@/types';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { ActionBadge } from '@/components/ui/ActionBadge';
import { IconClock } from '@/components/ui/icons';

export function ExperienceCard({ item }: { item: DubaiExperience }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ivory-100 shadow-card ring-1 ring-mist transition-all duration-500 ease-dubaiway hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/dubai/${item.slug}`} className="relative block aspect-[3/2] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="onImage">{item.category}</Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
          <IconClock className="h-3.5 w-3.5" /> {item.duration} · {item.pickup}
        </span>
        <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-midnight">
          <Link href={`/dubai/${item.slug}`} className="hover:text-royal">{item.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{item.summary}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="block text-xs text-ink-soft">Từ</span>
            <span className="font-display text-xl font-semibold text-midnight">{formatPrice(item.price)}</span>
            <span className="text-xs text-ink-soft">{item.price.unit}</span>
          </div>
          <ActionBadge action={item.action} />
        </div>
      </div>
    </article>
  );
}
