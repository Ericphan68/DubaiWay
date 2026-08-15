'use client';

import { useState } from 'react';
import type { Tour } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';
import { whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ActionBadge, actionMeta } from '@/components/ui/ActionBadge';
import { IconCalendar, IconUsers, IconWhatsapp, IconCheck } from '@/components/ui/icons';

export function BookingBox({ tour }: { tour: Tour }) {
  const [date, setDate] = useState(tour.nextDepartures[0] ?? '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [held, setHeld] = useState(false);

  const dateLabel = /\d{4}-\d{2}-\d{2}/.test(date) ? formatDate(date) : date;
  const waMessage = `Xin chào DubaiWay, tôi quan tâm tour "${tour.title}" — ngày ${dateLabel}, ${adults} người lớn${children ? ` và ${children} trẻ em` : ''}. Nhờ tư vấn và báo giá giúp.`;

  return (
    <div className="rounded-2xl bg-ivory-100 p-5 shadow-card ring-1 ring-mist">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs text-ink-soft">Giá tham khảo từ</span>
          <p className="font-display text-2xl font-semibold text-midnight">{formatPrice(tour.price)}</p>
          <span className="text-xs text-ink-soft">{tour.price.unit}</span>
        </div>
        <ActionBadge action={tour.action} />
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <IconCalendar className="h-3.5 w-3.5 text-royal" /> Ngày khởi hành
          </span>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-mist bg-ivory px-3 text-sm outline-none focus:border-royal"
          >
            {tour.nextDepartures.map((d) => (
              <option key={d} value={d}>
                {/\d{4}-\d{2}-\d{2}/.test(d) ? formatDate(d) : d}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Người lớn" value={adults} setValue={setAdults} min={1} />
          <Stepper label="Trẻ em" value={children} setValue={setChildren} min={0} />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {tour.action === 'book' && (
          <>
            <Button href={`/yeu-cau-bao-gia?tour=${tour.slug}&type=book`} variant="primary" className="w-full">
              Đặt trực tuyến
            </Button>
            <button
              type="button"
              onClick={() => setHeld(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-midnight/20 text-sm font-medium text-midnight transition-colors hover:bg-midnight/[0.03]"
            >
              {held ? (
                <><IconCheck className="h-4 w-4 text-emerald-600" /> Đã ghi nhận giữ chỗ</>
              ) : (
                'Giữ chỗ (chưa thanh toán)'
              )}
            </button>
          </>
        )}
        {tour.action !== 'book' && (
          <Button href={`/yeu-cau-bao-gia?tour=${tour.slug}`} variant="primary" className="w-full">
            Yêu cầu báo giá
          </Button>
        )}

        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1eb757]"
        >
          <IconWhatsapp className="h-4 w-4" /> Nhắn WhatsApp
        </a>

        {tour.action === 'book' && (
          <Button href={`/yeu-cau-bao-gia?tour=${tour.slug}`} variant="ghost" size="sm" className="w-full">
            Hoặc yêu cầu báo giá
          </Button>
        )}
        <Button href={`/yeu-cau-bao-gia?tour=${tour.slug}&type=group`} variant="outline" className="w-full">
          <IconUsers className="h-4 w-4" /> Đặt tour đoàn riêng
        </Button>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-soft">
        <span className={cn('h-1.5 w-1.5 rounded-full', actionMeta[tour.action].dot)} />
        {tour.action === 'book'
          ? 'Bạn đang đặt trực tiếp với DubaiWay.'
          : 'Bạn đang gửi yêu cầu để DubaiWay báo giá.'}
      </p>
      <p className="mt-1 text-xs text-ink-soft">Giá là tham khảo, xác nhận khi đặt. Còn {tour.seatsLeft} chỗ.</p>
    </div>
  );
}

function Stepper({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
}) {
  return (
    <div>
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <IconUsers className="h-3.5 w-3.5 text-royal" /> {label}
      </span>
      <div className="flex h-11 items-center justify-between rounded-xl border border-mist bg-ivory px-2">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="h-7 w-7 rounded-full text-lg leading-none text-ink-muted hover:bg-mist-200 disabled:opacity-40"
          disabled={value <= min}
          aria-label={`Giảm ${label}`}
        >
          −
        </button>
        <span className="text-sm font-semibold text-midnight" aria-live="polite">{value}</span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="h-7 w-7 rounded-full text-lg leading-none text-ink-muted hover:bg-mist-200"
          aria-label={`Tăng ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
