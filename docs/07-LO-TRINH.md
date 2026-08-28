# 7. Kế hoạch triển khai theo giai đoạn

Ước lượng là công sức của **một lập trình viên full-stack làm toàn thời gian**.

## Giai đoạn 0 — Nền móng ✅ **ĐÃ XONG**

- [x] Kiểu `Money` số nguyên, phép tính an toàn, làm tròn HALF_UP
- [x] Bộ máy hoa hồng 10% + thưởng giới thiệu 30% của hoa hồng
- [x] Bút toán đảo khi hoàn tiền (toàn phần và một phần)
- [x] Giới thiệu một tầng + quy tắc chống gian lận
- [x] Máy trạng thái merchant / dịch vụ / booking / voucher
- [x] Database schema: 65 bảng, 115 RLS policy, 15 hàm
- [x] Hàm chống chạy đồng thời: giữ chỗ, quét voucher
- [x] Sổ cái bất biến + trigger chặn sửa lịch sử tài chính
- [x] Dữ liệu mẫu Dubai
- [x] Lớp repository + adapter thanh toán (sandbox)
- [x] Nền tảng đa ngôn ngữ vi/en, sẵn chỗ cho ar + RTL
- [x] **180 kiểm thử tự động, tất cả đạt**

## Giai đoạn 1 — Xác thực & tài khoản ✅ **ĐÃ XONG**

- [x] Lớp AuthProvider: bản Supabase Auth + bản trong bộ nhớ để chạy không cần tài khoản
- [x] Đăng ký / đăng nhập / đăng xuất / quên mật khẩu
- [x] Mật khẩu băm scrypt có salt, không lưu thô
- [x] Cookie phiên httpOnly + sameSite, chặn XSS đánh cắp phiên
- [x] Sai email và sai mật khẩu trả cùng thông báo — không lộ email nào tồn tại
- [x] Chặn chuyển hướng ra tên miền lạ sau đăng nhập
- [x] Ma trận phân quyền + kiểm thử đối chiếu với database
- [x] Chặn truy cập ở máy chủ cho /tai-khoan, /merchant, /admin
- [x] **Đã gỡ trang đăng nhập giả**

*Chưa có: đăng nhập Google/Apple, xác minh email thật (cần Supabase project).*

## Giai đoạn 2 — Danh mục & tìm kiếm ✅ **ĐÃ XONG**

- [x] Trang danh mục + trang từng danh mục
- [x] Trang tất cả dịch vụ
- [x] Trang chi tiết dịch vụ đầy đủ 20 mục theo yêu cầu
- [x] Tìm kiếm với 13 bộ lọc, toàn bộ trạng thái nằm trong URL (chia sẻ link được)
- [x] Bốn trạng thái giao diện: loading, empty, error, success
- [x] Dữ liệu có cấu trúc JSON-LD cho Google

*Chưa có: trang hồ sơ Merchant công khai.*

## Giai đoạn 3 — Đặt dịch vụ & thanh toán ✅ **ĐÃ XONG (trừ Stripe)**

- [x] Chọn gói / ngày / số khách, giá tính bằng đúng hàm máy chủ dùng
- [x] Trang thanh toán tính lại giá ở máy chủ — không tin số từ trình duyệt
- [x] Tạo booking kèm ảnh chụp tài chính đầy đủ
- [x] Voucher + mã QR ký HMAC chống làm giả
- [x] Cổng thanh toán sandbox có idempotency
- [x] Email xác nhận cho khách và báo đơn mới cho đối tác
- [x] **Đã thay 8 form giả bằng luồng gửi thật qua WhatsApp/email**
- [x] **Đã sửa nút "Giữ chỗ" không còn hứa suông**

*Chưa có: adapter Stripe thật (chưa có khoá API để kiểm thử), mã khuyến mãi ở bước thanh toán.*

## Giai đoạn 4 — Merchant ✅ **ĐÃ XONG PHẦN CỐT LÕI**

- [x] Trang đăng ký đối tác (doanh nghiệp và cá nhân)
- [x] Dashboard: doanh thu gộp, thực nhận, hoa hồng, số đơn
- [x] Danh sách dịch vụ kèm trạng thái duyệt
- [x] Danh sách đơn hàng
- [x] **Quét voucher — chỉ thành công một lần, chặn quét trùng và quét nhầm đơn vị**
- [x] Chặn truy cập theo vai trò ở máy chủ

*Chưa có: tạo/sửa dịch vụ trên dashboard, quản lý lịch & tồn kho, tải giấy tờ lên storage.*

## Giai đoạn 5 — Admin ✅ **ĐÃ XONG PHẦN CỐT LÕI**

- [x] Tổng quan nền tảng: GMV, hoa hồng, thưởng giới thiệu, doanh thu ròng, kèm dòng kiểm tra sổ sách cân
- [x] Duyệt đối tác: chuyển trạng thái theo máy trạng thái, bắt buộc nêu lý do khi từ chối
- [x] Duyệt dịch vụ
- [x] Danh sách đơn hàng toàn nền tảng kèm phân bổ tiền từng đơn
- [x] Theo dõi giới thiệu và yêu cầu rút tiền
- [x] Lịch sử xét duyệt bất biến

*Chưa có: quản lý danh mục/khuyến mãi/banner/nội dung trên giao diện, quản lý nhân viên.*

## Giai đoạn 6 — Referral & ví ✅ **ĐÃ XONG**

- [x] Trang công khai giải thích chương trình, nói rõ 30% là của hoa hồng
- [x] Sinh mã và link giới thiệu riêng cho từng tài khoản
- [x] Ghi nhận quan hệ lúc đăng ký qua link `?ref=`
- [x] **Chặn tự giới thiệu và chặn gán người giới thiệu thứ hai**
- [x] Tính thưởng theo vòng đời pending → held → available → paid
- [x] Ví: rút được / đang chờ / đã rút / tổng tích luỹ
- [x] Yêu cầu rút tiền, chặn rút quá số dư và rút hai lần cùng khoản

## Giai đoạn 7 — Sau bán hàng ✅ **ĐÃ XONG PHẦN CỐT LÕI**

- [x] Bộ máy tính huỷ theo bậc và bút toán đảo khi hoàn tiền (có kiểm thử)
- [x] **Đánh giá chỉ mở cho booking đã hoàn thành**, mỗi đơn một đánh giá
- [x] Đối tác phản hồi được nhưng không sửa/xoá được đánh giá
- [x] Admin ẩn đánh giá vi phạm, bắt buộc nêu lý do
- [x] **Đã gỡ 5 đánh giá bịa và các số liệu tin cậy bịa**

*Chưa có: giao diện huỷ đơn cho khách, quy trình khiếu nại trên giao diện.*

## Giai đoạn 8 — Hoàn thiện 🔶 **XONG MỘT PHẦN**

- [x] robots.txt sinh tự động, chặn khu vực riêng tư
- [x] sitemap.xml sinh từ dữ liệu thật
- [x] Favicon (tab trình duyệt trước đây trống)
- [x] Ảnh OG khi chia sẻ link
- [x] Lớp thông báo có chống gửi trùng
- [x] Trang chính sách: bảo mật, cookie, huỷ/hoàn tiền, đối tác, giới thiệu
- [x] Trung tâm trợ giúp

*Chưa có: 2FA cho Admin/Merchant, rate limiting, phân tích, kiểm tra khả năng truy cập toàn diện.*

## Giai đoạn 9 — Tiếng Ả Rập & RTL  *(~1 tuần)*

Bản dịch `ar` · giao diện RTL · định dạng số/ngày theo `ar-AE` · kiểm tra toàn bộ giao diện ở chế độ RTL.

**Còn lại: khoảng 4–5 tuần** — chủ yếu là adapter Stripe thật, tạo/sửa dịch vụ trên dashboard đối tác,
quản lý lịch & tồn kho, giao diện huỷ đơn và khiếu nại, 2FA, rate limiting, và tiếng Ả Rập.

## Việc đã làm cho site đang chạy

1. ✅ 8 form đã nối vào WhatsApp/email thật, kèm link dự phòng khi trình duyệt chặn cửa sổ
2. ✅ Nút "Giữ chỗ" không còn hứa suông — chuyển sang WhatsApp kèm nội dung khách đã chọn
3. ✅ Gỡ 5 đánh giá bịa và các số liệu tin cậy bịa
4. ✅ Gỡ trang đăng nhập giả, thay bằng xác thực thật
5. ✅ Sửa 2 link 404 trong menu (`/dich-vu`, `/ve-dubaiway` giờ đã có trang)
6. ✅ Bỏ link đối tác `*.example.com` khỏi `.env.example`

### Vẫn cần bạn cung cấp

- Số hotline thật, số WhatsApp thật, email thật, link mạng xã hội thật, địa chỉ văn phòng thật
- Sửa `NEXT_PUBLIC_SITE_URL=https://www.shalom1379.com` trên hPanel rồi redeploy
