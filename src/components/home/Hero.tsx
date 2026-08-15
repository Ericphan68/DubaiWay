import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SearchConsole } from './SearchConsole';
import { IconArrowRight } from '@/components/ui/icons';

const quickLinks = [
  { label: 'Xem tour', href: '/du-lich' },
  { label: 'Kiểm tra visa', href: '/visa' },
  { label: 'Tổ chức sự kiện', href: '/events' },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      {/* Ảnh nền — thành phố thiên đường (thiết kế riêng) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.webp"
          alt="Thành phố thiên đường — hành trình đức tin cùng DubaiWay"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/85 via-midnight/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/55 via-transparent to-transparent" />
      </div>

      <div className="shell relative flex flex-col justify-center pb-6 pt-16 sm:pt-20 lg:min-h-[40rem] lg:pt-24">
        <div className="max-w-2xl">
          <span className="eyebrow text-champagne-400">
            <span className="route-dot" />
            Nền tảng du lịch &amp; sự kiện quốc tế
          </span>
          <h1 className="mt-4 text-display-xl font-medium text-balance">
            Khởi đầu mọi hành trình của bạn
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Tra cứu vé máy bay, khách sạn, tour, visa và sự kiện quốc tế — nhận tư vấn
            trực tiếp từ đội ngũ DubaiWay.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="/tim-kiem" variant="gold" size="lg">
              Tìm chuyến đi
              <IconArrowRight className="h-4 w-4" />
            </Button>
            {quickLinks.map((link) => (
              <Button key={link.href} href={link.href} variant="onDark" size="lg">
                {link.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search console docked */}
        <div className="mt-10 lg:mt-14">
          <SearchConsole />
          <p className="mt-3 text-xs text-white/55">
            Dữ liệu hiển thị là mẫu tham khảo. Giá và tình trạng thực tế được xác nhận khi đặt.
          </p>
        </div>
      </div>
    </section>
  );
}
