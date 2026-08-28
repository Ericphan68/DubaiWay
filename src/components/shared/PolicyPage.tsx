import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';

/** Khung chung cho các trang chính sách — cùng một bố cục, dễ đọc trên mobile. */
export function PolicyPage({
  title, updatedAt, intro, children,
}: {
  title: string;
  updatedAt: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-medium text-midnight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Cập nhật lần cuối: {updatedAt}</p>
        {intro ? <p className="mt-4 leading-relaxed text-ink-muted">{intro}</p> : null}
        <div className="mt-8 space-y-7">{children}</div>
      </div>
    </Section>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-midnight">{title}</h2>
      <div className="mt-2 space-y-3 leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}
