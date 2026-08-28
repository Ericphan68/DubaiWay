# Ba cửa vào: khách — đối tác — quản trị

DubaiWay tách ba nhóm người dùng ra ba đường vào riêng. Cùng một ứng dụng, cùng
một cơ sở dữ liệu, chỉ khác cửa.

## Dùng ngay hôm nay — một tên miền

Đây là chế độ **mặc định**, không phải cấu hình gì thêm.

| Ai | Link |
|---|---|
| Khách hàng | `https://www.shalom1379.com` |
| Đối tác | `https://www.shalom1379.com/khu-doi-tac` |
| Quản trị | `https://www.shalom1379.com/khu-quan-tri` |

Gõ thẳng `/merchant` hay `/admin` khi chưa đăng nhập thì bị đẩy về đúng cửa của
khu đó.

Tiền tố `khu-` là bắt buộc: `/doi-tac/<slug>` đã là trang hồ sơ đối tác công
khai cho khách xem, hai thứ khác hẳn nhau nên không được trùng đường dẫn.

## Nâng lên ba tên miền — khi nào rảnh

1. **Tạo hai subdomain** trên hPanel (*Domains → Subdomains*): `merchant` và
   `admin`, trỏ cùng thư mục với trang chính.
2. **Cấp SSL** cho cả hai (*SSL → Install*). Thiếu bước này trình duyệt sẽ chặn,
   vì trang chính chạy https còn subdomain thì không.
3. Đặt biến `NEXT_PUBLIC_AREA_HOSTS=on`.
4. Deploy lại.

Từ lúc đó ba link thành:

| Ai | Link |
|---|---|
| Khách hàng | `https://www.shalom1379.com` |
| Đối tác | `https://merchant.shalom1379.com` |
| Quản trị | `https://admin.shalom1379.com` |

Link cũ vẫn dùng được: `shalom1379.com/merchant/...` tự chuyển sang subdomain và
giữ nguyên đường dẫn, nên bookmark và link trong email không chết.

Hai biến `NEXT_PUBLIC_MERCHANT_HOST` và `NEXT_PUBLIC_ADMIN_HOST` chỉ cần khai khi
tên miền khu vực không cùng gốc với trang chính; bỏ trống thì hệ thống tự suy ra.

## Cách hoạt động

`src/middleware.ts` quyết định khu vực rồi gắn vào header `x-dw-area` cho layout
dựng đúng khung trang:

- **Chưa bật tách tên miền**: khu suy từ đường dẫn, không chuyển hướng đi đâu.
- **Đã bật**: khu suy từ header `Host`. Trên tên miền chính, `/merchant/*` và
  `/admin/*` bị đẩy sang subdomain tương ứng. Gõ nhầm khu thì đẩy sang khu đúng.
  Trang pháp lý và quên mật khẩu dùng chung cho cả ba khu.

Middleware **không** phải lớp bảo vệ quyền. Việc chặn quyền vẫn nằm ở layout của
từng khu (`src/app/merchant/layout.tsx`, `src/app/admin/layout.tsx`), kiểm tra
phiên đăng nhập và vai trò. Đổi middleware không mở được cửa hậu nào.

## Hai điều dễ hiểu nhầm

**Đường dẫn giữ nguyên tiền tố.** Ở chế độ ba tên miền, URL là
`merchant.shalom1379.com/merchant/dich-vu` chứ không phải
`merchant.shalom1379.com/dich-vu`. Bản đầu có rút gọn bằng cách viết lại đường
dẫn, nhưng bộ nhớ đệm điều hướng phía trình duyệt của Next.js không tôn trọng
lệnh viết lại khi chuyển trang mềm: máy chủ trả đúng trang đối tác mà trình
duyệt vẫn dựng trang khách. Đã tái hiện được nhiều lần. Hiện nhầm trang nguy
hiểm hơn nhiều so với một URL dài hơn, nên bỏ hẳn cách viết lại.

**Phiên đăng nhập không dùng chung giữa các tên miền.** Cookie phiên là
host-only, nên ở chế độ ba tên miền, đăng nhập trang khách không kéo theo quyền
vào khu quản trị. Đây là chủ ý.

## Thử ở máy

`npm run dev` rồi mở ba link:

- `http://localhost:3000`
- `http://localhost:3000/khu-doi-tac`
- `http://localhost:3000/khu-quan-tri`

Muốn thử chế độ ba tên miền thì đặt `NEXT_PUBLIC_AREA_HOSTS=on` trong
`.env.local` rồi mở `merchant.localhost:3000` và `admin.localhost:3000`. Chrome
tự trỏ mọi `*.localhost` về máy; Safari thì phải thêm dòng vào `/etc/hosts`.

## Tài khoản thử nghiệm

Mật khẩu chung `DubaiWay!2026`. Mỗi cửa chỉ bày tài khoản của khu mình.

| Cửa | Tài khoản |
|---|---|
| Khách | `linh@example.test` |
| Đối tác | `desertrose@example.test` |
| Quản trị | `admin@dubaiway.test`, `finance@dubaiway.test`, `reviewer@dubaiway.test` |
