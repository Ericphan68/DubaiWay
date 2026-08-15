import type { Article } from '@/types';
import { articles } from './articles';

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface RelatedCta {
  label: string;
  href: string;
  description: string;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function relatedArticles(article: Article, limit = 3): Article[] {
  const sameTopic = articles.filter((a) => a.slug !== article.slug && a.topic === article.topic);
  const rest = articles.filter((a) => a.slug !== article.slug && a.topic !== article.topic);
  return [...sameTopic, ...rest].slice(0, limit);
}

/** CTA liên quan theo chủ đề bài viết — mỗi bài đều dẫn về một hành động. */
const ctaByTopic: Record<string, RelatedCta> = {
  Visa: { label: 'Kiểm tra điều kiện visa', href: '/visa', description: 'Xem điều kiện và hồ sơ theo quốc gia bạn muốn đến.' },
  'Vé máy bay': { label: 'Tra cứu vé máy bay', href: '/ve-may-bay', description: 'So sánh giá tham khảo từ nhiều nền tảng đối tác.' },
  'Khách sạn': { label: 'Tìm khách sạn', href: '/khach-san', description: 'Lọc theo giá, hạng sao và khu vực bạn muốn ở.' },
  Tour: { label: 'Xem tour phù hợp', href: '/du-lich', description: 'Khám phá tour theo điểm đến và phân khúc.' },
  Events: { label: 'Tổ chức sự kiện cùng DubaiWay', href: '/events', description: 'Nhận tư vấn tổ chức sự kiện trong nước và quốc tế.' },
  'Kinh nghiệm hành hương': { label: 'Xem hành trình Holy Land', href: '/holy-land', description: 'Các hành trình về Đất Thánh có trưởng đoàn mục vụ.' },
  'Luxury Travel': { label: 'Khám phá DubaiWay Signature', href: '/signature', description: 'Hành trình luxury thiết kế riêng cho bạn.' },
  'Business Travel': { label: 'Vé thương gia giá tốt', href: '/ve-may-bay#business', description: 'Nhận báo giá vé khoang thương gia & hạng nhất.' },
};

export function getArticleCta(article: Article): RelatedCta {
  return (
    ctaByTopic[article.topic] ?? {
      label: 'Nhận tư vấn từ DubaiWay',
      href: '/yeu-cau-bao-gia',
      description: 'Gửi nhu cầu, đội ngũ DubaiWay sẽ liên hệ và báo giá.',
    }
  );
}

/** Sinh nội dung bài viết mạch lạc theo chủ đề (dữ liệu demo, không lorem). */
export function getArticleBody(article: Article): ArticleSection[] {
  const d = article.destination;
  return [
    {
      heading: 'Tổng quan',
      paragraphs: [
        `${article.excerpt} Bài viết này tổng hợp kinh nghiệm thực tế từ đội ngũ DubaiWay, giúp bạn chuẩn bị chu đáo hơn cho hành trình liên quan đến ${d}.`,
        'Mọi thông tin mang tính tham khảo và có thể thay đổi theo thời điểm. Khi cần, bạn hãy liên hệ chuyên viên để được tư vấn theo tình huống cụ thể của mình.',
      ],
    },
    {
      heading: 'Những điều nên chuẩn bị',
      paragraphs: [
        'Hãy lên danh sách những việc cần làm sớm: giấy tờ, ngân sách, thời điểm đi và các dịch vụ đi kèm. Chuẩn bị càng sớm, bạn càng có nhiều lựa chọn tốt về giá và lịch trình.',
        `Với ${d}, lưu ý về thời tiết theo mùa, văn hoá địa phương và các quy định nhập cảnh hiện hành để chuyến đi diễn ra suôn sẻ.`,
      ],
    },
    {
      heading: 'Kinh nghiệm từ DubaiWay',
      paragraphs: [
        'Đội ngũ của chúng tôi đã trực tiếp đồng hành cùng nhiều khách hàng trên hành trình tương tự. Một lịch trình hợp lý là lịch trình có nhịp nghỉ, không nhồi nhét quá nhiều điểm trong một ngày.',
        'Nếu bạn đi theo đoàn, việc có trưởng đoàn và hướng dẫn viên am hiểu điểm đến sẽ giúp trải nghiệm trọn vẹn và an tâm hơn rất nhiều.',
      ],
    },
    {
      heading: 'Lời khuyên cuối',
      paragraphs: [
        'Đừng ngần ngại đặt câu hỏi trước khi quyết định. Một quyết định tốt luôn đến từ thông tin đầy đủ và sự tư vấn phù hợp.',
      ],
    },
  ];
}
