'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { visaCountries, visaPurposes } from '@/data/visas';
import { Button } from '@/components/ui/Button';
import { IconPassport, IconArrowRight } from '@/components/ui/icons';

const selectCls =
  'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal';

export function VisaWizard() {
  const router = useRouter();
  const [dest, setDest] = useState('');

  return (
    <div className="rounded-2xl bg-ivory-100 p-5 shadow-console ring-1 ring-mist sm:p-6">
      <p className="flex items-center gap-2 font-display text-lg font-medium text-midnight">
        <IconPassport className="h-5 w-5 text-royal" /> Bạn muốn xin visa đi đâu?
      </p>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(dest ? `/visa/${dest}` : '/visa');
        }}
      >
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc tịch</span>
          <input className={selectCls} placeholder="VD: Việt Nam" defaultValue="Việt Nam" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Đang cư trú tại</span>
          <input className={selectCls} placeholder="VD: Việt Nam" defaultValue="Việt Nam" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Muốn đến</span>
          <select value={dest} onChange={(e) => setDest(e.target.value)} className={selectCls}>
            <option value="">Chọn quốc gia…</option>
            {visaCountries.map((v) => (
              <option key={v.slug} value={v.slug}>{v.country}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Mục đích</span>
          <select className={selectCls}>
            {visaPurposes.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày dự kiến đi</span>
          <input type="date" className={selectCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số người</span>
          <input type="number" min={1} defaultValue={1} className={selectCls} />
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
            Kiểm tra điều kiện visa <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
