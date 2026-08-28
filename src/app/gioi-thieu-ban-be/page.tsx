import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { getSessionUser } from '@/server/auth';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Chương trình giới thiệu',
  description: 'Giới thiệu bạn bè dùng DubaiWay và nhận 30% hoa hồng nền tảng thực nhận từ mỗi giao dịch hợp lệ. Chương trình một tầng.',
  alternates: { canonical: `${siteConfig.url}/gioi-thieu-ban-be` },
};

export default async function ReferralPublicPage() {
  const user = await getSessionUser();

  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Giới thiệu bạn bè"
            title="Bạn giới thiệu, bạn được chia hoa hồng"
            description="Khi người bạn giới thiệu đặt dịch vụ trên DubaiWay, bạn nhận 30% phần hoa hồng mà DubaiWay thực nhận từ giao dịch đó."
          />

          <div className="mt-10 rounded-2xl border border-champagne-200 bg-ivory-100 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-champagne-600">
              Ví dụ cụ thể
            </p>
            <div className="mt-4 space-y-2 font-mono text-sm">
              <Line label="Khách đặt dịch vụ" value="1.000,00 AED" />
              <Line label="Đối tác cung cấp dịch vụ nhận" value="900,00 AED" />
              <Line label="Hoa hồng DubaiWay" value="100,00 AED" />
              <Line label="Bạn nhận (30% của hoa hồng)" value="30,00 AED" highlight />
              <Line label="DubaiWay thực giữ" value="70,00 AED" />
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Nói rõ để bạn không hiểu nhầm:</strong> 30% tính trên <em>hoa hồng</em>, không phải
              trên giá trị đơn hàng. Đơn 1.000 AED thì bạn nhận 30 AED, không phải 300 AED.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Step n={1} title="Lấy mã của bạn" body="Đăng nhập và vào mục Giới thiệu bạn bè để lấy mã và link riêng." />
            <Step n={2} title="Chia sẻ" body="Gửi link cho bạn bè. Người đăng ký qua link được ghi nhận là bạn giới thiệu." />
            <Step n={3} title="Nhận thưởng" body="Khi họ dùng dịch vụ xong và hết thời hạn khiếu nại, thưởng vào ví và rút được." />
          </div>

          <div className="mt-10 rounded-2xl border border-mist bg-ivory-200 p-6">
            <h2 className="font-display text-lg font-medium text-midnight">Chỉ một tầng — không phải đa cấp</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Nếu bạn giới thiệu B, và B giới thiệu C: bạn nhận thưởng từ giao dịch của B, nhưng
              <strong className="text-midnight"> không nhận gì</strong> từ giao dịch của C. Hệ thống
              không lưu cây giới thiệu nhiều tầng và không có cơ chế phát sinh hoa hồng dây chuyền.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Button href="/tai-khoan/gioi-thieu" variant="primary" size="lg">
                Xem mã giới thiệu của tôi
              </Button>
            ) : (
              <>
                <Button href="/dang-ky" variant="primary" size="lg">Tạo tài khoản miễn phí</Button>
                <Button href="/dang-nhap?next=/tai-khoan/gioi-thieu" variant="outline" size="lg">Đăng nhập</Button>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-ink-soft">
            Điều kiện đầy đủ:{' '}
            <Link href="/dieu-khoan-gioi-thieu" className="text-royal underline underline-offset-2">
              Điều khoản chương trình giới thiệu
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}

function Line({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <p className={highlight ? 'font-semibold text-champagne-600' : 'text-midnight'}>
      {label}<span className="float-right">{value}</span>
    </p>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-mist bg-ivory-100 p-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-champagne text-sm font-semibold text-white">
        {n}
      </span>
      <p className="mt-3 font-medium text-midnight">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
