'use client';

import { useState } from 'react';
import { visaCountries, visaPurposes } from '@/data/visas';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

export function VisaConsultForm({ defaultCountry }: { defaultCountry?: string }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-mist bg-ivory-100 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconCheck className="h-6 w-6" />
        </span>
        <p className="mt-3 font-display text-lg font-medium text-midnight">Đã nhận yêu cầu tư vấn</p>
        <p className="mt-1 text-sm text-ink-muted">
          Chuyên viên visa của DubaiWay sẽ liên hệ để đánh giá hồ sơ và hướng dẫn bước tiếp theo.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-mist bg-ivory-100 p-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Họ và tên</span>
        <input required className={inputCls} placeholder="Nguyễn Văn A" />
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
        <input type="date" className={inputCls} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Số người</span>
        <input type="number" min={1} defaultValue={1} className={inputCls} />
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
        <input required className={inputCls} placeholder="+84…" />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
        <input type="email" className={inputCls} placeholder="ban@email.com" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">Ghi chú thêm</span>
        <textarea rows={3} className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal" placeholder="Thông tin bổ sung về hồ sơ, lịch trình…" />
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
          Gửi yêu cầu tư vấn hồ sơ
        </Button>
      </div>
    </form>
  );
}
