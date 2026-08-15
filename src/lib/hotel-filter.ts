import type { Hotel } from '@/types';

export interface HotelQuery {
  city?: string;
  stars?: string;
  price?: string;
  rating?: string;
  breakfast?: string;
  freecancel?: string;
  amenity?: string;
  sort?: string;
}

function priceInUsd(hotel: Hotel): number {
  return hotel.price.currency === 'VND' ? hotel.price.from / 25000 : hotel.price.from;
}

function matchPrice(usd: number, bucket: string): boolean {
  if (bucket === 'budget') return usd < 120;
  if (bucket === 'mid') return usd >= 120 && usd < 280;
  if (bucket === 'lux') return usd >= 280;
  return true;
}

export function filterHotels(all: Hotel[], q: HotelQuery): Hotel[] {
  let list = all.filter((h) => {
    if (q.city && h.city !== q.city) return false;
    if (q.stars && h.stars < Number(q.stars)) return false;
    if (q.rating && h.rating < Number(q.rating)) return false;
    if (q.breakfast === '1' && !h.breakfastIncluded) return false;
    if (q.freecancel === '1' && !h.freeCancellation) return false;
    if (q.amenity && !h.amenities.includes(q.amenity)) return false;
    if (q.price && !matchPrice(priceInUsd(h), q.price)) return false;
    return true;
  });

  switch (q.sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => priceInUsd(a) - priceInUsd(b));
      break;
    case 'price-desc':
      list = [...list].sort((a, b) => priceInUsd(b) - priceInUsd(a));
      break;
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }
  return list;
}

export const hotelSortOptions = [
  { value: 'popular', label: 'Nổi bật' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Điểm đánh giá cao' },
];

export const priceBuckets = [
  { value: 'budget', label: 'Dưới ~120$' },
  { value: 'mid', label: '~120–280$' },
  { value: 'lux', label: 'Trên ~280$' },
];
