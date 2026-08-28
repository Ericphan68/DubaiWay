# Ba khu vực, ba tên miền

DubaiWay tách ba nhóm người dùng ra ba tên miền riêng. Cùng một ứng dụng, cùng
một cơ sở dữ liệu — chỉ khác cửa vào.

| Ai | Tên miền | Trang đăng nhập |
|---|---|---|
| Khách hàng | `shalom1379.com` | `/dang-nhap` (ngay trên trang chính) |
| Đối tác | `merchant.shalom1379.com` | `/dang-nhap-doi-tac` |
| Quản trị | `admin.shalom1379.com` | `/dang-nhap-quan-tri` |

## Cần làm gì trên hPanel

1. **Tạo hai subdomain**: vào *Domains → Subdomains*, thêm `merchant` và `admin`,
   trỏ cùng thư mục với trang chính.
2. **Chứng chỉ SSL**: cấp SSL cho cả hai subdomain (*SSL → Install*). Thiếu bước
   này thì trình duyệt chặn, vì trang chính chạy https còn subdomain thì không.
3. **Biến môi trường**: đặt `NEXT_PUBLIC_SITE_URL=https://www.shalom1379.com`.
   Hai biến `NEXT_PUBLIC_MERCHANT_HOST` và `NEXT_PUBLIC_ADMIN_HOST` để trống —
   hệ thống tự suy ra `merchant.shalom1379.com` và `admin.shalom1379.com`.
   Chỉ khai báo khi tên miền khu vực không cùng gốc với trang chính.
4. **Deploy lại** rồi mở thử cả ba tên miền.

## Cách hoạt động

`src/middleware.ts` đọc header `Host` rồi quyết định phục vụ khu nào:

- Trên tên miền chính, `/merchant/*` và `/admin/*` bị đẩy sang đúng subdomain,
  giữ nguyên đường dẫn. Link cũ trong email hay bookmark vẫn dùng được.
- Trên tên miền khu vực, đường dẫn của khách bị đưa về cửa của khu.
- Gõ nhầm sang khu kia thì bị đẩy sang tên miền của khu đó.
- Trang pháp lý và quên mật khẩu dùng chung cho cả ba khu.

Middleware **không** phải lớp bảo vệ quyền. Việc chặn quyền vẫn nằm ở layout
của từng khu (`src/app/merchant/layout.tsx`, `src/app/admin/layout.tsx`), kiểm
tra phiên đăng nhập và vai trò. Đổi middleware không mở được cửa hậu nào.

## Hai điều dễ hiểu nhầm

**Đường dẫn vẫn giữ tiền tố.** URL là `merchant.shalom1379.com/merchant/dich-vu`
chứ không phải `merchant.shalom1379.com/dich-vu`. Bản đầu có rút gọn bằng cách
viết lại đường dẫn, nhưng bộ nhớ đệm điều hướng phía trình duyệt của Next.js
không tôn trọng lệnh viết lại khi chuyển trang mềm: máy chủ trả đúng trang đối
tác mà trình duyệt vẫn dựng trang khách. Đã tái hiện được nhiều lần. Hiện nhầm
trang nguy hiểm hơn nhiều so với một URL dài hơn, nên giữ nguyên tiền tố.

**Phiên đăng nhập không dùng chung giữa các tên miền.** Cookie phiên là
host-only, nên đăng nhập ở trang khách không kéo theo quyền vào khu quản trị,
và ngược lại. Đây là chủ ý: phiên quản trị không bao giờ theo người dùng ra
trang công khai.

## Thử ở máy

`npm run dev` trên `localhost:3000` giữ nguyên như cũ — cả ba khu chạy chung một
tên miền, không đổi hướng gì. Muốn thử đúng kiểu nhiều tên miền thì mở:

- `http://merchant.localhost:3000`
- `http://admin.localhost:3000`

Chrome tự trỏ mọi `*.localhost` về máy, không cần sửa file hosts. Safari thì
không, phải thêm dòng vào `/etc/hosts`.
