import type { ItineraryDay } from '@/types';
import { IconBed } from '@/components/ui/icons';

/** Lịch trình từng ngày — Route Line làm rail dọc, mỗi ngày một điểm nút. */
export function TourItinerary({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="relative">
      {/* rail dọc champagne */}
      <span
        className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-champagne via-champagne/50 to-transparent"
        aria-hidden
      />
      {days.map((day) => (
        <li key={day.day} className="relative flex gap-5 pb-8 last:pb-0">
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-champagne-400 ring-4 ring-ivory">
            {day.day}
          </span>
          <div className="pt-0.5">
            <h3 className="font-display text-lg font-medium text-midnight">{day.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{day.description}</p>
            {day.meals && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <IconBed className="h-3.5 w-3.5 text-champagne-600" /> Ăn uống: {day.meals}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
