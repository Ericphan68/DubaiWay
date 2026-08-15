import { articles } from '@/data/articles';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ArticleCard } from '@/components/cards/ArticleCard';

export function JournalSection() {
  return (
    <Section background="ivory">
      <SectionHeader
        eyebrow="Cẩm nang DubaiWay"
        title="Kinh nghiệm thật cho hành trình của bạn"
        description="Visa, vé máy bay, chi phí, văn hoá và kinh nghiệm đoàn — viết bởi đội ngũ đã trực tiếp đồng hành cùng khách."
        link={{ label: 'Đọc thêm cẩm nang', href: '/cam-nang' }}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Section>
  );
}
