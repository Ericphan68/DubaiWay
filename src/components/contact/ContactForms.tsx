'use client';

import { LeadForm } from '@/components/shared/LeadForm';

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

const CONTACT_FIELDS = [
  { name: 'name', label: 'Họ và tên' },
  { name: 'contact', label: 'Email / SĐT' },
  { name: 'subject', label: 'Chủ đề' },
  { name: 'message', label: 'Nội dung' },
] as const;

export function ContactForm() {
  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-6 sm:p-8">
      <h2 className="font-display text-xl font-medium text-midnight">Gửi tin nhắn cho chúng tôi</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Điền form, yêu cầu được chuyển thẳng tới đội tư vấn DubaiWay qua WhatsApp.
      </p>

      <LeadForm
        title="được tư vấn"
        subject="Yêu cầu tư vấn từ website DubaiWay"
        fields={CONTACT_FIELDS}
        submitLabel="Gửi tin nhắn"
        className="mt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
            <input name="name" required className={inputCls} placeholder="Nguyễn Văn A" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-ink-muted">Email / SĐT</span>
            <input name="contact" required className={inputCls} placeholder="ban@email.com" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">Chủ đề</span>
            <input name="subject" className={inputCls} placeholder="Tôi cần tư vấn về…" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">Nội dung</span>
            <textarea
              name="message" rows={4}
              className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
              placeholder="Nội dung tin nhắn…"
            />
          </label>
        </div>
      </LeadForm>
    </div>
  );
}

const CALLBACK_FIELDS = [
  { name: 'name', label: 'Họ tên' },
  { name: 'phone', label: 'Số điện thoại / WhatsApp' },
] as const;

export function CallbackForm() {
  return (
    <div className="rounded-2xl bg-midnight p-6 text-white sm:p-8">
      <h2 className="font-display text-xl font-medium">Nhận cuộc gọi tư vấn</h2>
      <p className="mt-1 text-sm text-white/70">
        Để lại số, đội tư vấn liên hệ lại trong giờ làm việc.
      </p>

      <LeadForm
        title="được gọi lại tư vấn"
        subject="Yêu cầu gọi lại — DubaiWay"
        fields={CALLBACK_FIELDS}
        submitLabel="Yêu cầu gọi lại"
        className="mt-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="name" required placeholder="Họ tên"
            className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-champagne-400"
          />
          <input
            name="phone" required placeholder="Số điện thoại / WhatsApp"
            className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-champagne-400"
          />
        </div>
      </LeadForm>
    </div>
  );
}
