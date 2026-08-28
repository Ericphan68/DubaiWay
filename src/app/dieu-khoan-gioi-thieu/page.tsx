import type { Metadata } from 'next';
import { PolicyPage, PolicySection } from '@/components/shared/PolicyPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Điều khoản chương trình giới thiệu',
  description: 'Cách tính thưởng giới thiệu trên DubaiWay: 30% hoa hồng nền tảng thực nhận, chương trình một tầng.',
  alternates: { canonical: `${siteConfig.url}/dieu-khoan-gioi-thieu` },
};

export default function ReferralTermsPage() {
  return (
    <PolicyPage
      title="Điều khoản chương trình giới thiệu"
      updatedAt="28/08/2026"
      intro="Chương trình giới thiệu của DubaiWay có một tầng duy nhất. Đây không phải mô hình đa cấp."
    >
      <PolicySection title="1. Cách hoạt động">
        <p>
          Mỗi tài khoản DubaiWay có một mã giới thiệu riêng. Khi người được bạn giới thiệu hoàn tất một
          giao dịch hợp lệ, bạn nhận <strong className="text-midnight">30% hoa hồng mà DubaiWay thực nhận</strong> từ
          giao dịch đó.
        </p>
      </PolicySection>

      <PolicySection title="2. Công thức và ví dụ">
        <p>Thưởng = hoa hồng DubaiWay thực nhận từ đơn đó × 30%.</p>
        <p>
          Hoa hồng nền tảng thay đổi theo dịch vụ và theo hợp đồng với từng đối tác, nên số thưởng mỗi
          đơn một khác. Tỷ lệ áp dụng được ghi lại tại thời điểm đặt và không đổi về sau, kể cả khi
          DubaiWay điều chỉnh biểu phí.
        </p>
        <div className="rounded-xl bg-ivory-200 p-4 font-mono text-sm">
          <p className="text-ink-muted">Ví dụ, một đơn có hoa hồng nền tảng 100 USD:</p>
          <p className="mt-2 text-champagne-600">Người giới thiệu nhận<span className="float-right">30,00 USD</span></p>
          <p className="border-t border-mist pt-1 text-midnight">DubaiWay thực giữ<span className="float-right">70,00 USD</span></p>
        </div>
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Lưu ý quan trọng:</strong> 30% được tính trên <em>hoa hồng</em>, không phải trên giá trị
          đơn hàng. Số tiền bạn thực nhận từ từng đơn hiện đầy đủ trong mục Giới thiệu bạn bè ở tài khoản.
        </p>
      </PolicySection>

      <PolicySection title="3. Chỉ một tầng">
        <p>
          Nếu bạn giới thiệu B, và B giới thiệu C: bạn nhận thưởng từ giao dịch của B,
          nhưng <strong className="text-midnight">không</strong> nhận bất cứ khoản nào từ giao dịch của C.
        </p>
        <p>
          Hệ thống không lưu cây giới thiệu nhiều tầng và không có cơ chế nào để phát sinh
          hoa hồng dây chuyền. Đây là ràng buộc kỹ thuật ở tầng dữ liệu, không chỉ là chính sách.
        </p>
      </PolicySection>

      <PolicySection title="4. Khi nào thưởng được rút">
        <p>Thưởng chuyển sang trạng thái rút được khi thoả mãn <em>tất cả</em> điều kiện sau:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Đơn hàng đã được thanh toán thành công</li>
          <li>Dịch vụ đã được sử dụng và đơn hàng chuyển sang trạng thái hoàn thành</li>
          <li>Đã hết thời hạn khiếu nại của dịch vụ đó</li>
          <li>Không phát sinh hoàn tiền toàn phần hoặc một phần</li>
          <li>Không có dấu hiệu gian lận đang được xem xét</li>
        </ul>
        <p>Số tiền rút tối thiểu mỗi lần là 100 USD.</p>
      </PolicySection>

      <PolicySection title="5. Nếu đơn hàng bị hoàn tiền">
        <p>
          Thưởng tương ứng sẽ bị thu hồi theo tỷ lệ số tiền hoàn. Nếu thưởng đã được chi trả,
          khoản thu hồi sẽ trừ vào số dư khả dụng của các lần sau.
        </p>
      </PolicySection>

      <PolicySection title="6. Hành vi không được chấp nhận">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tự giới thiệu chính mình bằng tài khoản thứ hai</li>
          <li>Tạo tài khoản ảo để nhận thưởng</li>
          <li>Đặt đơn rồi huỷ có hệ thống nhằm khai thác chương trình</li>
          <li>Quảng bá mã giới thiệu bằng nội dung sai sự thật về DubaiWay</li>
        </ul>
        <p>
          Hệ thống đối chiếu nhiều tín hiệu (tài khoản, email, số điện thoại, thiết bị, địa chỉ IP,
          phương thức thanh toán). Trùng khớp một tín hiệu đơn lẻ <em>không</em> bị coi là gian lận —
          gia đình dùng chung máy hay chung mạng là bình thường. Trường hợp đáng ngờ được chuyển
          cho người phụ trách xem xét thủ công trước khi có kết luận.
        </p>
      </PolicySection>

      <PolicySection title="7. Thay đổi chương trình">
        <p>
          DubaiWay có thể điều chỉnh tỷ lệ thưởng và điều kiện tham gia. Thay đổi chỉ áp dụng cho
          giao dịch phát sinh sau thời điểm công bố. Các khoản thưởng đã ghi nhận giữ nguyên tỷ lệ
          tại thời điểm phát sinh.
        </p>
      </PolicySection>

      <PolicySection title="8. Liên hệ">
        <p>
          Thắc mắc về thưởng giới thiệu, liên hệ{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">
            {siteConfig.contact.email}
          </a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
