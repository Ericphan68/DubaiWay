import type { DubaiExperience, DubaiDetail } from '@/types';
import { dubaiExperiences } from './dubai';
import { img, photo, type PhotoKey } from './images';

const galleryPool: PhotoKey[] = ['dubaiSkyline', 'dubaiDesert', 'dubaiMarina', 'burjKhalifa', 'abuDhabi', 'yacht'];

function galleryFor(exp: DubaiExperience): string[] {
  // Bắt đầu bằng ảnh chính, bù thêm từ pool cho đủ.
  const extra = galleryPool.filter((k) => img(photo[k]) !== exp.image).slice(0, 3);
  return [exp.image, ...extra.map((k) => img(photo[k], 1200))];
}

const highlightsBySlug: Record<string, string[]> = {
  'burj-khalifa-124-125': ['Đài quan sát ngoài trời tầng 124', 'Tầng 125 với kính viễn vọng tương tác', 'Toàn cảnh vịnh Ba Tư', 'Vé điện tử vào cửa nhanh'],
  'desert-safari-premium': ['Lướt cồn cát bằng xe 4x4', 'Cưỡi lạc đà & xăm henna', 'Múa Tanoura và Belly dance', 'Tiệc BBQ buffet dưới sao'],
  'yacht-marina-3h': ['Thuê trọn du thuyền riêng', 'Dạo Marina & Palm Jumeirah', 'Đồ uống nhẹ trên khoang', 'Lý tưởng cho nhóm & sự kiện nhỏ'],
};

export function getDubaiDetail(exp: DubaiExperience): DubaiDetail {
  return {
    gallery: galleryFor(exp),
    highlights: highlightsBySlug[exp.slug] ?? [
      'Trải nghiệm biểu tượng của Dubai',
      'Hướng dẫn viên/điều phối chuyên nghiệp',
      'Linh hoạt khung giờ tham gia',
      'Phù hợp gia đình và nhóm bạn',
    ],
    includes: [
      'Vé vào cửa / phí trải nghiệm theo chương trình',
      exp.pickup.includes('đón') || exp.pickup.includes('khách sạn') ? 'Đưa đón theo mô tả' : 'Hướng dẫn nhận vé điện tử',
      'Điều phối viên hỗ trợ',
    ],
    excludes: ['Chi tiêu cá nhân', 'Đồ uống ngoài chương trình', 'Tiền tip (nếu có)'],
    faqs: [
      { question: 'Tôi đặt xong có xác nhận ngay không?', answer: 'Với sản phẩm giá cố định, bạn nhận xác nhận nhanh. Một số dịch vụ cần DubaiWay kiểm tra chỗ và báo lại.' },
      { question: 'Có hỗ trợ tiếng Việt không?', answer: 'Nhiều trải nghiệm có hướng dẫn tiếng Việt hoặc điều phối viên nói tiếng Việt theo yêu cầu.' },
    ],
  };
}

export function getDubaiBySlug(slug: string): DubaiExperience | undefined {
  return dubaiExperiences.find((e) => e.slug === slug);
}

export function relatedExperiences(exp: DubaiExperience, limit = 3): DubaiExperience[] {
  return dubaiExperiences.filter((e) => e.slug !== exp.slug).slice(0, limit);
}
