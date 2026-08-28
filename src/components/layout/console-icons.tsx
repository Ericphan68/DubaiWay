import type { SVGProps } from 'react';

/**
 * Biểu tượng cho điều hướng khu nội bộ.
 *
 * Vẽ riêng thay vì dùng lại bộ icon của trang khách: ở đây cần nét đồng đều,
 * cỡ nhỏ, đọc rõ trên nền navy — khác hẳn yêu cầu của icon trang bán hàng.
 */

type P = SVGProps<SVGSVGElement>;

const base = (p: P) => ({
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true, ...p,
});

const I = {
  /** Bảng số liệu tổng quan. */
  dashboard: (p: P) => (
    <svg {...base(p)}><rect x="3" y="3" width="7.5" height="9" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="5" rx="1.5" /><rect x="3" y="15" width="7.5" height="6" rx="1.5" /><rect x="13.5" y="11" width="7.5" height="10" rx="1.5" /></svg>
  ),
  /** Duyệt hồ sơ: tệp có dấu tích. */
  approve: (p: P) => (
    <svg {...base(p)}><path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M13 3v5h5" /><path d="m9 14 2 2 4-4" /></svg>
  ),
  /** Dịch vụ đang bán. */
  service: (p: P) => (
    <svg {...base(p)}><path d="M4 9V7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V9a3 3 0 0 0 0 6v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V15a3 3 0 0 0 0-6Z" /></svg>
  ),
  /** Danh mục. */
  category: (p: P) => (
    <svg {...base(p)}><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></svg>
  ),
  /** Đơn hàng. */
  order: (p: P) => (
    <svg {...base(p)}><path d="M4 6h16l-1.2 12.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 6Z" /><path d="M9 6V4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5V6" /></svg>
  ),
  /** Khuyến mãi. */
  promo: (p: P) => (
    <svg {...base(p)}><path d="M3.5 10.5V5.5A2 2 0 0 1 5.5 3.5h5l9.5 9.5a2 2 0 0 1 0 2.8l-4.2 4.2a2 2 0 0 1-2.8 0L3.5 10.5Z" /><circle cx="8" cy="8" r="1.4" /></svg>
  ),
  /** Đánh giá. */
  review: (p: P) => (
    <svg {...base(p)}><path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8L12 3.6Z" /></svg>
  ),
  /** Khiếu nại. */
  dispute: (p: P) => (
    <svg {...base(p)}><path d="M12 3.5 21 19H3l9-15.5Z" /><path d="M12 10v4M12 16.6v.1" /></svg>
  ),
  /** Giới thiệu bạn bè. */
  referral: (p: P) => (
    <svg {...base(p)}><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M9.5 9.5 14.5 14.5" /></svg>
  ),
  /** Rút tiền / ví. */
  payout: (p: P) => (
    <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18" /><circle cx="17" cy="15" r="1.3" /></svg>
  ),
  /** Báo cáo. */
  report: (p: P) => (
    <svg {...base(p)}><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7.5" y="12" width="3" height="5" rx="1" /><rect x="13" y="8" width="3" height="9" rx="1" /></svg>
  ),
  /** Nội dung / bài viết. */
  content: (p: P) => (
    <svg {...base(p)}><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
  ),
  /** Nhân viên. */
  staff: (p: P) => (
    <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" /><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19.5a5.4 5.4 0 0 0-1.6-3.8" /></svg>
  ),
  /** Nhật ký thao tác. */
  log: (p: P) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.2l3.2 1.9" /></svg>
  ),
  /** Lịch & tồn kho. */
  calendar: (p: P) => (
    <svg {...base(p)}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
  ),
  /** Quét mã voucher. */
  scan: (p: P) => (
    <svg {...base(p)}><path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5" /><path d="M4 12h16" /></svg>
  ),
  /** Hồ sơ đối tác. */
  profile: (p: P) => (
    <svg {...base(p)}><path d="M4 20.5V7.5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v11" /><path d="M9 20.5v-4.2h6v4.2" /></svg>
  ),
} as const;

export type ConsoleIconName = keyof typeof I;

export function consoleIcon(name: ConsoleIconName) {
  return I[name];
}
