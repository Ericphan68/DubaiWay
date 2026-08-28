# 1. Báo cáo hiện trạng mã nguồn

*Rà soát trước khi viết dòng code đầu tiên.*

## Công nghệ đang dùng

| Thành phần | Phiên bản | Đánh giá |
|---|---|---|
| Next.js | 15.1.6 (App Router, RSC) | Giữ. Bản ổn định, hợp cho marketplace SSR + SEO. |
| React | 19.0.0 | Giữ. |
| TypeScript | 5.7.3, `strict: true` | Giữ. |
| Tailwind CSS | 3.4.17 + design token tuỳ biến | Giữ. Token hoá tốt, đổi màu một chỗ đổi toàn site. |
| Database | **không có** | Bổ sung PostgreSQL qua Supabase. |
| Auth | **không có** | Bổ sung Supabase Auth. |
| Thanh toán | **không có** | Bổ sung qua lớp adapter. |
| i18n | **không có** | Bổ sung. |
| Kiểm thử | **không có** | Bổ sung Vitest + PGlite. |

## Quy mô ban đầu

122 file TypeScript, 9.639 dòng: 26 route, 67 component (24 client component), 20 file dữ liệu tĩnh, 6 file tiện ích, 1 file định nghĩa kiểu.

## Những gì tận dụng được

- **Hệ design token** trong `tailwind.config.ts` — bảng màu champagne/navy/ivory nhất quán, đủ sang cho định vị cao cấp.
- **Bộ component UI** — `Button`, `Badge`, `SectionHeader`, `Accordion`, `Stars`, bộ icon SVG tự vẽ. Dùng lại nguyên vẹn.
- **Logic lọc và tìm kiếm** — `filterTours`, `filterHotels`, `search` đã hoạt động đúng, đồng bộ với URL query. Mô hình này được giữ khi chuyển sang truy vấn database.
- **Bố cục responsive và mobile** — Header, MegaMenu, MobileMenu, BottomNav đã kiểm chứng chạy tốt trên mobile.
- **Cấu trúc thư mục** — tách `config` / `data` / `lib` / `types` rõ ràng, mở rộng được.

## Những gì phải thay

| Vấn đề | Vì sao phải thay |
|---|---|
| `Price.from: number` cho tiền | Số thực làm sai lệch phép tính tiền. Thay bằng số nguyên đơn vị nhỏ nhất. |
| 8 form `preventDefault()` rồi báo "Đã gửi!" | Dữ liệu khách bị mất. Nối vào backend thật. |
| Nút "Giữ chỗ" hiện "Đã ghi nhận" | Không ghi ở đâu. Nối vào bảng `bookings`. |
| Ô tìm kiếm trang chủ bỏ mọi thứ khách gõ | `router.push(href)` không mang tham số. Thay bằng query string thật. |
| Trang vé máy bay không tìm kiếm | Submit chỉ cuộn màn hình, kết quả là dữ liệu cố định. |
| Link đối tác `*.example.com` | Tên miền mẫu, không tồn tại. |
| Trang đăng nhập giả có ô mật khẩu | Không có hệ thống tài khoản phía sau. Thay bằng Supabase Auth. |
| 5 đánh giá khách hàng bịa | Người không có thật trên site thương mại. Thay bằng đánh giá gắn với booking hoàn thành. |
| `/dich-vu`, `/ve-dubaiway` trong menu | Trả 404. |
| 39 ảnh Unsplash tải từ máy chủ ngoài | Phụ thuộc bên thứ ba, không phải sản phẩm thật. |

## Nguyên tắc giữ nguyên hiện trạng

Không xoá route, component hay dữ liệu nào của bản hiện tại. Marketplace được dựng **song song** trong `src/core`, `src/server`, `src/i18n`; các trang cũ tiếp tục chạy cho tới khi có bản thay thế đã kiểm chứng.
