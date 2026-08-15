'use client';

import { useState } from 'react';
import { eventTypes } from '@/data/events';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

const needs = [
  { key: 'venue', label: 'Địa điểm' },
  { key: 'hotel', label: 'Khách sạn' },
  { key: 'flight', label: 'Vé máy bay' },
  { key: 'visa', label: 'Visa đoàn' },
  { key: 'av', label: 'Sân khấu & AV' },
  { key: 'catering', label: 'Tiệc & catering' },
];

export function EventForm({ defaultCountry }: { defaultCountry?: string }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-ivory-100 p-10 text-center shadow-card">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconCheck className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-xl font-medium text-midnight">Đã nhận yêu cầu sự kiện</p>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Chuyên viên DubaiWay Events sẽ liên hệ để trao đổi concept và gửi đề xuất kèm báo giá.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl bg-ivory-100 p-6 shadow-card sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc gia tổ chức</span>
          <input className={inputCls} defaultValue={defaultCountry} placeholder="Dubai, Việt Nam…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Thành phố</span>
          <input className={inputCls} placeholder="Dubai, TP.HCM…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Loại sự kiện</span>
          <select className={inputCls}>
            {eventTypes.map((e) => (
              <option key={e.slug} value={e.slug}>{e.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày dự kiến</span>
          <input type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số lượng khách</span>
          <input type="number" min={1} className={inputCls} placeholder="VD: 120" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngân sách dự kiến</span>
          <input className={inputCls} placeholder="Không bắt buộc" />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-xs font-semibold text-ink-muted">Bạn cần DubaiWay lo những gì?</legend>
        <div className="flex flex-wrap gap-2">
          {needs.map((n) => (
            <label key={n.key} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-mist-400 px-3 py-1.5 text-sm text-ink-muted has-[:checked]:border-royal has-[:checked]:bg-royal has-[:checked]:text-white">
              <input type="checkbox" className="peer sr-only" />
              {n.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Yêu cầu đặc biệt</span>
        <textarea rows={3} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Concept, nghệ sĩ, thương hiệu, yêu cầu kỹ thuật…" />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Người liên hệ</span>
          <input required className={inputCls} placeholder="Họ tên" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
          <input required className={inputCls} placeholder="+84…" />
        </label>
      </div>

      <div className="mt-6">
        <Button type="submit" variant="primary" size="lg">Gửi yêu cầu tổ chức sự kiện</Button>
      </div>
    </form>
  );
}
