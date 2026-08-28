import type { Metadata } from 'next';
import { PolicyPage, PolicySection } from '@/components/shared/PolicyPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Điều khoản đối tác',
  description: 'Điều kiện tham gia, hoa hồng, đối soát và trách nhiệm của đối tác bán dịch vụ trên DubaiWay.',
  alternates: { canonical: `${siteConfig.url}/dieu-khoan-doi-tac` },
};

export default function MerchantTermsPage() {
  return (
    <PolicyPage title="Điều khoản đối tác" updatedAt="28/08/2026"
      intro="Áp dụng cho mọi doanh nghiệp và cá nhân đăng bán dịch vụ trên DubaiWay.">
      <PolicySection title="1. Điều kiện tham gia">
        <p><strong className="text-midnight">Doanh nghiệp</strong> cần cung cấp: tên pháp lý, quốc gia đăng ký, số đăng ký kinh doanh, mã số thuế, giấy phép kinh doanh, giấy phép lữ hành nếu ngành nghề yêu cầu, thông tin người đại diện pháp luật và giấy tờ của người đó, tài khoản ngân hàng kèm IBAN/SWIFT.</p>
        <p><strong className="text-midnight">Cá nhân</strong> cần cung cấp: họ tên, ngày sinh, quốc tịch, địa chỉ, hộ chiếu hoặc Emirates ID, ảnh xác minh, giấy phép hành nghề nếu cần, thông tin thuế và tài khoản ngân hàng.</p>
        <p>Hồ sơ được thẩm định trước khi bất kỳ dịch vụ nào hiển thị công khai. DubaiWay có quyền yêu cầu bổ sung giấy tờ hoặc từ chối hồ sơ, có nêu lý do.</p>
      </PolicySection>

      <PolicySection title="2. Hoa hồng nền tảng">
        <p>DubaiWay nhận <strong className="text-midnight">10%</strong> giá trị đơn hàng hợp lệ, tính trên tiền hàng sau giảm giá và chưa gồm thuế thu hộ.</p>
        <div className="rounded-xl bg-ivory-200 p-4 font-mono text-sm">
          <p className="text-ink-muted">Đơn hàng 1.000 AED:</p>
          <p className="mt-2 text-midnight">Bạn nhận<span className="float-right">900,00 AED</span></p>
          <p className="text-midnight">Hoa hồng DubaiWay<span className="float-right">100,00 AED</span></p>
        </div>
        <p>Tỷ lệ áp dụng cho từng đơn được ghi lại tại thời điểm đặt. Thay đổi tỷ lệ về sau không làm thay đổi các đơn đã phát sinh.</p>
      </PolicySection>

      <PolicySection title="3. Đối soát và thanh toán">
        <p>Doanh thu chỉ được ghi nhận sau khi dịch vụ hoàn thành và hết thời hạn khiếu nại. Trong thời gian khiếu nại, khoản tiền tương ứng ở trạng thái chờ.</p>
        <p>Tiền được chuyển về tài khoản ngân hàng đã đăng ký theo kỳ đối soát. Mọi khoản hoàn tiền, điều chỉnh được ghi rõ trong bảng đối soát.</p>
      </PolicySection>

      <PolicySection title="4. Trách nhiệm của đối tác">
        <ul className="list-disc space-y-1 pl-5">
          <li>Mô tả dịch vụ trung thực: giá, thời lượng, những gì bao gồm và không bao gồm</li>
          <li>Không dùng ảnh của đơn vị khác hoặc ảnh không phản ánh dịch vụ thực tế</li>
          <li>Cập nhật lịch và tồn kho kịp thời, không nhận quá số chỗ có thể phục vụ</li>
          <li>Xác nhận voucher đúng thời điểm khách sử dụng dịch vụ</li>
          <li>Tuân thủ quy định pháp luật và yêu cầu về giấy phép tại địa phương</li>
          <li>Duy trì bảo hiểm trách nhiệm phù hợp với loại hình dịch vụ</li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Đánh giá của khách">
        <p>Đối tác được <strong className="text-midnight">phản hồi công khai</strong> mọi đánh giá, nhưng <strong className="text-midnight">không được sửa hoặc xoá</strong> đánh giá của khách.</p>
        <p>DubaiWay chỉ ẩn đánh giá khi vi phạm quy tắc nội dung (xúc phạm, thông tin cá nhân, nội dung không liên quan) và luôn ghi rõ lý do trong nhật ký hệ thống.</p>
      </PolicySection>

      <PolicySection title="6. Đình chỉ và chấm dứt">
        <p>DubaiWay có thể đình chỉ tài khoản đối tác khi có dấu hiệu: mô tả sai sự thật, không phục vụ khách đã đặt, nhiều khiếu nại chưa xử lý, hoặc giấy tờ hết hiệu lực.</p>
        <p>Khi tài khoản bị đình chỉ, mọi dịch vụ ngừng hiển thị công khai ngay lập tức. Các đơn đã đặt vẫn phải được phục vụ hoặc hoàn tiền đầy đủ cho khách.</p>
      </PolicySection>

      <PolicySection title="7. Liên hệ">
        <p>
          Hỗ trợ đối tác:{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">{siteConfig.contact.email}</a>
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
