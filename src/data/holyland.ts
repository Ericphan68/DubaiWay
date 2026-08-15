import type { HolyLandJourney } from '@/types';
import { img, photo } from './images';

export const holyLandJourneys: HolyLandJourney[] = [
  {
    slug: 'israel-jordan-9-ngay',
    title: 'Israel & Jordan – Theo dấu Chúa Giê-su',
    countries: ['Israel', 'Jordan'],
    image: img(photo.jerusalem),
    durationDays: 9,
    theme: 'Theo dấu Chúa Giê-su',
    mode: 'Khởi hành từ Việt Nam',
    leader: 'MS. Nguyễn Thành Nhân dẫn đoàn',
    price: { from: 68500000, currency: 'VND', unit: '/khách' },
    nextDepartures: ['2026-09-20', '2026-11-08'],
    summary:
      'Từ Bethlehem đến Jerusalem, đi qua Biển hồ Galilê và dòng sông Jordan, khép lại bằng kỳ quan Petra.',
    stops: [
      { place: 'Bethlehem', meaning: 'Nơi Chúa Giáng sinh' },
      { place: 'Nazareth', meaning: 'Thời thơ ấu của Chúa Giê-su' },
      { place: 'Biển hồ Galilê', meaning: 'Nơi Chúa gọi các môn đồ' },
      { place: 'Jerusalem', meaning: 'Thương khó và Phục sinh' },
    ],
  },
  {
    slug: 'ai-cap-israel-jordan-12-ngay',
    title: 'Ai Cập – Israel – Jordan liên tuyến',
    countries: ['Ai Cập', 'Israel', 'Jordan'],
    image: img(photo.egypt),
    durationDays: 12,
    theme: 'Từ Xuất Ê-díp-tô đến Đất Hứa',
    mode: 'Khởi hành từ Việt Nam',
    leader: 'Trưởng đoàn mục vụ DubaiWay',
    price: { from: 89900000, currency: 'VND', unit: '/khách' },
    nextDepartures: ['2026-11-02'],
    summary:
      'Đại hành trình nối liền Cựu Ước và Tân Ước: kim tự tháp Giza, núi Sinai, Biển Đỏ, Jerusalem và Petra.',
    stops: [
      { place: 'Giza', meaning: 'Bối cảnh Ai Cập cổ đại' },
      { place: 'Núi Sinai', meaning: 'Nơi ban Mười Điều Răn' },
      { place: 'Biển Đỏ', meaning: 'Cuộc vượt biển của dân Israel' },
      { place: 'Jerusalem', meaning: 'Trung tâm Đất Thánh' },
    ],
  },
  {
    slug: 'tho-nhi-ky-bay-hoi-thanh',
    title: 'Bảy Hội Thánh & Hành trình Phao-lô',
    countries: ['Thổ Nhĩ Kỳ'],
    image: img(photo.cappadocia),
    durationDays: 10,
    theme: 'Hành trình sứ đồ Phao-lô',
    mode: 'Ghép đoàn tại điểm đến',
    leader: 'Hướng dẫn viên chuyên đề Kinh Thánh',
    price: { from: 59900000, currency: 'VND', unit: '/khách' },
    nextDepartures: ['2026-10-10', '2026-12-05'],
    summary:
      'Bảy Hội Thánh trong sách Khải Huyền, Ephesus, Cappadocia và Istanbul nối hai châu lục.',
    stops: [
      { place: 'Ephesus', meaning: 'Hội Thánh Ê-phê-sô' },
      { place: 'Smyrna', meaning: 'Hội Thánh chịu thử thách' },
      { place: 'Laodicea', meaning: 'Lời cảnh tỉnh hâm hẩm' },
      { place: 'Istanbul', meaning: 'Giao điểm Đông – Tây' },
    ],
  },
  {
    slug: 'rome-vatican-hy-lap',
    title: 'Hy Lạp – Ý – Vatican',
    countries: ['Hy Lạp', 'Ý'],
    image: img(photo.vatican),
    durationDays: 11,
    theme: 'Hành trình truyền giáo & Toà Thánh',
    mode: 'Đoàn hội thánh riêng',
    leader: 'Linh mục/Mục sư đồng hành',
    price: { from: 84900000, currency: 'VND', unit: '/khách' },
    nextDepartures: ['2026-10-25'],
    summary:
      'Athens, Corinth theo bước chân Phao-lô, khép lại tại Rome và Toà Thánh Vatican.',
    stops: [
      { place: 'Athens', meaning: 'Bài giảng tại Areopagus' },
      { place: 'Corinth', meaning: 'Thư tín Cô-rinh-tô' },
      { place: 'Rome', meaning: 'Điểm đến truyền giáo' },
      { place: 'Vatican', meaning: 'Trung tâm Công giáo' },
    ],
  },
];

export const holyLandCategories = [
  'Khởi hành từ Việt Nam',
  'Ghép đoàn tại điểm đến',
  'Đoàn hội thánh riêng',
  'Đoàn mục sư & lãnh đạo',
  'Hành trình theo chủ đề',
];
