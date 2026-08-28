'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  createServiceAction, updateServiceAction, type ServiceFormState,
} from './actions';

const initial: ServiceFormState = { error: null, notice: null };

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm text-midnight outline-none focus:border-royal';
const areaCls = 'w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm text-midnight outline-none focus:border-royal';

export interface ServiceFormValues {
  id?: string;
  titleVi: string; titleEn: string;
  summaryVi: string; summaryEn: string;
  descriptionVi: string; descriptionEn: string;
  categorySlug: string;
  city: string; meetingPoint: string;
  durationMinutes: number;
  languages: string;
  minGuests: number; maxGuests: number;
  priceAdult: number; priceChild: number | null;
  taxRateBps: number; bookingCutoffHours: number;
  instantConfirmation: boolean; freeCancellation: boolean; pickupAvailable: boolean;
  highlights: string; included: string; excluded: string;
  cancellationText: string;
}

export function ServiceForm({
  mode, categories, values,
}: {
  mode: 'create' | 'edit';
  categories: readonly { slug: string; name: string }[];
  values?: ServiceFormValues;
}) {
  const [state, action, pending] = useActionState(
    mode === 'create' ? createServiceAction : updateServiceAction,
    initial,
  );
  const v = values;

  return (
    <form action={action} className="space-y-8">
      {v?.id ? <input type="hidden" name="serviceId" value={v.id} /> : null}

      <Block title="Nội dung hiển thị cho khách"
             note="Nhập cả tiếng Việt và tiếng Anh. Khách xem site tiếng nào sẽ thấy nội dung tiếng đó.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên dịch vụ (Tiếng Việt)" name="titleVi" required defaultValue={v?.titleVi}
                 placeholder="Safari sa mạc buổi chiều kèm tiệc BBQ" />
          <Field label="Tên dịch vụ (English)" name="titleEn" required defaultValue={v?.titleEn}
                 placeholder="Evening Desert Safari with BBQ Dinner" />
          <Area label="Mô tả ngắn (Tiếng Việt)" name="summaryVi" required rows={2} defaultValue={v?.summaryVi}
                placeholder="Một câu tóm tắt trải nghiệm, hiện dưới tên dịch vụ." />
          <Area label="Mô tả ngắn (English)" name="summaryEn" required rows={2} defaultValue={v?.summaryEn}
                placeholder="One sentence summarising the experience." />
          <Area label="Mô tả chi tiết (Tiếng Việt)" name="descriptionVi" required rows={6} defaultValue={v?.descriptionVi}
                placeholder="Kể rõ khách sẽ trải nghiệm gì, theo trình tự thời gian. Càng cụ thể càng ít khiếu nại." />
          <Area label="Mô tả chi tiết (English)" name="descriptionEn" required rows={6} defaultValue={v?.descriptionEn}
                placeholder="Describe the experience in chronological order." />
        </div>
      </Block>

      <Block title="Phân loại và địa điểm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Danh mục <Req /></Label>
            <select name="categorySlug" required defaultValue={v?.categorySlug ?? ''} className={inputCls}>
              <option value="" disabled>Chọn danh mục…</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Thành phố" name="city" required defaultValue={v?.city ?? 'Dubai'} placeholder="Dubai" />
          <Field label="Thời lượng (phút)" name="durationMinutes" type="number" required
                 defaultValue={String(v?.durationMinutes ?? 120)} min={15} max={20160} />
          <div className="sm:col-span-3">
            <Field label="Điểm tập trung / đón khách" name="meetingPoint" defaultValue={v?.meetingPoint}
                   placeholder="Bến số 3, Dubai Marina Yacht Club" />
          </div>
        </div>
      </Block>

      <Block title="Giá và sức chứa" note="Giá nhập theo AED. Thuế VAT tính thêm ở bước thanh toán.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Giá người lớn (AED)" name="priceAdult" type="number" required
                 defaultValue={v ? String(v.priceAdult) : ''} min={1} step="0.01" placeholder="150" />
          <Field label="Giá trẻ em (AED)" name="priceChild" type="number"
                 defaultValue={v?.priceChild != null ? String(v.priceChild) : ''} min={0} step="0.01"
                 placeholder="Để trống nếu không nhận trẻ em" />
          <Field label="Thuế VAT (%)" name="taxRatePercent" type="number" required
                 defaultValue={String((v?.taxRateBps ?? 500) / 100)} min={0} max={100} step="0.01"
                 hint="UAE thường là 5%" />
          <Field label="Số khách tối thiểu" name="minGuests" type="number" required
                 defaultValue={String(v?.minGuests ?? 1)} min={1} />
          <Field label="Số khách tối đa" name="maxGuests" type="number" required
                 defaultValue={String(v?.maxGuests ?? 20)} min={1} />
          <Field label="Đặt trước tối thiểu (giờ)" name="bookingCutoffHours" type="number" required
                 defaultValue={String(v?.bookingCutoffHours ?? 24)} min={0} max={720} />
        </div>
      </Block>

      <Block title="Nội dung chi tiết" note="Mỗi dòng là một mục.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Area label="Điểm nổi bật" name="highlights" rows={5} defaultValue={v?.highlights}
                placeholder={'Lái xe cồn cát 20 phút\nNgắm hoàng hôn giữa cồn cát đỏ\nBữa tối BBQ buffet'} />
          <Area label="Giá đã bao gồm" name="included" rows={5} defaultValue={v?.included}
                placeholder={'Đón và trả tại khách sạn\nNước uống không giới hạn\nBữa tối'} />
          <Area label="Không bao gồm" name="excluded" rows={5} defaultValue={v?.excluded}
                placeholder={'Đồ uống có cồn\nTiền tip cho tài xế'} />
        </div>
      </Block>

      <Block title="Điều kiện phục vụ">
        <div className="space-y-3">
          <Check name="instantConfirmation" label="Xác nhận tức thì (khách nhận voucher ngay sau khi thanh toán)"
                 defaultChecked={v?.instantConfirmation} />
          <Check name="freeCancellation" label="Cho phép huỷ miễn phí trước 24 giờ"
                 defaultChecked={v?.freeCancellation} />
          <Check name="pickupAvailable" label="Có đón khách tại khách sạn"
                 defaultChecked={v?.pickupAvailable} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Ngôn ngữ phục vụ" name="languages" defaultValue={v?.languages ?? 'en'}
                 placeholder="en, vi, ar" hint="Viết mã ngôn ngữ, cách nhau bằng dấu phẩy" />
          <Field label="Chính sách huỷ (mô tả cho khách)" name="cancellationText"
                 defaultValue={v?.cancellationText}
                 placeholder="Huỷ miễn phí trước 24 giờ. Trong 24 giờ hoàn 50%." />
        </div>
      </Block>

      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.notice ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.notice}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? 'Đang lưu…' : mode === 'create' ? 'Tạo dịch vụ (lưu nháp)' : 'Lưu thay đổi'}
        </Button>
        <span className="text-sm text-ink-soft">
          {mode === 'create'
            ? 'Dịch vụ được lưu ở dạng nháp. Bạn xem lại rồi nộp cho DubaiWay duyệt.'
            : 'Sửa dịch vụ đang bán sẽ cần DubaiWay duyệt lại trước khi hiển thị.'}
        </span>
      </div>
    </form>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-mist bg-ivory-100 p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-midnight">{title}</h2>
      {note ? <p className="mt-1 text-sm text-ink-soft">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">{children}</span>;
}
function Req() { return <span className="text-red-500">*</span>; }

function Field({
  label, name, type = 'text', required, defaultValue, placeholder, hint, min, max, step,
}: {
  label: string; name: string; type?: string; required?: boolean;
  defaultValue?: string; placeholder?: string; hint?: string;
  min?: number; max?: number; step?: string;
}) {
  return (
    <div>
      <Label>{label} {required ? <Req /> : null}</Label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue}
             placeholder={placeholder} min={min} max={max} step={step} className={inputCls} />
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

function Area({
  label, name, rows = 3, required, defaultValue, placeholder,
}: {
  label: string; name: string; rows?: number; required?: boolean;
  defaultValue?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label} {required ? <Req /> : null}</Label>
      <textarea id={name} name={name} rows={rows} required={required}
                defaultValue={defaultValue} placeholder={placeholder} className={areaCls} />
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-muted">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 accent-champagne" />
      {label}
    </label>
  );
}
