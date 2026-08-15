import type { Tour } from '@/types';
import { departures } from '@/data/departures';

export interface TourQuery {
  dest?: string;
  from?: string;
  segment?: string;
  format?: string;
  duration?: string;
  mode?: string;
  sort?: string;
}

/** Đổi mã sân bay (SGN…) sang tên thành phố để khớp departureFrom. */
function resolveCity(from: string): string {
  const match = departures.find((d) => d.code === from);
  return match ? match.city : from;
}

/** Quy đổi thô sang VND chỉ để so sánh khi sắp xếp (không hiển thị). */
function priceForSort(tour: Tour): number {
  return tour.price.currency === 'USD' ? tour.price.from * 25000 : tour.price.from;
}

function matchDuration(days: number, bucket: string): boolean {
  if (bucket === 'short') return days <= 3;
  if (bucket === 'medium') return days >= 4 && days <= 7;
  if (bucket === 'long') return days >= 8;
  return true;
}

export function filterTours(all: Tour[], q: TourQuery): Tour[] {
  let list = all.filter((tour) => {
    if (q.dest && tour.destination !== q.dest) return false;
    if (q.from) {
      const city = resolveCity(q.from);
      if (!tour.departureFrom.some((d) => d === city || d === q.from)) return false;
    }
    if (q.segment && tour.segment !== q.segment) return false;
    if (q.format && tour.format !== q.format) return false;
    if (q.mode && tour.format !== q.mode) return false;
    if (q.duration && !matchDuration(tour.durationDays, q.duration)) return false;
    return true;
  });

  switch (q.sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => priceForSort(a) - priceForSort(b));
      break;
    case 'price-desc':
      list = [...list].sort((a, b) => priceForSort(b) - priceForSort(a));
      break;
    case 'duration':
      list = [...list].sort((a, b) => b.durationDays - a.durationDays);
      break;
    default:
      break;
  }
  return list;
}

export const sortOptions = [
  { value: 'popular', label: 'Nổi bật' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'duration', label: 'Thời lượng dài nhất' },
];
