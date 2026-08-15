import Link from 'next/link';
import { Fragment } from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb điều hướng — trang con và trang chi tiết. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !last ? (
                  <Link href={item.href} className="transition-colors hover:text-royal">
                    {item.label}
                  </Link>
                ) : (
                  <span className={last ? 'font-medium text-ink' : undefined} aria-current={last ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!last && <li aria-hidden className="text-mist-400">/</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
