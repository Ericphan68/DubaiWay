import Link from 'next/link';
import Image from 'next/image';
import { departures } from '@/data/departures';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function ChooseDeparture() {
  return (
    <Section background="white">
      <SectionHeader
        eyebrow="Bạn khởi hành từ đâu?"
        title="Chọn điểm khởi hành của bạn"
        description="Chúng tôi hiển thị tour trọn gói kèm vé, visa và khách sạn phù hợp với nơi bạn xuất phát."
      />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {departures.map((dep) => (
          <Link
            key={dep.code}
            href={`/du-lich/tu-viet-nam?from=${dep.code}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card"
          >
            <Image
              src={dep.image}
              alt={dep.city}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-dubaiway group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-wide text-champagne-400">
                {dep.code === 'OTHER' ? 'Nối chuyến' : dep.code}
              </span>
              <p className="mt-1 font-display text-xl font-medium">{dep.city}</p>
              <p className="text-sm text-white/70">{dep.tourCount} tour đang mở</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
