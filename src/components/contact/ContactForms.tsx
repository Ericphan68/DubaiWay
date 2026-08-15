'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

function Success({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      <IconCheck className="h-5 w-5" /> {title}
    </div>
  );
}

export function ContactForm() {
  const [done, setDone] = useState(false);
  return (
    <form
      className="rounded-2xl border border-mist bg-ivory-100 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <h2 className="font-display text-xl font-medium text-midnight">Gửi tin nhắn cho chúng tôi</h2>
      <p className="mt-1 text-sm text-ink-muted">Điền form, DubaiWay sẽ phản hồi qua email hoặc điện thoại.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
          <input required className={inputCls} placeholder="Nguyễn Văn A" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Email / SĐT</span>
          <input required className={inputCls} placeholder="ban@email.com" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Chủ đề</span>
          <input className={inputCls} placeholder="Tôi cần tư vấn về…" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">Nội dung</span>
          <textarea rows={4} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Nội dung tin nhắn…" />
        </label>
      </div>
      <div className="mt-5">
        {done ? <Success title="Đã gửi! DubaiWay sẽ phản hồi sớm." /> : <Button type="submit" variant="primary" size="lg">Gửi tin nhắn</Button>}
      </div>
    </form>
  );
}

export function CallbackForm() {
  const [done, setDone] = useState(false);
  return (
    <form
      id="callback"
      className="scroll-mt-24 rounded-2xl bg-midnight p-6 text-white"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <h2 className="font-display text-xl font-medium">Yêu cầu gọi lại</h2>
      <p className="mt-1 text-sm text-white/70">Để lại số, chuyên viên DubaiWay sẽ gọi cho bạn.</p>
      <div className="mt-4 space-y-3">
        <input required className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-champagne-400" placeholder="Họ tên" />
        <input required className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-champagne-400" placeholder="Số điện thoại / WhatsApp" />
        <select className="h-11 w-full rounded-xl border border-white/20 bg-midnight-800 px-3 text-sm text-white outline-none focus:border-champagne-400">
          <option>Khung giờ: Bất kỳ</option>
          <option>Buổi sáng (8–12h)</option>
          <option>Buổi chiều (13–17h)</option>
          <option>Buổi tối (18–21h)</option>
        </select>
      </div>
      <div className="mt-4">
        {done ? (
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-champagne-400">
            <IconCheck className="h-5 w-5" /> Đã ghi nhận. DubaiWay sẽ gọi lại cho bạn.
          </div>
        ) : (
          <Button type="submit" variant="gold" className="w-full">Yêu cầu gọi lại</Button>
        )}
      </div>
    </form>
  );
}
