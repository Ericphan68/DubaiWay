import type { Destination } from '@/types';
import { img, photo } from './images';

export const destinations: Destination[] = [
  { name: 'Dubai & UAE', slug: 'dubai', image: img(photo.dubaiSkyline), tourCount: 28, tagline: 'Sa mạc, siêu tháp và xa hoa vùng Vịnh' },
  { name: 'Israel & Jordan', slug: 'israel-jordan', image: img(photo.jerusalem), tourCount: 16, tagline: 'Hành trình về vùng Đất Thánh' },
  { name: 'Ai Cập', slug: 'ai-cap', image: img(photo.egypt), tourCount: 9, tagline: 'Kim tự tháp và dòng sông Nile' },
  { name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky', image: img(photo.cappadocia), tourCount: 12, tagline: 'Khinh khí cầu Cappadocia, Bảy Hội Thánh' },
  { name: 'Hy Lạp', slug: 'hy-lap', image: img(photo.santorini), tourCount: 8, tagline: 'Santorini và cái nôi văn minh' },
  { name: 'Ý & Vatican', slug: 'y-vatican', image: img(photo.rome), tourCount: 11, tagline: 'Rome vĩnh cửu và Toà Thánh' },
  { name: 'Việt Nam', slug: 'viet-nam', image: img(photo.hoiAn), tourCount: 20, tagline: 'Di sản và bờ biển quê hương' },
  { name: 'Thái Lan', slug: 'thai-lan', image: img(photo.bangkok), tourCount: 14, tagline: 'Bangkok sôi động, đảo ngọc phương Nam' },
];
