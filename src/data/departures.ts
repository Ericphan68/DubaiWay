import { img, photo } from './images';

/** Điểm khởi hành từ Việt Nam — dùng cho bước "Khởi hành từ đâu?". */
export const departures = [
  {
    code: 'SGN',
    city: 'TP. Hồ Chí Minh',
    airport: 'Tân Sơn Nhất',
    image: img(photo.vietnam, 800),
    tourCount: 42,
  },
  {
    code: 'HAN',
    city: 'Hà Nội',
    airport: 'Nội Bài',
    image: img(photo.hoiAn, 800),
    tourCount: 36,
  },
  {
    code: 'DAD',
    city: 'Đà Nẵng',
    airport: 'Đà Nẵng',
    image: img(photo.beach, 800),
    tourCount: 18,
  },
  {
    code: 'OTHER',
    city: 'Tỉnh thành khác',
    airport: 'Nối chuyến nội địa',
    image: img(photo.airplane, 800),
    tourCount: 24,
  },
] as const;

export type Departure = (typeof departures)[number];
