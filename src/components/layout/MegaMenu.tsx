import Link from 'next/link';
import Image from 'next/image';
import type { NavItem } from '@/config/nav';
import { IconArrowUpRight } from '@/components/ui/icons';

/** Panel mega menu nhiều cột + ô feature ảnh bên phải. */
export function MegaMenu({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  if (!item.megaMenu) return null;

  return (
    <div className="absolute left-1/2 top-full z-40 w-[min(60rem,90vw)] -translate-x-1/2 pt-3">
      <div className="animate-fade-up overflow-hidden rounded-2xl bg-ivory-100 shadow-console ring-1 ring-mist">
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_1fr_0.9fr]">
          {item.megaMenu.map((group) => (
            <div key={group.heading}>
              <p className="eyebrow mb-3">{group.heading}</p>
              <ul className="space-y-1">
                {group.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className="group block rounded-lg px-3 py-2 transition-colors hover:bg-mist-200"
                    >
                      <span className="block text-sm font-medium text-midnight group-hover:text-royal">
                        {child.label}
                      </span>
                      {child.description && (
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {child.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {item.feature && (
            <Link
              href={item.feature.href}
              onClick={onNavigate}
              className="group relative flex min-h-[13rem] flex-col justify-end overflow-hidden rounded-xl p-5 text-white"
            >
              <Image
                src={item.feature.image}
                alt=""
                fill
                sizes="320px"
                className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-midnight/10" />
              <div className="relative">
                <p className="font-display text-lg font-medium">{item.feature.title}</p>
                <p className="mt-1 text-xs text-white/80">{item.feature.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-champagne-400">
                  Khám phá <IconArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
