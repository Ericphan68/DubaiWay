import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Accordion } from '@/components/ui/Accordion';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Trung tâm trợ giúp',
  description: 'Câu hỏi thường gặp về đặt dịch vụ, voucher, huỷ và hoàn tiền trên DubaiWay.',
  alternates: { canonical: `${siteConfig.url}/tro-giup` },
};

const FAQ = [
  {
    q: 'Sau khi thanh toán tôi nhận được gì?',
    a: 'Bạn nhận ngay một voucher kèm mã QR trên màn hình và trong email. Voucher ghi rõ dịch vụ, gói, ngày giờ, số khách và điểm tập trung. Xuất trình mã QR cho đối tác khi sử dụng dịch vụ.',
  },
  {
    q: 'Voucher dùng được mấy lần?',
    a: 'Đúng một lần. Sau khi đối tác quét xác nhận, voucher chuyển sang trạng thái đã sử dụng và không quét lại được. Nếu bạn đặt cho nhiều ngày hoặc nhiều dịch vụ, mỗi phần có voucher riêng.',
  },
  {
    q: 'Tôi có cần in voucher ra không?',
    a: 'Không cần. Mở voucher trên điện thoại là đủ. Bạn cũng tìm lại được mọi voucher trong mục Tài khoản → Voucher.',
  },
  {
    q: 'Giá hiển thị đã gồm mọi thứ chưa?',
    a: 'Giá hiển thị là giá bạn trả cho DubaiWay. Thuế VAT (nếu có) được tách dòng riêng ở bước thanh toán để bạn thấy rõ. Không có phí ẩn phát sinh sau khi đặt. Những khoản không bao gồm — ví dụ đồ uống có cồn, tiền tip — được liệt kê ở mục "Không bao gồm" trên trang dịch vụ.',
  },
  {
    q: 'Tôi huỷ được không và được hoàn bao nhiêu?',
    a: 'Tuỳ chính sách của từng dịch vụ, luôn hiển thị trên trang dịch vụ trước khi bạn đặt. Nhiều dịch vụ cho huỷ miễn phí trước 24 giờ. Một số vé vào cửa đã xuất thì không hoàn. Xem chi tiết ở trang Chính sách huỷ và hoàn tiền.',
  },
  {
    q: 'Bao lâu thì tiền hoàn về tài khoản?',
    a: 'Chúng tôi gửi lệnh hoàn trong 1–2 ngày làm việc sau khi yêu cầu được duyệt. Thời gian tiền về phụ thuộc ngân hàng của bạn, thường 5–10 ngày làm việc. Tiền luôn hoàn về đúng phương thức bạn đã thanh toán.',
  },
  {
    q: 'Dịch vụ không đúng như mô tả thì sao?',
    a: 'Mở khiếu nại trong thời hạn ghi trên trang dịch vụ, thường là 72 giờ sau khi sử dụng. Trong thời gian đó, tiền của đối tác chưa được giải ngân. Bộ phận xử lý khiếu nại làm việc với cả hai bên trước khi quyết định.',
  },
  {
    q: 'Chương trình giới thiệu hoạt động thế nào?',
    a: 'Mỗi tài khoản có một mã giới thiệu. Khi người bạn giới thiệu hoàn tất giao dịch hợp lệ, bạn nhận 30% hoa hồng mà DubaiWay thực nhận — không phải 30% giá trị đơn hàng. Chương trình chỉ có một tầng.',
  },
  {
    q: 'DubaiWay có tự tổ chức tour không?',
    a: 'Không. DubaiWay là sàn kết nối. Dịch vụ do các đối tác bản địa vận hành, và mọi đối tác đều phải nộp giấy tờ pháp lý để thẩm định trước khi được bán trên nền tảng.',
  },
  {
    q: 'Tôi muốn bán dịch vụ trên DubaiWay',
    a: 'Xem trang Trở thành đối tác. Không có phí niêm yết hay phí duy trì — DubaiWay chỉ nhận hoa hồng khi bạn bán được. Mức hoa hồng cụ thể được nêu trong hợp đồng đối tác: sau khi đăng ký bạn xem trong Khu đối tác, hoặc hỏi nhân viên DubaiWay trước.',
  },
];

export default function HelpPage() {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Trợ giúp"
            title="Câu hỏi thường gặp"
            description="Không tìm thấy câu trả lời? Liên hệ đội hỗ trợ, chúng tôi phản hồi trong giờ làm việc."
          />
          <div className="mt-10">
            <Accordion items={FAQ.map((f) => ({ question: f.q, answer: f.a }))} />
          </div>

          <div className="mt-10 rounded-2xl border border-mist bg-ivory-100 p-6">
            <h2 className="font-display text-lg font-medium text-midnight">Vẫn cần hỗ trợ?</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Email{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">
                {siteConfig.contact.email}
              </a>
              {' · '}Hotline{' '}
              <a href={`tel:${siteConfig.contact.hotline}`} className="text-royal underline underline-offset-2">
                {siteConfig.contact.hotline}
              </a>
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              Xem thêm:{' '}
              <Link href="/chinh-sach-huy-hoan-tien" className="text-royal underline underline-offset-2">Chính sách huỷ và hoàn tiền</Link>
              {' · '}
              <Link href="/dieu-khoan-gioi-thieu" className="text-royal underline underline-offset-2">Điều khoản giới thiệu</Link>
              {' · '}
              <Link href="/lien-he" className="text-royal underline underline-offset-2">Liên hệ</Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
