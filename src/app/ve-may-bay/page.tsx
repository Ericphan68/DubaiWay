import type { Metadata } from 'next';
import { sampleFlights } from '@/data/flights';
import { img, photo } from '@/data/images';
import { whatsappMessages } from '@/lib/whatsapp';
import { PageHero } from '@/components/ui/PageHero';
import { FlightSearchForm } from '@/components/flights/FlightSearchForm';
import { FlightResultCard } from '@/components/flights/FlightResultCard';
import { BusinessClassForm } from '@/components/flights/BusinessClassForm';
import { ConsultChannels } from '@/components/shared/ConsultChannels';
import { IconSparkle } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Vé máy bay — So sánh giá từ nhiều nền tảng',
  description:
    'Tra cứu và so sánh giá vé máy bay tham khảo từ các nền tảng đối tác, hoặc để chuyên viên DubaiWay săn giá giúp. Có dịch vụ vé thương gia & hạng nhất.',
};

export default function FlightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Vé máy bay"
        title="So sánh giá, đặt nơi bạn thấy tốt nhất"
        description="DubaiWay tổng hợp giá tham khảo từ nhiều nền tảng đối tác. Bạn chọn được vé ưng ý, hoặc để đội ngũ săn giá giúp."
        image={img(photo.airplane, 1800)}
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Vé máy bay' }]}
      >
        <FlightSearchForm />
      </PageHero>

      {/* Kết quả */}
      <section id="ket-qua" className="shell scroll-mt-24 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-medium text-midnight">Kết quả tham khảo</h2>
            <div className="route-line mt-3 w-16" />
          </div>
          <p className="max-w-md text-xs text-ink-soft">
            Dữ liệu mẫu để minh hoạ bố cục. Giá thực tế và tình trạng chỗ sẽ được xác nhận trên nền tảng đối tác khi bạn bấm “Xem &amp; đặt”.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sampleFlights.map((flight) => (
            <FlightResultCard key={flight.id} flight={flight} />
          ))}
        </div>
      </section>

      {/* Nhờ DubaiWay kiểm giá */}
      <section className="bg-mist-200/50 py-14">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="eyebrow text-champagne-600"><span className="route-dot" /> Không chắc chọn vé nào?</span>
            <h2 className="mt-3 text-display-md font-medium text-midnight">Nhờ nhân viên DubaiWay kiểm giá</h2>
            <p className="mt-3 max-w-md text-ink-muted">
              Gửi hành trình của bạn, chuyên viên sẽ so sánh nhiều nguồn, tìm mức giá và điều kiện vé tốt nhất
              rồi báo lại — hoàn toàn miễn phí tư vấn.
            </p>
          </div>
          <ConsultChannels waMessage={whatsappMessages.flights} quoteHref="/yeu-cau-bao-gia?type=flight" />
        </div>
      </section>

      {/* Vé thương gia & hạng nhất */}
      <section id="business" className="scroll-mt-24 bg-midnight py-14 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="text-white">
            <span className="eyebrow text-champagne-400"><IconSparkle className="h-4 w-4" /> DubaiWay Signature</span>
            <h2 className="mt-3 text-display-md font-medium">Vé thương gia &amp; hạng nhất giá tốt</h2>
            <p className="mt-3 max-w-md text-white/70">
              Chuyên viên săn giá khoang C và F từ nhiều hãng, ưu tiên lịch bay và chỗ ngồi bạn muốn. Điền
              thông tin, chúng tôi báo giá qua WhatsApp.
            </p>
          </div>
          <BusinessClassForm />
        </div>
      </section>
    </>
  );
}
