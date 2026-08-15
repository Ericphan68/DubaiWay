import Image from 'next/image';
import { Breadcrumb, type Crumb } from './Breadcrumb';

/** Dải hero gọn cho các trang con: ảnh nền tối + breadcrumb + tiêu đề serif. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/40" />
      </div>

      <div className="shell py-10 sm:py-14">
        <div className="[&_a:hover]:text-champagne-400 [&_span]:text-white/50 [&_[aria-current]]:text-white">
          <Breadcrumb items={crumbs} />
        </div>
        {eyebrow && (
          <span className="eyebrow mt-5 text-champagne-400">
            <span className="route-dot" /> {eyebrow}
          </span>
        )}
        <h1 className="mt-3 max-w-3xl text-display-md font-medium text-balance">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-pretty text-white/75">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
