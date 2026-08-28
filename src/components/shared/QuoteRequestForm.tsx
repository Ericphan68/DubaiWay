'use client';

import { useSearchParams } from 'next/navigation';
import { getTourBySlug } from '@/data/tours';
import { getHolyLandBySlug } from '@/data/holyland-details';
import { getDubaiBySlug } from '@/data/dubai-details';
import { getVisaBySlug } from '@/data/visa-details';
import { LeadForm } from '@/components/shared/LeadForm';

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

/** Thứ tự các trường quyết định thứ tự dòng trong tin nhắn gửi đi. */
const QUOTE_FIELDS = [
  { name: 'service', label: 'Dịch vụ quan tâm' },
  { name: 'name', label: 'Họ và tên' },
  { name: 'phone', label: 'WhatsApp / SĐT' },
  { name: 'email', label: 'Email' },
  { name: 'destination', label: 'Điểm đến / hành trình' },
  { name: 'date', label: 'Ngày dự kiến' },
  { name: 'guests', label: 'Số người' },
  { name: 'budget', label: 'Ngân sách dự kiến' },
  { name: 'details', label: 'Chi tiết yêu cầu' },
] as const;

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function QuoteRequestForm() {
  const params = useSearchParams();

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

  return (
    <LeadForm
      title="nhận báo giá"
      subject="Yêu cầu báo giá — DubaiWay"
      fields={QUOTE_FIELDS}
      submitLabel="Gửi yêu cầu báo giá"
      className="rounded-2xl border border-mist bg-ivory-100 p-6 sm:p-8"
    >
      {contextName && (
        <div className="mb-5 rounded-xl bg-champagne-200/30 px-4 py-3 text-sm text-ink">
          Bạn đang quan tâm: <span className="font-semibold text-midnight">{contextName}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Dịch vụ quan tâm</span>
          <select name="service" className={inputCls} defaultValue={type}>
            {services.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
          <input name="name" required className={inputCls} placeholder="Nguyễn Văn A" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
          <input name="phone" required className={inputCls} placeholder="+84…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
          <input name="email" type="email" className={inputCls} placeholder="ban@email.com" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Điểm đến / hành trình</span>
          <input name="destination" className={inputCls} placeholder="Dubai, Đất Thánh, Châu Âu…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngày dự kiến</span>
          <input name="date" type="date" className={inputCls} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Số người</span>
          <input name="guests" type="number" min={1} defaultValue={2} className={inputCls} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Ngân sách dự kiến (không bắt buộc)</span>
          <input name="budget" className={inputCls} placeholder="VD: 30–40 triệu/khách" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Chi tiết yêu cầu</span>
          <textarea name="details" rows={4} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Mô tả mong muốn, lịch trình, dịch vụ kèm theo…" />
        </label>
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        DubaiWay phản hồi trong giờ làm việc. Thông tin của bạn được bảo mật.
      </p>
    </LeadForm>
  );
}
