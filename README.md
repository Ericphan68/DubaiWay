# DubaiWay

Nền tảng du lịch & sự kiện quốc tế cao cấp — tra cứu vé máy bay, khách sạn, tour, visa và tổ chức sự kiện. Xây dựng bằng **Next.js (App Router) + TypeScript + Tailwind CSS**, sẵn sàng cho môi trường Node.js và deploy lên Hostinger.

> Giai đoạn hiện tại: **giao diện + trải nghiệm + luồng khách hàng** với dữ liệu demo. Chưa tích hợp API/thanh toán/CRM thật, nhưng kiến trúc đã chuẩn bị sẵn để mở rộng.

## Công nghệ

- Next.js 15 (App Router, RSC) · React 19 · TypeScript (strict)
- Tailwind CSS 3.4 (design tokens tuỳ biến)
- `next/font` (Fraunces + Be Vietnam Pro — hỗ trợ tiếng Việt)
- `next/image` (tối ưu ảnh, hiện dùng ảnh demo từ Unsplash)

## Yêu cầu

- Node.js **>= 18.18** (khuyến nghị 20 hoặc 22 LTS)
- npm 9+

## Chạy ở máy local

```bash
npm install
cp .env.example .env.local   # điền số WhatsApp, Fanpage, link đối tác...
npm run dev                  # http://localhost:3000
```

Các lệnh khác:

```bash
npm run build        # build production
npm run start        # chạy bản production (next start)
npm run lint         # kiểm tra ESLint
npm run type-check   # kiểm tra kiểu TypeScript
```

## Biến môi trường

Xem `.env.example`. Tất cả biến hiển thị phía client dùng tiền tố `NEXT_PUBLIC_`.
Thông tin liên hệ, số WhatsApp, Fanpage và link đối tác được đọc trong `src/config/site.ts`
— **không hardcode trong component**. Không commit `.env.local` hay bất kỳ secret nào.

## Cấu trúc dự án

```
src/
  app/            Route (App Router) + layout gốc + globals.css
  components/
    layout/       Header, MegaMenu, Footer, MobileMenu, BottomNav, FloatingWhatsApp
    home/         20 section của trang chủ + SearchConsole
    cards/        TourCard, HotelCard, ExperienceCard, ArticleCard
    ui/           Button, Badge, ActionBadge, SectionHeader, Section, Stars, Logo, icons
  config/         site.ts (liên hệ/đối tác), nav.ts (menu)
  data/           Dữ liệu demo (tours, hotels, flights, visas, events, dubai, holyland, articles, reviews, services)
  lib/            utils (cn), format (giá/ngày), whatsapp (link + tin nhắn theo trang)
  types/          Kiểu dữ liệu dùng chung
```

### Nguyên tắc kiến trúc

- **3 loại hành động** cho mọi sản phẩm (`ActionBadge`): *Đặt với DubaiWay* · *Yêu cầu báo giá* · *Chuyển đối tác*.
- **Route Line** — motif đường champagne (đường bay/lịch trình) xuất hiện xuyên suốt như nhận diện.
- Mọi giá là **giá tham khảo**, có thể thay đổi (ghi rõ trên UI).

## Deploy lên Hostinger (Node.js Web App)

1. Push toàn bộ source lên GitHub (không kèm `.env`).
2. Trong hPanel: **Websites → Node.js App**, kết nối repository GitHub.
3. Cấu hình:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start`
   - **Application port:** dùng cổng do Hostinger cấp qua biến `PORT` (Next.js tự đọc; nếu cần: `next start -p $PORT`).
   - **Node version:** 20 hoặc 22.
4. Thêm các biến môi trường từ `.env.example` trong phần **Environment Variables** của hPanel.
5. Deploy. Mỗi lần push lên nhánh chính có thể cấu hình auto-deploy.

> Dự án chạy ở chế độ **SSR/Node** (`next start`), không phải static export — cần Node runtime trên Hostinger.

## Lộ trình (phase tiếp theo)

- **Phase 2:** Trang Tour (list, từ Việt Nam, tại điểm đến, chi tiết tour)
- **Phase 3:** Holy Land, Dubai Experiences, Signature
- **Phase 4:** Vé máy bay, Khách sạn, Visa
- **Phase 5:** Events + theo quốc gia + form báo giá
- **Phase 6:** Cẩm nang, Liên hệ, Tài khoản mẫu, trang pháp lý, 404

---

© 2026 DubaiWay. Giá hiển thị là giá tham khảo, có thể thay đổi.
