import type { VisaCountry } from '@/types';

export const visaCountries: VisaCountry[] = [
  { slug: 'uae', country: 'UAE (Dubai)', flag: '🇦🇪', region: 'Trung Đông', visaTypes: ['Du lịch 30/60 ngày'], processingTime: '3–5 ngày làm việc', stayDuration: '30–60 ngày', popular: true, summary: 'Visa du lịch UAE cấp điện tử, phù hợp khách đi Dubai tự túc hoặc theo tour.' },
  { slug: 'schengen', country: 'Schengen (Châu Âu)', flag: '🇪🇺', region: 'Châu Âu', visaTypes: ['Du lịch', 'Công tác'], processingTime: '15–20 ngày làm việc', stayDuration: 'Tối đa 90/180 ngày', popular: true, summary: 'Một visa cho 27 quốc gia khối Schengen. Hồ sơ tài chính và lịch trình cần chuẩn bị kỹ.' },
  { slug: 'my', country: 'Hoa Kỳ', flag: '🇺🇸', region: 'Bắc Mỹ', visaTypes: ['B1/B2'], processingTime: 'Theo lịch phỏng vấn', stayDuration: 'Theo dấu nhập cảnh', popular: true, summary: 'Visa B1/B2 yêu cầu phỏng vấn tại Lãnh sự quán. DubaiWay hỗ trợ hồ sơ và luyện phỏng vấn.' },
  { slug: 'anh', country: 'Vương quốc Anh', flag: '🇬🇧', region: 'Châu Âu', visaTypes: ['Standard Visitor'], processingTime: '15 ngày làm việc', stayDuration: 'Tối đa 6 tháng', popular: false, summary: 'Visa thăm quan Anh, nộp hồ sơ trực tuyến và lấy sinh trắc học tại trung tâm tiếp nhận.' },
  { slug: 'canada', country: 'Canada', flag: '🇨🇦', region: 'Bắc Mỹ', visaTypes: ['Visitor Visa'], processingTime: '4–8 tuần', stayDuration: 'Tối đa 6 tháng', popular: false, summary: 'Visa du lịch Canada đa số nhập cảnh nhiều lần, xét duyệt dựa trên hồ sơ tổng thể.' },
  { slug: 'uc', country: 'Úc', flag: '🇦🇺', region: 'Châu Đại Dương', visaTypes: ['Visitor 600'], processingTime: '2–4 tuần', stayDuration: '3–12 tháng', popular: false, summary: 'Visa Visitor 600 nộp trực tuyến, phù hợp du lịch và thăm thân.' },
  { slug: 'nhat-ban', country: 'Nhật Bản', flag: '🇯🇵', region: 'Châu Á', visaTypes: ['Du lịch'], processingTime: '5–7 ngày làm việc', stayDuration: '15–30 ngày', popular: true, summary: 'Visa du lịch Nhật Bản nộp qua đại lý uỷ quyền, tỷ lệ đậu cao khi hồ sơ đầy đủ.' },
  { slug: 'han-quoc', country: 'Hàn Quốc', flag: '🇰🇷', region: 'Châu Á', visaTypes: ['Du lịch C-3'], processingTime: '7–10 ngày làm việc', stayDuration: '30–90 ngày', popular: true, summary: 'Visa C-3 du lịch Hàn Quốc; một số tỉnh có ưu tiên xét duyệt.' },
  { slug: 'trung-quoc', country: 'Trung Quốc', flag: '🇨🇳', region: 'Châu Á', visaTypes: ['Du lịch L'], processingTime: '4–7 ngày làm việc', stayDuration: '30 ngày', popular: false, summary: 'Visa du lịch loại L, lấy sinh trắc học tại trung tâm thị thực.' },
  { slug: 'tho-nhi-ky', country: 'Thổ Nhĩ Kỳ', flag: '🇹🇷', region: 'Trung Đông', visaTypes: ['e-Visa'], processingTime: '1–3 ngày làm việc', stayDuration: '30 ngày', popular: true, summary: 'e-Visa Thổ Nhĩ Kỳ cấp trực tuyến nhanh cho hộ chiếu Việt Nam đủ điều kiện.' },
  { slug: 'ai-cap', country: 'Ai Cập', flag: '🇪🇬', region: 'Châu Phi', visaTypes: ['e-Visa', 'Visa on arrival'], processingTime: '3–5 ngày làm việc', stayDuration: '30 ngày', popular: false, summary: 'Visa Ai Cập cấp điện tử hoặc tại cửa khẩu tuỳ diện; DubaiWay tư vấn theo hành trình.' },
  { slug: 'jordan', country: 'Jordan', flag: '🇯🇴', region: 'Trung Đông', visaTypes: ['Visa on arrival', 'Jordan Pass'], processingTime: 'Tại cửa khẩu', stayDuration: '30 ngày', popular: false, summary: 'Jordan Pass gộp visa và vé Petra, tối ưu cho khách đi tuyến Đất Thánh.' },
  { slug: 'israel', country: 'Israel', flag: '🇮🇱', region: 'Trung Đông', visaTypes: ['Miễn/e-Visa tuỳ diện'], processingTime: 'Theo quy định hiện hành', stayDuration: '90 ngày', popular: false, summary: 'Chính sách nhập cảnh Israel thay đổi theo thời điểm; DubaiWay cập nhật khi tư vấn đoàn.' },
  { slug: 'saudi-arabia', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Trung Đông', visaTypes: ['e-Visa', 'Umrah'], processingTime: '3–5 ngày làm việc', stayDuration: '30–90 ngày', popular: false, summary: 'e-Visa du lịch Saudi cấp trực tuyến; hỗ trợ cả hành trình chuyên đề.' },
  { slug: 'nam-phi', country: 'Nam Phi', flag: '🇿🇦', region: 'Châu Phi', visaTypes: ['Du lịch'], processingTime: '10–15 ngày làm việc', stayDuration: '30–90 ngày', popular: false, summary: 'Visa du lịch Nam Phi nộp tại trung tâm tiếp nhận, cần chứng minh tài chính và lịch trình.' },
  { slug: 'new-zealand', country: 'New Zealand', flag: '🇳🇿', region: 'Châu Đại Dương', visaTypes: ['Visitor Visa'], processingTime: '3–6 tuần', stayDuration: 'Tối đa 9 tháng', popular: false, summary: 'Visa thăm quan New Zealand nộp trực tuyến, có thể kết hợp hành trình Úc.' },
];

export const popularVisas = visaCountries.filter((v) => v.popular);

/** Cảnh báo pháp lý bắt buộc hiển thị ở mọi trang visa. */
export const VISA_DISCLAIMER =
  'DubaiWay cung cấp dịch vụ tư vấn và hỗ trợ hồ sơ. Quyết định cấp hoặc từ chối visa thuộc về cơ quan lãnh sự hoặc cơ quan di trú có thẩm quyền. DubaiWay không cam kết đậu visa.';

export const visaPurposes = ['Du lịch', 'Công tác', 'Thăm thân', 'Hành hương', 'Hội nghị/Sự kiện'];
