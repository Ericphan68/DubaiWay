import type { VisaCountry, VisaDetail } from '@/types';
import { visaCountries } from './visas';

const baseDocuments = [
  'Hộ chiếu còn hạn tối thiểu 6 tháng',
  'Ảnh thẻ nền trắng theo quy cách',
  'Chứng minh tài chính (sao kê, sổ tiết kiệm)',
  'Chứng minh công việc (hợp đồng, đơn xin nghỉ phép)',
  'Lịch trình chuyến đi dự kiến',
  'Đặt vé máy bay & khách sạn dự kiến',
  'Bảo hiểm du lịch (nếu yêu cầu)',
];

const baseProcess = [
  'Tư vấn điều kiện & đánh giá hồ sơ ban đầu',
  'Chuẩn bị và hoàn thiện bộ hồ sơ',
  'Điền đơn và đặt lịch nộp / sinh trắc học (nếu có)',
  'Nộp hồ sơ tại cơ quan đại diện hoặc trực tuyến',
  'Theo dõi tiến độ và nhận kết quả',
];

const baseNotes = [
  'Hồ sơ càng minh bạch và đầy đủ, khả năng xét duyệt càng thuận lợi.',
  'Một số trường hợp có thể được yêu cầu bổ sung giấy tờ hoặc phỏng vấn.',
  'Thời gian xử lý có thể thay đổi theo mùa cao điểm và chính sách hiện hành.',
];

/** Bản viết tay cho vài quốc gia trọng điểm. */
const authored: Record<string, Partial<VisaDetail>> = {
  uae: {
    whoCanApply: 'Công dân Việt Nam và người cư trú hợp lệ muốn du lịch hoặc quá cảnh tại UAE.',
    entries: 'Nhập cảnh 1 lần hoặc nhiều lần tuỳ loại',
    notes: [
      'Visa UAE thường cấp điện tử, không cần dán tem trước.',
      'Hộ chiếu cần còn hạn tối thiểu 6 tháng tính từ ngày nhập cảnh.',
      ...baseNotes.slice(2),
    ],
  },
  schengen: {
    whoCanApply: 'Người xin nhập cảnh khối Schengen với mục đích du lịch, công tác hoặc thăm thân.',
    entries: 'Thường nhiều lần, theo quyết định của lãnh sự',
    notes: [
      'Nộp tại quốc gia là điểm đến chính hoặc nơi lưu trú lâu nhất.',
      'Chứng minh tài chính và lịch trình rõ ràng là yếu tố quan trọng.',
      ...baseNotes.slice(2),
    ],
  },
  my: {
    whoCanApply: 'Người xin visa B1/B2 đi Hoa Kỳ với mục đích công tác hoặc du lịch.',
    entries: 'Nhiều lần trong thời hạn visa',
    process: [
      'Điền đơn DS-160 và đóng phí',
      'Đặt lịch phỏng vấn tại Lãnh sự quán',
      'Chuẩn bị hồ sơ & luyện phỏng vấn cùng DubaiWay',
      'Tham dự phỏng vấn',
      'Nhận kết quả và hộ chiếu',
    ],
    notes: [
      'Kết quả phụ thuộc lớn vào buổi phỏng vấn trực tiếp.',
      'Hồ sơ chứng minh ràng buộc về nước giúp tăng thuận lợi.',
      ...baseNotes.slice(2),
    ],
  },
};

export function getVisaDetail(visa: VisaCountry): VisaDetail {
  const a = authored[visa.slug] ?? {};
  return {
    whoCanApply:
      a.whoCanApply ??
      `Công dân Việt Nam và người cư trú hợp lệ muốn đến ${visa.country} với mục đích du lịch, công tác, thăm thân hoặc hành hương.`,
    eligibility: a.eligibility ?? [
      'Hộ chiếu còn hiệu lực theo quy định',
      'Mục đích chuyến đi rõ ràng, chính đáng',
      'Có khả năng tài chính cho chuyến đi',
      'Có ràng buộc để quay về sau chuyến đi',
    ],
    validity: a.validity ?? visa.stayDuration,
    entries: a.entries ?? 'Theo loại visa được cấp',
    documents: a.documents ?? baseDocuments,
    process: a.process ?? baseProcess,
    notes: a.notes ?? baseNotes,
    faqs: a.faqs ?? [
      { question: `Xin visa ${visa.country} mất bao lâu?`, answer: `Thời gian xử lý dự kiến: ${visa.processingTime}. Nên nộp sớm trước ngày đi để chủ động.` },
      { question: 'DubaiWay có cam kết đậu visa không?', answer: 'Không. DubaiWay tư vấn và hỗ trợ hồ sơ để tối ưu khả năng thành công; quyết định cấp visa thuộc về cơ quan có thẩm quyền.' },
      { question: 'Tôi từng bị từ chối visa thì sao?', answer: 'Bạn vẫn có thể nộp lại. DubaiWay sẽ rà soát nguyên nhân và tư vấn cách củng cố hồ sơ.' },
    ],
  };
}

export function getVisaBySlug(slug: string): VisaCountry | undefined {
  return visaCountries.find((v) => v.slug === slug);
}
