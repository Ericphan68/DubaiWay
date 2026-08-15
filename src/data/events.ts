import type { EventType } from '@/types';
import { img, photo } from './images';

export const eventTypes: EventType[] = [
  { slug: 'corporate-events', title: 'Corporate Events', image: img(photo.conference), summary: 'Hội nghị khách hàng, kỷ niệm thành lập, sự kiện nội bộ doanh nghiệp.', scope: ['Dubai', 'Việt Nam', 'Thái Lan'] },
  { slug: 'mice', title: 'Conferences & MICE', image: img(photo.event), summary: 'Hội nghị, hội thảo, khen thưởng và sự kiện quy mô lớn trọn gói.', scope: ['Dubai', 'Singapore', 'Châu Âu'] },
  { slug: 'gala-dinner', title: 'Gala Dinner & Award', image: img(photo.gala), summary: 'Đêm gala, lễ trao giải với sân khấu, AV và ẩm thực cao cấp.', scope: ['Dubai', 'Việt Nam'] },
  { slug: 'church-events', title: 'Church Conferences', image: img(photo.holyland), summary: 'Hội đồng, thông công và sự kiện hội thánh trong và ngoài nước.', scope: ['Việt Nam', 'Israel', 'Hàn Quốc'] },
  { slug: 'product-launch', title: 'Product Launch', image: img(photo.concert), summary: 'Ra mắt sản phẩm ấn tượng với dàn dựng sân khấu và truyền thông.', scope: ['Dubai', 'Việt Nam', 'Thái Lan'] },
  { slug: 'destination-wedding', title: 'Destination Wedding', image: img(photo.wedding), summary: 'Đám cưới điểm đến sang trọng, lo trọn nghi lễ và lưu trú cho khách mời.', scope: ['Dubai', 'Phú Quốc', 'Bali'] },
  { slug: 'team-building', title: 'Team Building', image: img(photo.team), summary: 'Gắn kết đội ngũ qua các chương trình trong nước và quốc tế.', scope: ['Việt Nam', 'Thái Lan', 'Malaysia'] },
  { slug: 'concert-stage', title: 'Concert & Stage Support', image: img(photo.concert, 1000), summary: 'Hỗ trợ sân khấu, âm thanh ánh sáng và vận hành cho show quy mô.', scope: ['Dubai', 'Việt Nam'] },
];

/** Dịch vụ trong một sự kiện — dùng cho trang Events. */
export const eventServices = [
  'Ý tưởng & concept', 'Lập kế hoạch', 'Tìm địa điểm', 'Khách sạn', 'Vé máy bay',
  'Visa đoàn', 'Đưa đón', 'Sân khấu', 'Âm thanh', 'Ánh sáng', 'Màn hình LED',
  'Trang trí', 'Tiệc & catering', 'MC & phiên dịch', 'Nhân sự', 'Quay phim & chụp ảnh',
  'Livestream', 'Quà tặng', 'Check-in & đăng ký khách', 'Tour trước/sau sự kiện',
];

export interface EventCountry {
  slug: string;
  name: string;
  cities: string[];
  image: string;
  intro: string;
  venueTypes: string[];
  caseStudies: { title: string; detail: string; scale: string }[];
}

export const eventCountries: EventCountry[] = [
  {
    slug: 'dubai',
    name: 'Events in Dubai',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    image: img(photo.dubaiSkyline),
    intro: 'Điểm đến sự kiện đẳng cấp của Trung Đông — hạ tầng hiện đại, khách sạn 5 sao và địa điểm biểu tượng.',
    venueTypes: ['Khách sạn 5 sao', 'Trung tâm hội nghị', 'Du thuyền', 'Sa mạc', 'Rooftop', 'Bãi biển'],
    caseStudies: [
      { title: 'Gala kỷ niệm 15 năm doanh nghiệp', detail: 'Trọn gói sân khấu, AV, tiệc và đưa đón cho đoàn từ Việt Nam sang Dubai.', scale: '120 khách · 4 ngày' },
      { title: 'Hội nghị khách hàng khu vực', detail: 'Địa điểm, phiên dịch, hậu cần và tour bên lề sự kiện.', scale: '250 khách · 3 ngày' },
    ],
  },
  {
    slug: 'vietnam',
    name: 'Events in Vietnam',
    cities: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Phú Quốc'],
    image: img(photo.vietnam),
    intro: 'Tổ chức chuyên nghiệp trong nước — từ resort ven biển đến trung tâm hội nghị lớn tại các thành phố.',
    venueTypes: ['Resort ven biển', 'Trung tâm hội nghị', 'Khách sạn', 'Nhà hàng tiệc', 'Ngoài trời'],
    caseStudies: [
      { title: 'Hội nghị hội thánh toàn quốc', detail: 'Sân khấu, âm thanh ánh sáng, đăng ký khách mời và livestream.', scale: '800 khách · 2 ngày' },
      { title: 'Team building doanh nghiệp Phú Quốc', detail: 'Chương trình gắn kết, gala tối và lưu trú resort.', scale: '180 khách · 3 ngày' },
    ],
  },
  {
    slug: 'thailand',
    name: 'Events in Thailand',
    cities: ['Bangkok', 'Pattaya', 'Phuket'],
    image: img(photo.thailand),
    intro: 'Lựa chọn phổ biến cho MICE và team building — chi phí hợp lý, dịch vụ đa dạng, di chuyển thuận tiện.',
    venueTypes: ['Khách sạn', 'Trung tâm hội nghị', 'Bãi biển', 'Nhà hàng', 'Ngoài trời'],
    caseStudies: [
      { title: 'Roadshow ra mắt sản phẩm Bangkok', detail: 'Dàn dựng sân khấu, mời khách và truyền thông tại chỗ.', scale: '300 khách · 1 ngày' },
      { title: 'Khen thưởng đại lý Phuket', detail: 'Gala dinner, hoạt động biển và lưu trú 4–5 sao.', scale: '150 khách · 4 ngày' },
    ],
  },
];

export function getEventCountry(slug: string): EventCountry | undefined {
  return eventCountries.find((c) => c.slug === slug);
}

/** Quy trình tổ chức sự kiện. */
export const eventProcess = [
  { step: 'Tiếp nhận & tư vấn', desc: 'Hiểu mục tiêu, quy mô, ngân sách và thông điệp sự kiện.' },
  { step: 'Đề xuất & báo giá', desc: 'Concept, địa điểm, timeline và bảng giá chi tiết.' },
  { step: 'Triển khai', desc: 'Điều phối địa điểm, AV, hậu cần, nhân sự và khách mời.' },
  { step: 'Vận hành & tổng kết', desc: 'Chạy sự kiện, xử lý phát sinh và báo cáo sau sự kiện.' },
];

export function getEventType(slug: string) {
  return eventTypes.find((e) => e.slug === slug);
}
