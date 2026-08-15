'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@/components/ui/icons';

export function SearchBox({ initial = '' }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/tim-kiem?q=${encodeURIComponent(q.trim())}` : '/tim-kiem');
      }}
    >
      <div className="flex flex-1 items-center gap-2 rounded-full border border-mist bg-ivory-100 px-5">
        <IconSearch className="h-5 w-5 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tour, điểm đến, visa, khách sạn, bài viết…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
          aria-label="Tìm kiếm"
        />
      </div>
      <button type="submit" className="h-12 rounded-full bg-royal px-6 text-sm font-medium text-white transition-colors hover:bg-royal-600">
        Tìm
      </button>
    </form>
  );
}
