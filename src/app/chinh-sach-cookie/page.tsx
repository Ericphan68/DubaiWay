import type { Metadata } from 'next';
import { PolicyPage, PolicySection } from '@/components/shared/PolicyPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Chính sách cookie',
  description: 'DubaiWay dùng những cookie nào và vì mục đích gì.',
  alternates: { canonical: `${siteConfig.url}/chinh-sach-cookie` },
};

export default function CookiePage() {
  return (
    <PolicyPage title="Chính sách cookie" updatedAt="28/08/2026"
      intro="Cookie là tệp nhỏ trình duyệt lưu lại để website nhớ bạn giữa các lần truy cập.">
      <PolicySection title="Cookie chúng tôi dùng">
        <div className="overflow-x-auto rounded-2xl border border-mist">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-ivory-200 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Tên</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Mục đích</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Thời hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist bg-ivory-100">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">dw_session</td>
                <td className="px-4 py-3">Giữ phiên đăng nhập. Bắt buộc để dùng tài khoản.</td>
                <td className="px-4 py-3">7 ngày</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">dw_locale</td>
                <td className="px-4 py-3">Nhớ ngôn ngữ bạn chọn.</td>
                <td className="px-4 py-3">1 năm</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Cookie phiên đăng nhập đặt cờ <code className="rounded bg-ivory-200 px-1 font-mono text-xs">httpOnly</code> nên
          JavaScript trên trang không đọc được — đây là biện pháp chống đánh cắp phiên.
        </p>
      </PolicySection>

      <PolicySection title="Cookie quảng cáo và theo dõi">
        <p>
          Hiện DubaiWay <strong className="text-midnight">không</strong> đặt cookie quảng cáo hay theo dõi
          hành vi của bên thứ ba. Nếu điều này thay đổi, chúng tôi sẽ cập nhật trang này và hỏi ý kiến bạn trước.
        </p>
      </PolicySection>

      <PolicySection title="Kiểm soát cookie">
        <p>
          Bạn có thể xoá hoặc chặn cookie trong cài đặt trình duyệt. Chặn cookie phiên sẽ khiến bạn
          không đăng nhập được, nhưng vẫn xem và tìm kiếm dịch vụ bình thường.
        </p>
        <p>
          Thắc mắc: <a href={`mailto:${siteConfig.contact.email}`} className="text-royal underline underline-offset-2">{siteConfig.contact.email}</a>
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
