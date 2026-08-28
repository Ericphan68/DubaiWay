import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LeadForm } from '@/components/shared/LeadForm';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Trở thành đối tác',
  description: 'Đăng bán dịch vụ du lịch của bạn trên DubaiWay. Hoa hồng 10%, thanh toán minh bạch, không phí niêm yết.',
  alternates: { canonical: `${siteConfig.url}/tro-thanh-doi-tac` },
};

const inputCls = 'h-11 w-full rounded-xl border border-mist bg-ivory-100 px-3 text-sm outline-none focus:border-royal';

const PARTNER_FIELDS = [
  { name: 'kind', label: 'Loại đối tác' },
  { name: 'businessName', label: 'Tên doanh nghiệp / cá nhân' },
  { name: 'country', label: 'Quốc gia đăng ký' },
  { name: 'city', label: 'Thành phố hoạt động' },
  { name: 'serviceTypes', label: 'Dịch vụ muốn bán' },
  { name: 'website', label: 'Website / mạng xã hội' },
  { name: 'contactName', label: 'Người liên hệ' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'WhatsApp / SĐT' },
  { name: 'experience', label: 'Kinh nghiệm cung cấp dịch vụ' },
] as const;

export default function BecomePartnerPage() {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Dành cho đối tác"
            title="Bán dịch vụ của bạn cho khách quốc tế"
            description="DubaiWay đưa dịch vụ của bạn tới khách Việt Nam và khách quốc tế đang tìm trải nghiệm tại Dubai. Không phí niêm yết, không phí duy trì — chỉ tính hoa hồng khi có đơn."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card title="10% hoa hồng" body="Tính trên tiền hàng sau giảm giá, chưa gồm thuế thu hộ. Không có khoản nào khác." />
            <Card title="Không phí niêm yết" body="Đăng bao nhiêu dịch vụ cũng được. Chỉ trả khi bán được." />
            <Card title="Đối soát rõ ràng" body="Mỗi đơn hiển thị đủ: khách trả bao nhiêu, hoa hồng bao nhiêu, bạn nhận bao nhiêu." />
          </div>
        </div>
      </Section>

      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-medium text-midnight">Quy trình tham gia</h2>
          <ol className="mt-6 space-y-5">
            <Step n={1} title="Gửi thông tin ban đầu"
                  body="Điền form bên dưới. Đội hỗ trợ đối tác sẽ liên hệ trong 1–2 ngày làm việc." />
            <Step n={2} title="Nộp hồ sơ pháp lý"
                  body="Doanh nghiệp: giấy phép kinh doanh, mã số thuế, giấy phép lữ hành (nếu ngành nghề yêu cầu), giấy tờ người đại diện. Cá nhân: hộ chiếu hoặc Emirates ID, giấy phép hành nghề nếu cần." />
            <Step n={3} title="Thẩm định"
                  body="Đội thẩm định kiểm tra giấy tờ. Nếu thiếu, chúng tôi nêu rõ cần bổ sung gì thay vì từ chối chung chung." />
            <Step n={4} title="Đăng dịch vụ"
                  body="Hồ sơ được duyệt, bạn tạo dịch vụ trên dashboard. Mỗi dịch vụ được duyệt riêng trước khi lên sàn." />
            <Step n={5} title="Nhận đơn và đối soát"
                  body="Khách đặt và thanh toán qua DubaiWay. Bạn quét voucher khi khách sử dụng. Tiền được đối soát và chuyển về tài khoản ngân hàng của bạn." />
          </ol>

          <p className="mt-8 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-muted">
            <strong className="text-midnight">Về giấy tờ:</strong> hồ sơ KYC/KYB được lưu trong kho riêng tư,
            chỉ người có nhiệm vụ thẩm định mới xem được, và mỗi lần mở đều để lại dấu vết trong nhật ký hệ thống.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-medium text-midnight">Bắt đầu đăng ký</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Có tài khoản DubaiWay thì tạo hồ sơ trực tiếp — nhanh hơn và theo dõi được tiến độ thẩm định.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/merchant/dang-ky"
              className="inline-flex h-11 items-center rounded-full bg-champagne px-6 text-sm font-medium text-white transition-colors hover:bg-champagne-600"
            >
              Tạo hồ sơ đối tác
            </a>
            <a
              href="/dang-ky"
              className="inline-flex h-11 items-center rounded-full border border-midnight/25 px-6 text-sm font-medium text-midnight transition-colors hover:border-champagne hover:text-champagne-600"
            >
              Chưa có tài khoản? Đăng ký
            </a>
          </div>

          <h3 className="mt-10 font-display text-lg font-medium text-midnight">Hoặc gửi thông tin qua WhatsApp</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Nếu bạn muốn trao đổi trước, điền form dưới đây.
          </p>

          <LeadForm
            title="đăng ký trở thành đối tác của DubaiWay"
            subject="Đăng ký đối tác — DubaiWay"
            fields={PARTNER_FIELDS}
            submitLabel="Gửi đăng ký đối tác"
            className="mt-6 rounded-2xl border border-mist bg-ivory-100 p-6 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Loại đối tác</span>
                <select name="kind" className={inputCls}>
                  <option value="business">Doanh nghiệp</option>
                  <option value="individual">Cá nhân</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Tên doanh nghiệp / cá nhân</span>
                <input name="businessName" required className={inputCls} placeholder="Desert Rose Tourism LLC" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Quốc gia đăng ký</span>
                <input name="country" className={inputCls} placeholder="UAE" defaultValue="UAE" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Thành phố hoạt động</span>
                <input name="city" className={inputCls} placeholder="Dubai" defaultValue="Dubai" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Website / mạng xã hội</span>
                <input name="website" className={inputCls} placeholder="https://" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Dịch vụ muốn bán</span>
                <input name="serviceTypes" required className={inputCls}
                       placeholder="VD: safari sa mạc, city tour, thuê du thuyền" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Người liên hệ</span>
                <input name="contactName" required className={inputCls} placeholder="Họ tên" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-ink-muted">WhatsApp / SĐT</span>
                <input name="phone" required className={inputCls} placeholder="+971…" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Email</span>
                <input name="email" type="email" required className={inputCls} placeholder="ban@congty.com" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">Kinh nghiệm cung cấp dịch vụ</span>
                <textarea name="experience" rows={3}
                          className="w-full rounded-xl border border-mist bg-ivory-100 p-3 text-sm outline-none focus:border-royal"
                          placeholder="Số năm hoạt động, quy mô đội ngũ, các dịch vụ đang vận hành…" />
              </label>
            </div>
          </LeadForm>
        </div>
      </Section>
    </>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <p className="font-display text-lg font-medium text-midnight">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne text-sm font-semibold text-white">
        {n}
      </span>
      <span>
        <span className="block font-medium text-midnight">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{body}</span>
      </span>
    </li>
  );
}
