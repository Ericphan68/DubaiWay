'use client';

import { Button } from '@/components/ui/Button';
import { IconMapPin, IconCalendar, IconUsers, IconSearch } from '@/components/ui/icons';

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
    <label className="flex flex-1 flex-col gap-1 rounded-xl border border-mist bg-ivory-100 px-4 py-2.5 text-left focus-within:border-royal">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <span className="flex items-center gap-2 text-ink">
        <Icon className="h-4 w-4 text-royal" />
        <input type={type} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70" />
      </span>
    </label>
  );
}

export function HotelSearchBar() {
  return (
    <form
      className="flex flex-col gap-2 rounded-2xl bg-ivory-100 p-4 shadow-console ring-1 ring-mist lg:flex-row lg:items-stretch"
      onSubmit={(e) => {
        e.preventDefault();
        document.getElementById('danh-sach')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <Field icon={IconMapPin} label="Thành phố / khách sạn" placeholder="Dubai, Jerusalem…" />
      <Field icon={IconCalendar} label="Nhận phòng" type="date" />
      <Field icon={IconCalendar} label="Trả phòng" type="date" />
      <Field icon={IconUsers} label="Phòng & khách" placeholder="1 phòng · 2 khách" />
      <Button type="submit" variant="primary" size="lg" className="shrink-0">
        <IconSearch className="h-4 w-4" /> Tìm khách sạn
      </Button>
    </form>
  );
}
