import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconUser, IconMapPin, IconClock, IconCheck, IconArrowRight } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Tài khoản (mẫu)',
  description: 'Trang tài khoản khách hàng mẫu của DubaiWay.',
  robots: { index: false },
};

const bookings = [
  { code: 'CN-24817', name: 'Dubai – Abu Dhabi 6N5Đ', date: '20/09/2026', status: 'Đã xác nhận', tone: 'ok' as const },
  { code: 'CN-24790', name: 'Israel – Jordan 9N8Đ', date: '08/11/2026', status: 'Chờ đặt cọc', tone: 'wait' as const },
  { code: 'CN-24712', name: 'Desert Safari Dubai', date: '02/08/2026', status: 'Hoàn tất', tone: 'done' as const },
];

const quotes = [
  { code: 'BG-1042', name: 'Vé thương gia SGN–CDG', date: '28/07/2026', status: 'Đang xử lý' },
  { code: 'BG-1039', name: 'Gala Dinner tại Dubai (120 khách)', date: '25/07/2026', status: 'Đã gửi báo giá' },
];

const saved = ['Hy Lạp: Athens – Santorini', 'Bảy Hội Thánh Thổ Nhĩ Kỳ', 'InterContinental Danang'];

const statusTone: Record<string, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  wait: 'bg-amber-50 text-amber-700',
  done: 'bg-mist-200 text-ink-muted',
};

export default function AccountPage() {
  return (
    <section className="shell py-10 lg:py-14">
      <div className="rounded-xl bg-champagne-200/30 px-4 py-2 text-xs text-ink-muted">
        Đây là trang tài khoản <strong>mẫu</strong> với dữ liệu minh hoạ — chưa kết nối hệ thống thật.
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar */}
        <aside>
          <div className="flex items-center gap-3 rounded-2xl border border-mist bg-ivory-100 p-5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-midnight text-champagne-400">
              <IconUser className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-lg font-medium text-midnight">Mai Hương</p>
              <p className="text-xs text-ink-soft">huong@email.com</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {['Tổng quan', 'Đơn đặt của tôi', 'Yêu cầu báo giá', 'Đã lưu', 'Hồ sơ'].map((item, i) => (
              <span
                key={item}
                className={`block rounded-xl px-4 py-2.5 text-sm ${i === 0 ? 'bg-royal font-medium text-white' : 'text-ink-muted hover:bg-mist-200'}`}
              >
                {item}
              </span>
            ))}
          </nav>
          <Link href="/dang-nhap" className="mt-4 block px-4 text-sm text-royal hover:underline">Đăng xuất</Link>
        </aside>

        {/* Main */}
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl font-medium text-midnight">Xin chào, Mai Hương 👋</h1>
            <p className="mt-1 text-sm text-ink-muted">Đây là tổng quan các hoạt động gần đây của bạn.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '3', label: 'Đơn đặt' },
              { value: '2', label: 'Yêu cầu báo giá' },
              { value: '3', label: 'Đã lưu' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-mist bg-ivory-100 p-5 text-center">
                <p className="font-display text-2xl font-semibold text-midnight">{s.value}</p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bookings */}
          <div>
            <h2 className="font-display text-lg font-medium text-midnight">Đơn đặt của tôi</h2>
            <div className="mt-3 divide-y divide-mist rounded-2xl border border-mist bg-ivory-100">
              {bookings.map((b) => (
                <div key={b.code} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold text-midnight">{b.name}</p>
                    <p className="text-xs text-ink-soft">
                      Mã {b.code} · <IconClock className="inline h-3 w-3" /> {b.date}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[b.tone]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quotes */}
          <div>
            <h2 className="font-display text-lg font-medium text-midnight">Yêu cầu báo giá</h2>
            <div className="mt-3 divide-y divide-mist rounded-2xl border border-mist bg-ivory-100">
              {quotes.map((q) => (
                <div key={q.code} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold text-midnight">{q.name}</p>
                    <p className="text-xs text-ink-soft">Mã {q.code} · {q.date}</p>
                  </div>
                  <Badge tone="navy">{q.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Saved */}
          <div>
            <h2 className="font-display text-lg font-medium text-midnight">Hành trình đã lưu</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {saved.map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-2xl border border-mist bg-ivory-100 p-4 text-sm text-midnight">
                  <IconMapPin className="h-4 w-4 shrink-0 text-champagne-600" /> {s}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-midnight p-6 text-white">
            <IconCheck className="h-6 w-6 text-champagne-400" />
            <p className="flex-1 text-sm">Sẵn sàng cho hành trình tiếp theo? Khám phá tour và trải nghiệm mới.</p>
            <Button href="/du-lich" variant="gold" size="sm">Xem tour <IconArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
