import type { Article } from '@/types';
import { img, photo } from './images';

export const articles: Article[] = [
  {
    slug: 'kinh-nghiem-xin-visa-uae-2026',
    title: 'Kinh nghiệm xin visa UAE 2026: hồ sơ, thời gian và lưu ý',
    excerpt: 'Tất cả những gì cần chuẩn bị để xin visa Dubai suôn sẻ, từ ảnh thẻ đến chứng minh tài chính.',
    image: img(photo.visa),
    destination: 'Dubai',
    topic: 'Visa',
    readingMinutes: 7,
    publishedAt: '2026-07-18',
    author: 'Đội ngũ DubaiWay',
  },
  {
    slug: 'di-hanh-huong-dat-thanh-can-chuan-bi-gi',
    title: 'Đi hành hương Đất Thánh cần chuẩn bị gì?',
    excerpt: 'Cẩm nang cho đoàn hội thánh lần đầu đến Israel – Jordan: trang phục, sức khoẻ, tâm linh.',
    image: img(photo.jerusalem),
    destination: 'Israel',
    topic: 'Kinh nghiệm hành hương',
    readingMinutes: 9,
    publishedAt: '2026-07-02',
    author: 'MS. Nguyễn Thành Nhân',
  },
  {
    slug: 'san-ve-thuong-gia-gia-tot',
    title: '5 mẹo săn vé thương gia giá tốt cho chuyến bay dài',
    excerpt: 'Cách canh khung giờ, chọn hành trình nối chuyến và tận dụng chương trình đối tác.',
    image: img(photo.businessClass),
    destination: 'Toàn cầu',
    topic: 'Vé máy bay',
    readingMinutes: 6,
    publishedAt: '2026-06-25',
    author: 'Đội ngũ DubaiWay',
  },
  {
    slug: 'lich-trinh-dubai-4-ngay',
    title: 'Lịch trình Dubai 4 ngày trọn vẹn cho lần đầu',
    excerpt: 'Gợi ý chia ngày hợp lý giữa sa mạc, thành phố và các điểm biểu tượng.',
    image: img(photo.dubaiSkyline),
    destination: 'Dubai',
    topic: 'Tour',
    readingMinutes: 8,
    publishedAt: '2026-06-10',
    author: 'Đội ngũ DubaiWay',
  },
  {
    slug: 'to-chuc-su-kien-tai-dubai',
    title: 'Tổ chức sự kiện doanh nghiệp tại Dubai: từ A đến Z',
    excerpt: 'Chọn địa điểm, xin phép, hậu cần và những khác biệt văn hoá cần lưu ý.',
    image: img(photo.conference),
    destination: 'Dubai',
    topic: 'Events',
    readingMinutes: 10,
    publishedAt: '2026-05-28',
    author: 'DubaiWay Events',
  },
  {
    slug: 'chi-phi-du-lich-chau-au-mua-thu',
    title: 'Chi phí du lịch Châu Âu mùa thu: dự trù thế nào cho đủ',
    excerpt: 'Bảng dự trù chi tiết cho chuyến 8–10 ngày, từ lưu trú đến ăn uống và di chuyển.',
    image: img(photo.europe),
    destination: 'Châu Âu',
    topic: 'Chi phí',
    readingMinutes: 7,
    publishedAt: '2026-05-14',
    author: 'Đội ngũ DubaiWay',
  },
];

export const articleDestinations = ['Dubai', 'UAE', 'Việt Nam', 'Thái Lan', 'Israel', 'Jordan', 'Ai Cập', 'Thổ Nhĩ Kỳ', 'Hy Lạp', 'Ý', 'Châu Âu', 'Châu Á'];
export const articleTopics = ['Visa', 'Vé máy bay', 'Khách sạn', 'Tour', 'Events', 'Chi phí', 'Ẩm thực', 'Văn hoá', 'Kinh nghiệm đoàn', 'Kinh nghiệm hành hương', 'Luxury Travel', 'Business Travel'];
