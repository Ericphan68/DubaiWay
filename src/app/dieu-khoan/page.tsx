import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { img, photo } from '@/data/images';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Điều khoản & Bảo mật',
  description: 'Điều khoản sử dụng và chính sách bảo mật của DubaiWay.',
};

const terms = [
  { h: 'Giới thiệu', p: 'Bằng việc truy cập và sử dụng website DubaiWay, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.' },
  { h: 'Giá và thông tin sản phẩm', p: 'Mọi mức giá hiển thị trên website là giá tham khảo và có thể thay đổi theo thời điểm, tình trạng chỗ và chính sách của đối tác. Giá cuối cùng được xác nhận khi đặt dịch vụ.' },
  { h: 'Đặt dịch vụ & báo giá', p: 'Một số sản phẩm cho phép đặt trực tuyến, một số cần gửi yêu cầu để nhận báo giá, và một số được chuyển sang nền tảng đối tác. Giao diện luôn nêu rõ hình thức áp dụng cho từng dịch vụ.' },
  { h: 'Dịch vụ đối tác', p: 'Với các liên kết chuyển sang nền tảng đối tác (vé máy bay, khách sạn), việc đặt và thanh toán diễn ra trên nền tảng đó theo điều khoản của họ. DubaiWay không chịu trách nhiệm cho nội dung của bên thứ ba.' },
  { h: 'Trách nhiệm về visa', p: 'DubaiWay cung cấp dịch vụ tư vấn và hỗ trợ hồ sơ. Quyết định cấp hoặc từ chối visa thuộc về cơ quan lãnh sự hoặc cơ quan di trú có thẩm quyền. DubaiWay không cam kết đậu visa.' },
  { h: 'Thay đổi & huỷ dịch vụ', p: 'Chính sách thay đổi và huỷ áp dụng theo từng sản phẩm và được nêu trong trang chi tiết hoặc hợp đồng. Vui lòng liên hệ để được hướng dẫn cụ thể.' },
];

const privacy = [
  { h: 'Thông tin chúng tôi thu thập', p: 'Chúng tôi thu thập thông tin bạn cung cấp khi gửi yêu cầu tư vấn, báo giá hoặc liên hệ — như họ tên, số điện thoại, email và nhu cầu chuyến đi.' },
  { h: 'Cách chúng tôi sử dụng', p: 'Thông tin được dùng để tư vấn, báo giá và hỗ trợ hành trình của bạn. Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.' },
  { h: 'Bảo mật thông tin', p: 'Chúng tôi áp dụng các biện pháp hợp lý để bảo vệ thông tin của bạn. Tuy nhiên, không có phương thức truyền tải nào qua Internet là an toàn tuyệt đối.' },
  { h: 'Quyền của bạn', p: `Bạn có thể yêu cầu xem, cập nhật hoặc xoá thông tin cá nhân của mình bằng cách liên hệ ${siteConfig.contact.email}.` },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pháp lý"
        title="Điều khoản & Bảo mật"
        description="Các điều khoản sử dụng và chính sách bảo mật khi bạn sử dụng dịch vụ của DubaiWay."
        image={img(photo.europe, 1600)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Điều khoản & Bảo mật' }]}
      />

      <section className="shell grid gap-10 py-12 lg:grid-cols-[16rem_1fr] lg:py-16">
        {/* Mục lục */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Mục lục</p>
          <nav className="mt-3 space-y-1 text-sm">
            <a href="#terms" className="block rounded-lg px-3 py-2 text-ink-muted hover:bg-mist-200 hover:text-royal">Điều khoản sử dụng</a>
            <a href="#privacy" className="block rounded-lg px-3 py-2 text-ink-muted hover:bg-mist-200 hover:text-royal">Chính sách bảo mật</a>
          </nav>
          <p className="mt-4 px-3 text-xs text-ink-soft">Cập nhật: 08/2026</p>
        </aside>

        <div className="min-w-0 max-w-3xl space-y-12">
          <section id="terms" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-medium text-midnight">Điều khoản sử dụng</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-6 space-y-6">
              {terms.map((t) => (
                <div key={t.h}>
                  <h3 className="font-display text-lg font-medium text-midnight">{t.h}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-muted">{t.p}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-medium text-midnight">Chính sách bảo mật</h2>
            <div className="route-line mt-3 w-16" />
            <div className="mt-6 space-y-6">
              {privacy.map((t) => (
                <div key={t.h}>
                  <h3 className="font-display text-lg font-medium text-midnight">{t.h}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-muted">{t.p}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="rounded-2xl bg-mist-200/50 p-4 text-xs text-ink-soft">
            Nội dung trang này mang tính minh hoạ cho giai đoạn xây dựng giao diện và cần được rà soát bởi bộ phận pháp lý trước khi vận hành chính thức.
          </p>
        </div>
      </section>
    </>
  );
}
