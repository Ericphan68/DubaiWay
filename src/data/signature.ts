import { img, photo } from './images';

/** Các trụ cột dịch vụ DubaiWay Signature (luxury). */
export const signaturePillars = [
  {
    title: 'Vé thương gia & hạng nhất',
    desc: 'Chuyên viên săn giá khoang C và F từ nhiều hãng, ưu tiên lịch bay và chỗ ngồi bạn muốn.',
    image: img(photo.businessClass, 1000),
  },
  {
    title: 'Khách sạn & resort 5 sao',
    desc: 'Suite hướng biển, butler riêng và những khu nghỉ dưỡng được tuyển chọn khắp thế giới.',
    image: img(photo.luxuryHotel, 1000),
  },
  {
    title: 'Private Tour & Private Guide',
    desc: 'Hành trình riêng theo nhịp của bạn, hướng dẫn viên chuyên đề đồng hành từng điểm đến.',
    image: img(photo.dubaiFrame, 1000),
  },
  {
    title: 'Du thuyền & Chauffeur',
    desc: 'Du thuyền riêng, xe sang kèm tài xế và dịch vụ đưa đón đẳng cấp tận cửa.',
    image: img(photo.yacht, 1000),
  },
  {
    title: 'VIP Airport & Fast Track',
    desc: 'Meet & greet, phòng chờ hạng nhất và lối ưu tiên qua an ninh, hải quan.',
    image: img(photo.airplaneWindow, 1000),
  },
  {
    title: 'Visa Concierge',
    desc: 'Đội ngũ chuẩn bị hồ sơ tận nơi, theo sát tiến độ và tối ưu khả năng thành công.',
    image: img(photo.visa, 1000),
  },
];

/** Cách DubaiWay Signature làm việc — quy trình 4 bước. */
export const signatureProcess = [
  { step: 'Lắng nghe', desc: 'Trao đổi mong muốn, phong cách và ngân sách của bạn.' },
  { step: 'Thiết kế', desc: 'Chuyên viên dựng hành trình bespoke, đề xuất phương án.' },
  { step: 'Tinh chỉnh', desc: 'Điều chỉnh đến khi mọi chi tiết đúng ý bạn.' },
  { step: 'Đồng hành', desc: 'Hỗ trợ ưu tiên 24/7 suốt hành trình.' },
];
