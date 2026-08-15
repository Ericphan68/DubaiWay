'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';

const inputCls =
  'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function BusinessClassForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-white/[0.06] p-8 text-center ring-1 ring-white/10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          <IconCheck className="h-6 w-6" />
        </span>
        <p className="mt-3 font-display text-lg font-medium text-white">Đã nhận yêu cầu của bạn</p>
        <p className="mt-1 text-sm text-white/70">
          Chuyên viên DubaiWay sẽ săn giá khoang thương gia và liên hệ lại trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-white/80">Hành trình</span>
        <input required className={inputCls} placeholder="VD: TP.HCM → London, khứ hồi" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Ngày bay dự kiến</span>
        <input type="date" className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Số người</span>
        <input type="number" min={1} defaultValue={1} className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Hãng ưu tiên</span>
        <input className={inputCls} placeholder="VD: Emirates, Qatar…" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-white/80">Ngân sách dự kiến</span>
        <input className={inputCls} placeholder="VD: 60–80 triệu/khách" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-white/80">WhatsApp / Số điện thoại</span>
        <input required className={inputCls} placeholder="VD: +84…" />
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" variant="gold" size="lg" className="w-full">
          Gửi yêu cầu săn giá vé thương gia
        </Button>
        <p className="mt-2 text-xs text-white/55">Thông tin chỉ dùng để tư vấn. Giá xác nhận theo thời điểm đặt.</p>
      </div>
    </form>
  );
}
