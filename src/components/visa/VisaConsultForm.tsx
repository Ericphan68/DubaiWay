'use client';

import { visaCountries, visaPurposes } from '@/data/visas';
import { LeadForm } from '@/components/shared/LeadForm';

/** Thứ tự trường quyết định thứ tự dòng trong tin nhắn gửi đi. */
const VISA_FIELDS = [
  { name: 'name', label: 'Họ và tên' },
  { name: 'nationality', label: 'Quốc tịch' },
  { name: 'residence', label: 'Đang cư trú tại' },
  { name: 'destination', label: 'Quốc gia muốn đến' },
  { name: 'purpose', label: 'Mục đích' },
  { name: 'date', label: 'Ngày dự kiến đi' },
  { name: 'guests', label: 'Số người' },
  { name: 'refused', label: 'Từng bị từ chối visa' },
  { name: 'phone', label: 'WhatsApp / SĐT' },
  { name: 'email', label: 'Email' },
  { name: 'note', label: 'Ghi chú thêm' },
] as const;

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function VisaConsultForm({ defaultCountry }: { defaultCountry?: string }) {


  return (
    <LeadForm
      title="được tư vấn hồ sơ visa"
      subject="Tư vấn visa — DubaiWay"
      fields={VISA_FIELDS}
      submitLabel="Gửi yêu cầu tư vấn visa"
      className="grid gap-3 rounded-2xl border border-mist bg-ivory-100 p-6 sm:grid-cols-2"
    >
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
        <input name="name" required className={inputCls} placeholder="Nguyễn Văn A" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc tịch</span>
        <input className={inputCls} defaultValue="Việt Nam" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Đang cư trú tại</span>
        <input className={inputCls} defaultValue="Việt Nam" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc gia muốn đến</span>
        <select className={inputCls} defaultValue={defaultCountry ?? ''}>
          <option value="">Chọn…</option>
          {visaCountries.map((v) => (
            <option key={v.slug} value={v.slug}>{v.country}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Mục đích</span>
        <select className={inputCls}>
          {visaPurposes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày dự kiến đi</span>
        <input name="date" type="date" className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Số người</span>
        <input name="guests" type="number" min={1} defaultValue={1} className={inputCls} />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Từng bị từ chối visa chưa?</span>
        <select className={inputCls}>
          <option value="no">Chưa từng</option>
          <option value="yes">Đã từng bị từ chối</option>
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
        <input name="phone" required className={inputCls} placeholder="+84…" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
        <input name="email" type="email" className={inputCls} placeholder="ban@email.com" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Ghi chú thêm</span>
        <textarea name="note" rows={3} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Thông tin bổ sung về hồ sơ, lịch trình…" />
      </label>
    </LeadForm>
  );
}
