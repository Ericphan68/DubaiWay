'use client';

import { LeadForm } from '@/components/shared/LeadForm';

/** Thứ tự trường quyết định thứ tự dòng trong tin nhắn gửi đi. */
const BIZ_FIELDS = [
  { name: 'route', label: 'Hành trình' },
  { name: 'date', label: 'Ngày bay dự kiến' },
  { name: 'guests', label: 'Số người' },
  { name: 'airline', label: 'Hãng ưu tiên' },
  { name: 'budget', label: 'Ngân sách dự kiến' },
  { name: 'phone', label: 'WhatsApp / SĐT' },
] as const;

const inputCls =
  'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function BusinessClassForm() {


  return (
    <LeadForm
      title="săn vé khoang thương gia"
      subject="Yêu cầu săn vé thương gia — DubaiWay"
      fields={BIZ_FIELDS}
      submitLabel="Gửi yêu cầu săn vé"
      className="grid gap-3 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:grid-cols-2"
    >
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-white/80">Hành trình</span>
        <input name="route" required className={inputCls} placeholder="VD: TP.HCM → London, khứ hồi" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Ngày bay dự kiến</span>
        <input name="date" type="date" className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Số người</span>
        <input name="guests" type="number" min={1} defaultValue={1} className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Hãng ưu tiên</span>
        <input name="airline" className={inputCls} placeholder="VD: Emirates, Qatar…" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Ngân sách dự kiến</span>
        <input name="budget" className={inputCls} placeholder="VD: 60–80 triệu/khách" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-white/80">WhatsApp / Số điện thoại</span>
        <input name="phone" required className={inputCls} placeholder="VD: +84…" />
      </label>
    </LeadForm>
  );
}
