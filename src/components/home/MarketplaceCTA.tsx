import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

/** Hai lời mời: trở thành đối tác và tham gia chương trình giới thiệu. */
export function MarketplaceCTA() {
  return (
    <Section background="white">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-midnight p-8 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-400">
            Dành cho đối tác
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium sm:text-3xl">
            Bán dịch vụ của bạn cho khách quốc tế
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Không phí niêm yết, không phí duy trì. DubaiWay nhận 10% hoa hồng khi bạn bán được —
            và bạn thấy rõ từng đồng trên bảng đối soát.
          </p>
          <Button href="/tro-thanh-doi-tac" variant="gold" size="lg" className="mt-6">
            Đăng ký làm đối tác
          </Button>
        </div>

        <div className="rounded-3xl border border-champagne-200 bg-ivory-100 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-600">
            Chương trình giới thiệu
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium text-midnight sm:text-3xl">
            Giới thiệu bạn bè, nhận 30% hoa hồng
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Bạn nhận 30% phần hoa hồng DubaiWay thực nhận từ mỗi giao dịch hợp lệ của người bạn
            giới thiệu. Đơn 1.000 AED thì bạn được 30 AED. Chương trình một tầng, không phải đa cấp.
          </p>
          <Button href="/gioi-thieu-ban-be" variant="primary" size="lg" className="mt-6">
            Tìm hiểu chương trình
          </Button>
        </div>
      </div>
    </Section>
  );
}
