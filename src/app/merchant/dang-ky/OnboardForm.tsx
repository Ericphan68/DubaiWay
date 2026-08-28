'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { registerMerchantAction, submitMerchantAction, type OnboardState } from './actions';

const initial: OnboardState = { error: null, notice: null };
const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function OnboardForm() {
  const [state, action, pending] = useActionState(registerMerchantAction, initial);
  const [kind, setKind] = useState<'business' | 'individual'>('business');

  return (
    <form action={action} className="space-y-6">
      <Block title="Bạn đăng ký với tư cách nào?">
        <div className="grid gap-3 sm:grid-cols-2">
          {(['business', 'individual'] as const).map((k) => (
            <label
              key={k}
              className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                kind === k ? 'border-champagne bg-champagne/[0.05]' : 'border-mist hover:border-mist-400'
              }`}
            >
              <input type="radio" name="kind" value={k} checked={kind === k}
                     onChange={() => setKind(k)} className="sr-only" />
              <span className="block font-medium text-midnight">
                {k === 'business' ? 'Doanh nghiệp' : 'Cá nhân'}
              </span>
              <span className="mt-1 block text-sm text-ink-soft">
                {k === 'business'
                  ? 'Công ty lữ hành, nhà hàng, đơn vị vận tải có giấy phép kinh doanh.'
                  : 'Hướng dẫn viên tự do, nhiếp ảnh gia, tài xế riêng.'}
              </span>
            </label>
          ))}
        </div>
      </Block>

      <Block title="Thông tin cơ bản">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên hiển thị trên sàn" name="displayName" required
                 placeholder="Desert Rose Dubai" hint="Đây là tên khách nhìn thấy." />
          {kind === 'business' ? (
            <>
              <Field label="Tên pháp lý" name="legalName" required
                     placeholder="Desert Rose Tourism LLC" />
              <Field label="Số đăng ký kinh doanh" name="registrationNumber" placeholder="CN-1234567" />
              <Field label="Mã số thuế" name="taxNumber" placeholder="100234567800003" />
            </>
          ) : (
            <>
              <Field label="Họ và tên đầy đủ" name="individualFullName" required
                     placeholder="Như trên hộ chiếu" />
              <Field label="Quốc tịch (mã 2 chữ)" name="nationality" placeholder="JO" />
            </>
          )}
          <Field label="Email liên hệ" name="contactEmail" type="email" required
                 placeholder="booking@congty.com" />
          <Field label="WhatsApp / SĐT" name="contactPhone" required placeholder="+971…" />
          <Field label="Thành phố hoạt động" name="city" required defaultValue="Dubai" />
          <Field label="Quốc gia (mã 2 chữ)" name="country" required defaultValue="AE" />
        </div>
      </Block>

      <Block title="Mô tả về bạn"
             note="Đội thẩm định đọc phần này để hiểu bạn cung cấp dịch vụ gì và đã hoạt động bao lâu.">
        <textarea
          name="description" rows={5} required minLength={30}
          className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
          placeholder="VD: Đơn vị lữ hành nội địa tại Dubai từ 2015, chuyên safari sa mạc, city tour và du thuyền Marina. Đội ngũ 12 người, có 6 xe 4x4 và 2 du thuyền."
        />
      </Block>

      <Block title="Giấy tờ pháp lý"
             note={kind === 'business'
               ? 'Cần: giấy phép kinh doanh, mã số thuế, giấy phép lữ hành (nếu ngành nghề yêu cầu), giấy tờ người đại diện.'
               : 'Cần: hộ chiếu hoặc Emirates ID, giấy phép hành nghề (nếu ngành nghề yêu cầu).'}>
        <textarea
          name="documentNames" rows={4}
          className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
          placeholder={kind === 'business'
            ? 'trade-license.pdf\ntax-certificate.pdf\ntourism-license.pdf'
            : 'passport.pdf\nemirates-id.pdf'}
        />
        <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Hiện tại bạn liệt kê <strong>tên giấy tờ</strong>, mỗi dòng một file. Đội hỗ trợ sẽ liên hệ
          để nhận file qua kênh bảo mật. Tính năng tải file trực tiếp lên kho riêng tư sẽ có ở bản cập nhật tới.
        </p>
      </Block>

      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? 'Đang tạo hồ sơ…' : 'Tạo hồ sơ đối tác'}
      </Button>
      <p className="text-sm text-ink-soft">
        Hồ sơ được lưu ở dạng nháp. Bạn xem lại rồi mới nộp cho DubaiWay thẩm định.
      </p>
    </form>
  );
}

export function SubmitMerchantButton({ merchantId }: { merchantId: string }) {
  const [state, action, pending] = useActionState(submitMerchantAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="merchantId" value={merchantId} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Đang nộp…' : 'Nộp hồ sơ cho DubaiWay thẩm định'}
      </Button>
      {state.error ? <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="mt-2 text-sm text-emerald-700">{state.notice}</p> : null}
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

function Field({ label, name, type = 'text', required, placeholder, hint, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; hint?: string; defaultValue?: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder}
             defaultValue={defaultValue} className={inputCls} />
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
