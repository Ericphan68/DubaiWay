import type { Review } from '@/types';

/**
 * ĐÃ GỠ TOÀN BỘ ĐÁNH GIÁ MẪU.
 *
 * Trước đây file này chứa 5 đánh giá với tên người, địa phương và nội dung cụ thể —
 * nhưng những người đó không có thật. Đăng đánh giá bịa trên website thương mại là
 * đánh lừa khách hàng và có rủi ro pháp lý.
 *
 * Đánh giá thật đến từ bảng `reviews` trong database, và chỉ khách có booking ở
 * trạng thái `completed` mới viết được (ràng buộc trong RLS policy).
 */
export const reviews: Review[] = [];

/**
 * Chỉ nêu những điều kiểm chứng được từ cách nền tảng vận hành.
 * Không dùng số lượng khách hay điểm hài lòng khi chưa có dữ liệu thật.
 */
export const trustStats = [
  { value: '10%', label: 'Hoa hồng nền tảng, công khai minh bạch' },
  { value: '100%', label: 'Đối tác được xác minh giấy tờ trước khi lên sàn' },
  { value: '1 lần', label: 'Voucher chỉ dùng được một lần, chống gian lận' },
  { value: 'AED', label: 'Niêm yết giá bằng tiền địa phương, không phí ẩn' },
];
