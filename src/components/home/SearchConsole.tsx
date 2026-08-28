'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  IconPlane,
  IconBed,
  IconCompass,
  IconPassport,
  IconSparkle,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconSearch,
} from '@/components/ui/icons';

type TabKey = 'flights' | 'hotels' | 'tours' | 'visa' | 'events' | 'dubai';

const tabs: { key: TabKey; label: string; Icon: typeof IconPlane; href: string }[] = [
  // Tour đứng đầu: đây là mảng DubaiWay bán trực tiếp, các mục còn lại
  // hiện vẫn dẫn sang đối tác nên xếp sau.
  { key: 'tours', label: 'Tour', Icon: IconCompass, href: '/du-lich' },
  { key: 'flights', label: 'Vé máy bay', Icon: IconPlane, href: '/ve-may-bay' },
  { key: 'hotels', label: 'Khách sạn', Icon: IconBed, href: '/khach-san' },
  { key: 'visa', label: 'Visa', Icon: IconPassport, href: '/visa' },
  { key: 'events', label: 'Events', Icon: IconSparkle, href: '/events' },
  { key: 'dubai', label: 'Dubai', Icon: IconMapPin, href: '/dubai' },
];

/** Ô nhập chung — chỉ trình bày (Phase 1 chưa nối API). */
function Field({
  icon: Icon,
  label,
  placeholder,
  type = 'text',
}: {
  icon: typeof IconMapPin;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 rounded-xl border border-mist bg-ivory-100 px-4 py-2.5 text-left transition-colors focus-within:border-royal">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <span className="flex items-center gap-2 text-ink">
        <Icon className="h-4 w-4 text-royal" />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
        />
      </span>
    </label>
  );
}

export function SearchConsole() {
  const [active, setActive] = useState<TabKey>('tours');
  const router = useRouter();
  const current = tabs.find((t) => t.key === active)!;

  return (
    <div className="w-full rounded-2xl bg-ivory-100/95 p-2 shadow-console ring-1 ring-white/40 backdrop-blur-md sm:p-3">
      {/* Tabs dịch vụ */}
      <div className="no-scrollbar mb-2 flex gap-1 overflow-x-auto">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            aria-pressed={active === key}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              active === key
                ? 'bg-midnight text-white'
                : 'text-ink-muted hover:bg-mist-200',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Form theo tab */}
      <form
        className="flex flex-col gap-2 rounded-xl bg-mist-200/60 p-2 sm:flex-row sm:items-stretch"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(current.href);
        }}
      >
        {active === 'flights' && (
          <>
            <Field icon={IconPlane} label="Điểm đi" placeholder="TP.HCM (SGN)" />
            <Field icon={IconMapPin} label="Điểm đến" placeholder="Dubai (DXB)" />
            <Field icon={IconCalendar} label="Ngày đi" type="date" />
            <Field icon={IconUsers} label="Hành khách" placeholder="1 người lớn" />
          </>
        )}
        {active === 'hotels' && (
          <>
            <Field icon={IconMapPin} label="Điểm đến" placeholder="Thành phố hoặc khách sạn" />
            <Field icon={IconCalendar} label="Nhận phòng" type="date" />
            <Field icon={IconCalendar} label="Trả phòng" type="date" />
            <Field icon={IconUsers} label="Khách" placeholder="2 khách · 1 phòng" />
          </>
        )}
        {active === 'tours' && (
          <>
            <Field icon={IconMapPin} label="Điểm đến" placeholder="Dubai, Đất Thánh, Châu Âu…" />
            <Field icon={IconCompass} label="Khởi hành từ" placeholder="TP.HCM, Hà Nội…" />
            <Field icon={IconCalendar} label="Thời gian" type="month" />
          </>
        )}
        {active === 'visa' && (
          <>
            <Field icon={IconPassport} label="Quốc gia muốn đến" placeholder="UAE, Schengen, Mỹ…" />
            <Field icon={IconMapPin} label="Đang cư trú" placeholder="Việt Nam" />
            <Field icon={IconCalendar} label="Dự kiến đi" type="date" />
          </>
        )}
        {active === 'events' && (
          <>
            <Field icon={IconMapPin} label="Nơi tổ chức" placeholder="Dubai, Việt Nam, Thái Lan…" />
            <Field icon={IconSparkle} label="Loại sự kiện" placeholder="Gala, hội nghị, wedding…" />
            <Field icon={IconUsers} label="Số khách" placeholder="Ví dụ 120" />
          </>
        )}
        {active === 'dubai' && (
          <>
            <Field icon={IconSparkle} label="Trải nghiệm" placeholder="Safari, Burj Khalifa, du thuyền…" />
            <Field icon={IconCalendar} label="Ngày tham gia" type="date" />
            <Field icon={IconUsers} label="Số khách" placeholder="2 người lớn" />
          </>
        )}
        <Button type="submit" variant="primary" size="lg" className="shrink-0 sm:w-auto">
          <IconSearch className="h-4 w-4" />
          Tìm kiếm
        </Button>
      </form>
    </div>
  );
}
