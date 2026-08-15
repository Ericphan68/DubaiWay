import type { Review } from '@/types';

export const reviews: Review[] = [
  {
    name: 'Chị Mai Hương',
    role: 'Khách đoàn gia đình',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    quote:
      'Tour Dubai của gia đình tôi được lo từ visa đến đón sân bay. Hướng dẫn viên tiếng Việt rất tận tâm, lịch trình không bị dồn ép.',
    product: 'Dubai – Abu Dhabi 6N5Đ',
  },
  {
    name: 'MS. Trần Quốc Việt',
    role: 'Trưởng đoàn hội thánh',
    location: 'Hà Nội',
    rating: 5,
    quote:
      'Đoàn 32 người đi Đất Thánh được sắp xếp chu đáo, có giờ tĩnh nguyện mỗi ngày. DubaiWay hiểu rõ nhu cầu của đoàn hành hương.',
    product: 'Israel – Jordan 9N8Đ',
  },
  {
    name: 'Anh David Nguyễn',
    role: 'Khách Việt tại Dubai',
    location: 'Dubai, UAE',
    rating: 5,
    quote:
      'Tôi hay đặt city tour và desert safari cho bạn bè sang chơi. Đặt online nhanh, xe đón đúng giờ, giá minh bạch.',
    product: 'Dubai City Tour riêng',
  },
  {
    name: 'Công ty TNHH Đại Phát',
    role: 'Khách doanh nghiệp',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    quote:
      'Gala kỷ niệm 15 năm tại Dubai cho 120 khách được DubaiWay Events lo trọn gói. Sân khấu, AV và hậu cần đều chuyên nghiệp.',
    product: 'Gala Dinner tại Dubai',
  },
  {
    name: 'Chị Thu Trang',
    role: 'Cặp đôi hưởng tuần trăng mật',
    location: 'Đà Nẵng',
    rating: 5,
    quote:
      'Santorini đúng như mơ. Khách sạn hướng biển, đội tư vấn phản hồi qua WhatsApp cực nhanh mỗi khi tôi hỏi.',
    product: 'Hy Lạp: Athens – Santorini',
  },
];

export const trustStats = [
  { value: '12.000+', label: 'Khách hàng đã đồng hành' },
  { value: '40+', label: 'Điểm đến trên toàn cầu' },
  { value: '350+', label: 'Đoàn hành hương & sự kiện' },
  { value: '4.9/5', label: 'Điểm hài lòng trung bình' },
];
