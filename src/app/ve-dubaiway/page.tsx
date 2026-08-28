import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Về DubaiWay',
  description: 'DubaiWay là sàn thương mại dịch vụ du lịch tại Dubai và UAE, kết nối khách với các đối tác đã được xác minh giấy tờ.',
  alternates: { canonical: `${siteConfig.url}/ve-dubaiway` },
};

export default function AboutPage() {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Về chúng tôi"
            title="Một nơi để đặt mọi thứ cho chuyến đi Dubai"
            description="DubaiWay là sàn thương mại dịch vụ du lịch. Chúng tôi không tự vận hành tour — chúng tôi kết nối bạn với các đơn vị bản địa đã được xác minh giấy tờ, và đứng ra chịu trách nhiệm về trải nghiệm đặt dịch vụ."
          />

          <div className="mt-10 space-y-8">
            <Block title="Chúng tôi làm gì">
              <p>
                Bạn tìm, so sánh và đặt tour, vé tham quan, safari sa mạc, du thuyền, đưa đón sân bay
                và nhiều dịch vụ khác tại Dubai — tất cả ở một chỗ, trả tiền một lần, nhận một voucher.
                Sau khi thanh toán, bạn nhận voucher kèm mã QR; đối tác quét mã khi bạn sử dụng dịch vụ.
              </p>
            </Block>

            <Block title="Đối tác được kiểm tra thế nào">
              <p>
                Mọi đơn vị muốn bán trên DubaiWay phải nộp hồ sơ pháp lý: giấy phép kinh doanh, giấy phép
                lữ hành (nếu ngành nghề yêu cầu), mã số thuế và giấy tờ người đại diện. Với cá nhân là
                hộ chiếu hoặc Emirates ID cùng giấy phép hành nghề. Hồ sơ được đội thẩm định xét duyệt
                trước khi bất kỳ dịch vụ nào hiển thị công khai.
              </p>
              <p className="mt-3">
                Từng dịch vụ cũng phải qua duyệt riêng. Đối tác sửa nội dung quan trọng thì phải nộp duyệt lại.
              </p>
            </Block>

            <Block title="Tiền của bạn đi đâu">
              <p>
                Phần lớn số tiền bạn trả thuộc về đối tác cung cấp dịch vụ. DubaiWay giữ lại một phần
                hoa hồng để vận hành nền tảng, thẩm định đối tác và xử lý khiếu nại.
              </p>
              <p className="mt-3">
                Giá bạn thấy là giá cuối. DubaiWay <strong className="text-midnight">không cộng thêm
                phụ phí nào lên giá của đối tác</strong> — hoa hồng nằm trong giá đó, không tính thêm
                vào hoá đơn của bạn.
              </p>
            </Block>

            <Block title="Giá minh bạch">
              <p>
                Giá hiển thị đã gồm mọi khoản bạn phải trả cho DubaiWay. Thuế VAT (nếu có) được tách dòng
                riêng ở bước thanh toán. Không có phí ẩn phát sinh sau khi bạn bấm đặt.
              </p>
            </Block>

            <Block title="Nếu có chuyện không như ý">
              <p>
                Mỗi dịch vụ có chính sách huỷ riêng, ghi rõ trên trang dịch vụ trước khi bạn đặt.
                Sau khi sử dụng dịch vụ, bạn có một khoảng thời gian để khiếu nại — thường là 72 giờ.
                Trong thời gian này, tiền của đối tác chưa được giải ngân.
              </p>
            </Block>

            <Block title="Liên hệ">
              <p>
                Email <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">{siteConfig.contact.email}</a>
                {' · '}Hotline <a href={`tel:${siteConfig.contact.hotline}`} className="text-royal underline underline-offset-2">{siteConfig.contact.hotline}</a>
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Văn phòng: {siteConfig.contact.officeDXB} · {siteConfig.contact.officeVN}
              </p>
            </Block>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/danh-muc" variant="primary">Khám phá dịch vụ</Button>
            <Button href="/tro-thanh-doi-tac" variant="outline">Trở thành đối tác</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-midnight">{title}</h2>
      <div className="mt-2 leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}
