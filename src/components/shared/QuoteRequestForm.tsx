'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTourBySlug } from '@/data/tours';
import { getHolyLandBySlug } from '@/data/holyland-details';
import { getDubaiBySlug } from '@/data/dubai-details';
import { getVisaBySlug } from '@/data/visa-details';
import { whatsappLink, whatsappMessages } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconWhatsapp } from '@/components/ui/icons';

const services = [
  { value: 'tour', label: 'Tour du lịch' },
  { value: 'group', label: 'Tour đoàn / doanh nghiệp' },
  { value: 'holyland', label: 'Hành hương Holy Land' },
  { value: 'dubai', label: 'Dubai Experiences' },
  { value: 'flight', label: 'Vé máy bay' },
  { value: 'hotel', label: 'Khách sạn' },
  { value: 'visa', label: 'Visa' },
  { value: 'event', label: 'Tổ chức sự kiện' },
  { value: 'signature', label: 'DubaiWay Signature (luxury)' },
  { value: 'other', label: 'Khác' },
];

/** Chuẩn hoá ?type về nhóm dịch vụ. */
function normalizeType(type: string | null): string {
  if (!type) return 'tour';
  if (type.startsWith('holyland')) return 'holyland';
  if (type.startsWith('signature')) return 'signature';
  if (type === 'book' || type === 'local') return 'tour';
  if (type === 'hotel-group') return 'hotel';
  if (services.some((s) => s.value === type)) return type;
  return 'other';
}

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function QuoteRequestForm() {
  const params = useSearchParams();
  const [done, setDone] = useState(false);

  const type = normalizeType(params.get('type'));

  // Ngữ cảnh sản phẩm cụ thể (nếu có slug trong query).
  const tourSlug = params.get('tour');
  const journeySlug = params.get('journey');
  const dubaiSlug = params.get('dubai');
  const countrySlug = params.get('country');
  const contextName =
    (tourSlug && getTourBySlug(tourSlug)?.title) ||
    (journeySlug && getHolyLandBySlug(journeySlug)?.title) ||
    (dubaiSlug && getDubaiBySlug(dubaiSlug)?.title) ||
    (countrySlug && `Visa ${getVisaBySlug(countrySlug)?.country ?? ''}`) ||
    null;

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-mist bg-ivory-100 p-10 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconCheck className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-medium text-midnight">Đã nhận yêu cầu của bạn</h2>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Cảm ơn bạn! Chuyên viên DubaiWay sẽ liên hệ trong thời gian sớm nhất để tư vấn và báo giá.
          Cần gấp? Nhắn WhatsApp để được hỗ trợ ngay.
        </p>
        <a
          href={whatsappLink(whatsappMessages.default)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-medium text-white hover:bg-[#1eb757]"
        >
          <IconWhatsapp className="h-4 w-4" /> Nhắn WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-mist bg-ivory-100 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      {contextName && (
        <div className="mb-5 rounded-xl bg-champagne-200/30 px-4 py-3 text-sm text-ink">
          Bạn đang quan tâm: <span className="font-semibold text-midnight">{contextName}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Dịch vụ quan tâm</span>
          <select className={inputCls} defaultValue={type}>
            {services.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
          <input required className={inputCls} placeholder="Nguyễn Văn A" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
          <input required className={inputCls} placeholder="+84…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
          <input type="email" className={inputCls} placeholder="ban@email.com" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Điểm đến / hành trình</span>
          <input className={inputCls} placeholder="Dubai, Đất Thánh, Châu Âu…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày dự kiến</span>
          <input type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số người</span>
          <input type="number" min={1} defaultValue={2} className={inputCls} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngân sách dự kiến (không bắt buộc)</span>
          <input className={inputCls} placeholder="VD: 30–40 triệu/khách" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Chi tiết yêu cầu</span>
          <textarea rows={4} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Mô tả mong muốn, lịch trình, dịch vụ kèm theo…" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg">Gửi yêu cầu báo giá</Button>
        <span className="text-xs text-ink-soft">DubaiWay phản hồi trong giờ làm việc. Thông tin của bạn được bảo mật.</span>
      </div>
    </form>
  );
}
