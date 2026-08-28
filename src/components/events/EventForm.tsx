'use client';

import { eventTypes } from '@/data/events';
import { LeadForm } from '@/components/shared/LeadForm';

/** Thứ tự trường quyết định thứ tự dòng trong tin nhắn gửi đi. */
const EVENT_FIELDS = [
  { name: 'country', label: 'Quốc gia tổ chức' },
  { name: 'city', label: 'Thành phố' },
  { name: 'eventType', label: 'Loại sự kiện' },
  { name: 'date', label: 'Ngày dự kiến' },
  { name: 'guests', label: 'Số lượng khách' },
  { name: 'budget', label: 'Ngân sách dự kiến' },
  { name: 'requirements', label: 'Yêu cầu đặc biệt' },
  { name: 'name', label: 'Người liên hệ' },
  { name: 'phone', label: 'WhatsApp / SĐT' },
] as const;

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


  return (
    <LeadForm
      title="tổ chức sự kiện"
      subject="Yêu cầu tổ chức sự kiện — DubaiWay"
      fields={EVENT_FIELDS}
      submitLabel="Gửi yêu cầu tổ chức sự kiện"
      className="rounded-2xl bg-ivory-100 p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc gia tổ chức</span>
          <input name="country" className={inputCls} defaultValue={defaultCountry} placeholder="Dubai, Việt Nam…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Thành phố</span>
          <input name="city" className={inputCls} placeholder="Dubai, TP.HCM…" />
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
          <input name="date" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số lượng khách</span>
          <input name="guests" type="number" min={1} className={inputCls} placeholder="VD: 120" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngân sách dự kiến</span>
          <input name="budget" className={inputCls} placeholder="Không bắt buộc" />
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
        <textarea name="requirements" rows={3} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Concept, nghệ sĩ, thương hiệu, yêu cầu kỹ thuật…" />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Người liên hệ</span>
          <input name="name" required className={inputCls} placeholder="Họ tên" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
          <input name="phone" required className={inputCls} placeholder="+84…" />
        </label>
      </div>

    </LeadForm>
  );
}
