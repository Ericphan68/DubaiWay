'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { IconClose } from '@/components/ui/icons';

/** Gallery ảnh tour: ảnh lớn + dải thumbnail + lightbox toàn màn hình. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          aria-label="Xem ảnh lớn"
        >
          <Image
            src={images[active]}
            alt={`${title} — ảnh ${active + 1}`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 ease-dubaiway hover:scale-105"
          />
        </button>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-2">
          {images.slice(0, 4).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl ring-2 transition-all',
                active === i ? 'ring-champagne' : 'ring-transparent hover:ring-mist-400',
              )}
              aria-label={`Ảnh ${i + 1}`}
              aria-current={active === i}
            >
              <Image src={src} alt="" fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-midnight-950/90 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Đóng"
          >
            <IconClose className="h-6 w-6" />
          </button>
          <div className="relative aspect-[3/2] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={`${title} — ảnh ${active + 1}`} fill sizes="90vw" className="rounded-xl object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
