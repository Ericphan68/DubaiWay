# 4. Luồng nghiệp vụ

## 4.1 Xét duyệt Merchant

```
draft ──▶ submitted ──▶ under_review ──┬─▶ approved ──▶ suspended
  ▲                          │         │                   │
  │                          ▼         └─▶ rejected ───────┘
  └──────── changes_requested
```

- Merchant chỉ sửa được hồ sơ ở `draft` và `changes_requested` (chặn bằng RLS).
- Chuyển trạng thái ghi vào `merchant_review_history` — bảng bất biến.
- Giấy tờ KYC/KYB nằm trong bucket **riêng tư**; chỉ chủ hồ sơ và người có quyền `merchant.review` đọc được, qua signed URL có hạn.
- **Chưa `approved` thì không dịch vụ nào công khai được**, kể cả khi dịch vụ đã `active` (hàm `canPublishService`).

## 4.2 Xét duyệt dịch vụ

```
draft ─▶ submitted ─▶ under_review ─┬─▶ approved ─▶ active ⇄ inactive
  ▲                       │         │                 │        │
  └── changes_requested ◀─┘         │                 └─▶ suspended
                                    └─ (sửa lớn → submitted lại)
```

Dịch vụ đang `active` mà sửa nội dung quan trọng phải nộp duyệt lại.

## 4.3 Đặt dịch vụ

```
Khách chọn dịch vụ
   ▼
Chọn gói · ngày · giờ · số khách
   ▼
Kiểm tra tồn kho ─── hold_inventory() khoá dòng ──✗─▶ "Không đủ chỗ"
   ▼ ✓
Hiển thị giá chi tiết  (createQuote — nơi DUY NHẤT tính tiền)
   ▼
Nhập thông tin người sử dụng
   ▼
Nhập mã khuyến mãi (xác thực phía server, không tin số từ client)
   ▼
Thanh toán  (idempotency_key chống trùng)
   ▼
Tạo booking + ảnh chụp tài chính đầy đủ
   ▼
Phát voucher + QR
   ▼
Email xác nhận
   ▼
Merchant quét mã → redeem_voucher()  ← chỉ thành công MỘT lần
   ▼
Booking → completed
   ▼
Mời khách đánh giá  ← chỉ booking completed mới viết được
```

## 4.4 Tiền chảy đi đâu — ví dụ đơn 1.000 USD

```
Khách trả                                    1.000,00 USD
  ├─▶ Merchant                                 900,00 USD   (90%)
  └─▶ Hoa hồng DubaiWay                        100,00 USD   (10%)
        ├─▶ Người giới thiệu                    30,00 USD   (30% CỦA HOA HỒNG)
        └─▶ DubaiWay thực giữ                   70,00 USD
```

**Công thức:** `thưởng = giá trị đơn hợp lệ × 10% × 30%`
30% tính trên **hoa hồng**, không phải trên giá trị đơn hàng. 30% của đơn hàng sẽ là 300 USD — sai gấp mười lần.

> **Mức hoa hồng không công khai.** Con số 10% ở trên chỉ dùng để minh hoạ cách
> dòng tiền chảy trong tài liệu nội bộ. Trên các trang ai cũng xem được, DubaiWay
> chỉ nói "chỉ nhận hoa hồng khi bán được"; đối tác biết mức áp dụng cho mình sau
> khi đăng ký và vào Khu đối tác, hoặc hỏi nhân viên. Test
> `src/app/__tests__/commission-privacy.test.ts` canh ràng buộc này.

## 4.5 Vòng đời thưởng giới thiệu

```
pending ──▶ held ──▶ available ──▶ withdrawal_requested ──▶ paid
   │          │          │                                    │
   └──────────┴──────────┴──▶ cancelled / reversed / fraud_review ◀┘
```

Chỉ chuyển sang `available` khi **đủ tất cả**: đã thanh toán · dịch vụ đã hoàn thành · hết thời hạn khiếu nại · không hoàn tiền · không có dấu hiệu gian lận.

## 4.6 Chống tự giới thiệu

| Tín hiệu | Xử lý |
|---|---|
| Cùng một tài khoản | **Từ chối thẳng** — bằng chứng chắc chắn |
| Trùng email | Chuyển Admin xem xét |
| Trùng số điện thoại | Chuyển Admin xem xét |
| Trùng thiết bị *(một mình)* | Vẫn chấp nhận — gia đình dùng chung máy là bình thường |
| Trùng IP *(một mình)* | Vẫn chấp nhận |
| Từ 2 tín hiệu trở lên | Chuyển Admin xem xét |

Không bao giờ tự động kết luận gian lận từ một tín hiệu đơn lẻ.

## 4.7 Huỷ và hoàn tiền

```
Khách yêu cầu huỷ
   ▼
Tra bậc hoàn tiền theo số giờ còn lại đến giờ dịch vụ
   ▼
computeRefundAdjustment() → các giá trị ÂM
   ▼
Ghi bút toán ĐẢO vào sổ cái (không sửa bản ghi gốc)
   ├─ thu hồi hoa hồng
   ├─ thu hồi doanh thu merchant
   └─ thu hồi thưởng giới thiệu
   ▼
Gọi cổng thanh toán hoàn tiền (idempotency_key)
   ▼
Cập nhật số dư rút được của merchant và của người giới thiệu
```

Hoàn một phần được chia theo tỷ lệ; hoàn toàn bộ thu hồi đúng bằng số đã ghi nhận để không lệch do làm tròn.
