import { dubaiExperiences } from '@/data/dubai';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ExperienceCard } from '@/components/cards/ExperienceCard';

export function DubaiSection() {
  return (
    <Section background="ivory">
      <SectionHeader
        eyebrow="Dubai Experiences"
        title="Cả một Dubai để trải nghiệm"
        description="Safari sa mạc, Burj Khalifa, du thuyền Marina, Abu Dhabi và trực thăng ngắm thành phố — đặt trực tuyến hoặc nhờ nhân viên hỗ trợ."
        link={{ label: 'Vào hub Dubai', href: '/dubai' }}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dubaiExperiences.slice(0, 6).map((item) => (
          <ExperienceCard key={item.slug} item={item} />
        ))}
      </div>
    </Section>
  );
}
