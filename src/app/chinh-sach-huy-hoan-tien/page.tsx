import type { Metadata } from 'next';
import { PolicyPage, PolicySection } from '@/components/shared/PolicyPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Chính sách huỷ và hoàn tiền',
  description: 'Điều kiện huỷ, mức hoàn tiền và thời gian xử lý hoàn tiền trên DubaiWay.',
  alternates: { canonical: `${siteConfig.url}/chinh-sach-huy-hoan-tien` },
};

export default function CancellationPage() {
  return (
    <PolicyPage title="Chính sách huỷ và hoàn tiền" updatedAt="28/08/2026"
      intro="Mỗi dịch vụ có chính sách huỷ riêng do đối tác đặt ra. Chính sách cụ thể luôn hiển thị trên trang dịch vụ TRƯỚC khi bạn đặt.">
      <PolicySection title="1. Chính sách theo từng dịch vụ">
        <p>
          Chúng tôi không áp một chính sách chung cho mọi dịch vụ, vì điều kiện thực tế rất khác nhau:
          một chuyến safari sa mạc có thể huỷ trước 24 giờ, còn vé Burj Khalifa đã xuất thì không đổi được.
        </p>
        <p>
          Trước khi thanh toán, phần “Chính sách huỷ” trên trang dịch vụ ghi rõ mốc thời gian và mức hoàn tương ứng.
        </p>
      </PolicySection>

      <PolicySection title="2. Cách tính mức hoàn tiền">
        <p>Mức hoàn phụ thuộc thời điểm bạn huỷ so với giờ bắt đầu dịch vụ. Ví dụ một chính sách phổ biến:</p>
        <div className="overflow-x-auto rounded-2xl border border-mist">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-ivory-200 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Thời điểm huỷ</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Mức hoàn</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Đơn 315 USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist bg-ivory-100">
              <tr><td className="px-4 py-3">Trước 24 giờ trở lên</td><td className="px-4 py-3">100%</td><td className="px-4 py-3">315,00 USD</td></tr>
              <tr><td className="px-4 py-3">Từ 4 đến dưới 24 giờ</td><td className="px-4 py-3">50%</td><td className="px-4 py-3">157,50 USD</td></tr>
              <tr><td className="px-4 py-3">Dưới 4 giờ hoặc không đến</td><td className="px-4 py-3">0%</td><td className="px-4 py-3">0,00 USD</td></tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection title="3. Thời tiết xấu và bất khả kháng">
        <p>
          Nếu đối tác huỷ dịch vụ vì thời tiết, lý do an toàn hoặc sự kiện bất khả kháng, bạn được
          <strong className="text-midnight"> hoàn 100%</strong> hoặc đổi sang ngày khác, tuỳ bạn chọn —
          không phụ thuộc mốc thời gian ở trên.
        </p>
      </PolicySection>

      <PolicySection title="4. Cách yêu cầu huỷ">
        <p>
          Vào <strong className="text-midnight">Tài khoản → Đơn hàng</strong>, chọn đơn cần huỷ và làm theo hướng dẫn.
          Hoặc liên hệ hỗ trợ với mã đơn hàng của bạn.
        </p>
      </PolicySection>

      <PolicySection title="5. Thời gian nhận lại tiền">
        <p>
          Sau khi yêu cầu được duyệt, chúng tôi gửi lệnh hoàn về cổng thanh toán trong vòng 1–2 ngày làm việc.
          Thời gian tiền về tài khoản của bạn phụ thuộc ngân hàng phát hành thẻ, thường 5–10 ngày làm việc.
        </p>
        <p>Tiền được hoàn về đúng phương thức bạn đã dùng để thanh toán. Chúng tôi không hoàn bằng phương thức khác.</p>
      </PolicySection>

      <PolicySection title="6. Khi dịch vụ không đúng mô tả">
        <p>
          Nếu trải nghiệm thực tế khác đáng kể so với mô tả, bạn có thể mở khiếu nại trong thời hạn ghi
          trên trang dịch vụ (thường 72 giờ sau khi sử dụng). Trong thời gian này, tiền của đối tác chưa
          được giải ngân. Bộ phận xử lý khiếu nại sẽ làm việc với cả hai bên trước khi quyết định.
        </p>
      </PolicySection>

      <PolicySection title="7. Liên hệ">
        <p>
          <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">{siteConfig.contact.email}</a>
          {' · '}
          <a href={`tel:${siteConfig.contact.hotline}`} className="text-royal underline underline-offset-2">{siteConfig.contact.hotline}</a>
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
