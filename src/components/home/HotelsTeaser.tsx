import { hotels } from '@/data/hotels';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HotelCard } from '@/components/cards/HotelCard';

export function HotelsTeaser() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Khách sạn"
        title="Nơi lưu trú xứng tầm hành trình"
        description="Từ khu nghỉ dưỡng bên biển đến khách sạn 5 sao giữa lòng thành phố — có cả lựa chọn cho đoàn và sự kiện."
        link={{ label: 'Xem tất cả khách sạn', href: '/khach-san' }}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.slice(0, 3).map((hotel) => (
          <HotelCard key={hotel.slug} hotel={hotel} />
        ))}
      </div>
    </Section>
  );
}
