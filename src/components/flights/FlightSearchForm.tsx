'use client';

import { useState } from 'react';
import { cabinClasses } from '@/data/flights';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { IconPlane, IconMapPin, IconCalendar, IconUsers, IconSearch } from '@/components/ui/icons';

type Trip = 'round' | 'oneway' | 'multi';

const trips: { key: Trip; label: string }[] = [
  { key: 'round', label: 'Khứ hồi' },
  { key: 'oneway', label: 'Một chiều' },
  { key: 'multi', label: 'Nhiều chặng' },
];

function Field({
  icon: Icon,
  label,
  placeholder,
  type = 'text',
  defaultValue,
}: {
  icon: typeof IconMapPin;
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 rounded-xl border border-mist bg-ivory-100 px-4 py-2.5 text-left focus-within:border-royal">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <span className="flex items-center gap-2 text-ink">
        <Icon className="h-4 w-4 text-royal" />
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
        />
      </span>
    </label>
  );
}

export function FlightSearchForm() {
  const [trip, setTrip] = useState<Trip>('round');

  return (
    <div className="rounded-2xl bg-ivory-100 p-4 shadow-console ring-1 ring-mist sm:p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {trips.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTrip(t.key)}
            aria-pressed={trip === t.key}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              trip === t.key ? 'bg-midnight text-white' : 'text-ink-muted hover:bg-mist-200',
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <select className="h-9 rounded-full border border-mist bg-ivory px-3 text-sm text-midnight outline-none focus:border-royal">
            {cabinClasses.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <form
        className="flex flex-col gap-2 lg:flex-row lg:items-stretch"
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById('ket-qua')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <Field icon={IconPlane} label="Điểm đi" placeholder="TP.HCM (SGN)" defaultValue="TP.HCM (SGN)" />
        <Field icon={IconMapPin} label="Điểm đến" placeholder="Dubai (DXB)" defaultValue="Dubai (DXB)" />
        <Field icon={IconCalendar} label="Ngày đi" type="date" />
        {trip === 'round' && <Field icon={IconCalendar} label="Ngày về" type="date" />}
        <Field icon={IconUsers} label="Hành khách" placeholder="1 người lớn" defaultValue="1 người lớn" />
        <Button type="submit" variant="primary" size="lg" className="shrink-0">
          <IconSearch className="h-4 w-4" /> Tìm vé
        </Button>
      </form>
      {trip === 'multi' && (
        <p className="mt-2 text-xs text-ink-soft">
          Nhiều chặng: gửi hành trình chi tiết để DubaiWay dựng giá tối ưu — dùng nút “Nhờ DubaiWay kiểm giá” bên dưới.
        </p>
      )}
    </div>
  );
}
