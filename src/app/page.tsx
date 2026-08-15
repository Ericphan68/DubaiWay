import { Hero } from '@/components/home/Hero';
import { ChooseDeparture } from '@/components/home/ChooseDeparture';
import { FlightsTeaser } from '@/components/home/FlightsTeaser';
import { HotelsTeaser } from '@/components/home/HotelsTeaser';
import { ToursFromVietnam } from '@/components/home/ToursFromVietnam';
import { ToursAtDestination } from '@/components/home/ToursAtDestination';
import { HolyLandSection } from '@/components/home/HolyLandSection';
import { DubaiSection } from '@/components/home/DubaiSection';
import { VisaSection } from '@/components/home/VisaSection';
import { EventsSection } from '@/components/home/EventsSection';
import { GroupToursSection } from '@/components/home/GroupToursSection';
import { SignatureSection } from '@/components/home/SignatureSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { JournalSection } from '@/components/home/JournalSection';
import { WhyDubaiWay } from '@/components/home/WhyDubaiWay';
import { Testimonials } from '@/components/home/Testimonials';
import { ConsultCTA } from '@/components/home/ConsultCTA';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      {/* 1 · Hero thương hiệu + 2 · Thanh tìm kiếm đa dịch vụ */}
      <Hero />
      {/* 3 · Chọn nơi khởi hành */}
      <ChooseDeparture />
      {/* 4 · Vé máy bay */}
      <FlightsTeaser />
      {/* 5 · Khách sạn */}
      <HotelsTeaser />
      {/* 6 · Tour khởi hành từ Việt Nam */}
      <ToursFromVietnam />
      {/* 7 · Tour tại điểm đến */}
      <ToursAtDestination />
      {/* 8 · DubaiWay Holy Land */}
      <HolyLandSection />
      {/* 9 · Dubai Experiences */}
      <DubaiSection />
      {/* 10 · Visa */}
      <VisaSection />
      {/* 11 · DubaiWay Events */}
      <EventsSection />
      {/* 12 · Tour đoàn & doanh nghiệp */}
      <GroupToursSection />
      {/* 13 · DubaiWay Signature */}
      <SignatureSection />
      {/* 14 · Dịch vụ bổ trợ */}
      <ServicesSection />
      {/* 15 · Cẩm nang */}
      <JournalSection />
      {/* 16 · Vì sao chọn DubaiWay */}
      <WhyDubaiWay />
      {/* 17 · Testimonials */}
      <Testimonials />
      {/* 18 · WhatsApp & tư vấn */}
      <ConsultCTA />
      {/* 19 · Newsletter */}
      <Newsletter />
      {/* 20 · Footer — global trong layout */}
    </>
  );
}
