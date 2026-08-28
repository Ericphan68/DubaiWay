import type { Metadata } from 'next';
import { PolicyPage, PolicySection } from '@/components/shared/PolicyPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'DubaiWay thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn như thế nào.',
  alternates: { canonical: `${siteConfig.url}/chinh-sach-bao-mat` },
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Chính sách bảo mật" updatedAt="28/08/2026"
      intro="Chính sách này nói rõ DubaiWay thu thập dữ liệu gì, dùng vào việc gì, chia sẻ với ai và bạn có quyền gì.">
      <PolicySection title="1. Dữ liệu chúng tôi thu thập">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong className="text-midnight">Tài khoản:</strong> họ tên, email, số điện thoại, ngôn ngữ hiển thị.</li>
          <li><strong className="text-midnight">Đặt dịch vụ:</strong> thông tin người sử dụng dịch vụ, ngày giờ, số khách, ghi chú bạn nhập.</li>
          <li><strong className="text-midnight">Thanh toán:</strong> thương hiệu thẻ và 4 số cuối do cổng thanh toán cung cấp.</li>
          <li><strong className="text-midnight">Kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, thiết bị — dùng để bảo mật và chống gian lận.</li>
        </ul>
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <strong>Chúng tôi không bao giờ lưu số thẻ đầy đủ.</strong> Thông tin thẻ do cổng thanh toán
          thu trực tiếp và không đi qua máy chủ của DubaiWay.
        </p>
      </PolicySection>

      <PolicySection title="2. Dùng dữ liệu để làm gì">
        <ul className="list-disc space-y-1 pl-5">
          <li>Xử lý đơn hàng, phát voucher và hỗ trợ bạn khi cần</li>
          <li>Gửi email giao dịch: xác nhận đặt dịch vụ, nhắc lịch, thông báo huỷ hoặc hoàn tiền</li>
          <li>Phòng chống gian lận và lạm dụng chương trình giới thiệu</li>
          <li>Cải thiện chất lượng dịch vụ dựa trên số liệu tổng hợp, không nhận dạng cá nhân</li>
        </ul>
        <p>Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba.</p>
      </PolicySection>

      <PolicySection title="3. Chia sẻ với ai">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong className="text-midnight">Đối tác cung cấp dịch vụ:</strong> chỉ những thông tin cần để phục vụ bạn — tên người sử dụng, số khách, ngày giờ, ghi chú đón khách. Đối tác không nhận được thông tin thanh toán của bạn.</li>
          <li><strong className="text-midnight">Cổng thanh toán:</strong> để xử lý giao dịch.</li>
          <li><strong className="text-midnight">Cơ quan có thẩm quyền:</strong> khi có yêu cầu hợp pháp.</li>
        </ul>
      </PolicySection>

      <PolicySection title="4. Lưu trữ và bảo vệ">
        <p>
          Dữ liệu được lưu trên hạ tầng có mã hoá khi truyền và khi lưu trữ. Giấy tờ nhận dạng của đối tác
          nằm trong kho lưu trữ riêng tư, không có URL công khai, chỉ truy cập được bằng liên kết ký có thời hạn.
          Mọi truy cập vào dữ liệu nhạy cảm đều được ghi lại trong nhật ký hệ thống.
        </p>
      </PolicySection>

      <PolicySection title="5. Thời gian lưu">
        <p>
          Dữ liệu đơn hàng và tài chính được giữ theo yêu cầu kế toán và pháp lý. Dữ liệu tài khoản
          được giữ tới khi bạn yêu cầu xoá, trừ phần bắt buộc phải lưu theo luật.
        </p>
      </PolicySection>

      <PolicySection title="6. Quyền của bạn">
        <ul className="list-disc space-y-1 pl-5">
          <li>Yêu cầu bản sao dữ liệu cá nhân chúng tôi đang giữ</li>
          <li>Yêu cầu sửa thông tin sai</li>
          <li>Yêu cầu xoá tài khoản và dữ liệu liên quan</li>
          <li>Rút lại đồng ý nhận email tiếp thị bất cứ lúc nào</li>
        </ul>
        <p>
          Gửi yêu cầu tới{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">
            {siteConfig.contact.email}
          </a>. Chúng tôi phản hồi trong vòng 30 ngày.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
