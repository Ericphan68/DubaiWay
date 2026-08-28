import { categoryIcon, CATEGORY_GROUPS } from '@/config/category-groups';
import { cn } from '@/lib/utils';

/**
 * Ảnh bìa thay thế khi dịch vụ chưa có ảnh thật.
 *
 * Trước đây chỗ này là một ô be trống với hai chữ "DW" — chiếm 60% diện tích
 * thẻ mà không nói gì. Ở đây thay bằng một mảng màu theo nhóm dịch vụ, biểu
 * tượng đúng loại trải nghiệm, và một đường chân trời mảnh gợi hình Dubai.
 * Khách liếc qua là biết đây là tour, vé tham quan hay du thuyền.
 *
 * KHÔNG cố giả làm ảnh chụp. Nó trông rõ ràng là hình dựng — thật thà hơn, và
 * khi đối tác tải ảnh thật lên thì ảnh thật thay thế hoàn toàn.
 */

/** Nhóm nào thì tông nào. Đều lấy từ bảng màu thương hiệu, không thêm màu mới. */
const TONE: Record<string, { from: string; to: string; ink: string }> = {
  tours:        { from: 'from-champagne/[0.22]', to: 'to-ivory-200',        ink: 'text-champagne-600' },
  tickets:      { from: 'from-royal/[0.14]',     to: 'to-ivory-200',        ink: 'text-royal' },
  stay:         { from: 'from-midnight/[0.12]',  to: 'to-ivory-200',        ink: 'text-midnight-700' },
  transport:    { from: 'from-royal/[0.10]',     to: 'to-mist-200',         ink: 'text-royal-500' },
  'car-rental': { from: 'from-midnight/[0.10]',  to: 'to-mist-200',         ink: 'text-midnight-700' },
  dining:       { from: 'from-champagne/[0.18]', to: 'to-mist-200',         ink: 'text-champagne-600' },
  other:        { from: 'from-mist-200',         to: 'to-ivory-200',        ink: 'text-ink-soft' },
};

/** Danh mục thuộc nhóm nào. Tính sẵn một lần thay vì dò lại mỗi lần vẽ thẻ. */
const GROUP_OF_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.slugs.map((slug) => [slug, g.id])),
);

export function ServiceCover({
  categorySlug, className,
}: {
  categorySlug: string;
  className?: string;
}) {
  const groupId = GROUP_OF_SLUG[categorySlug] ?? 'other';
  const tone = TONE[groupId] ?? TONE.other;
  const Icon = categoryIcon(categorySlug, groupId);

  return (
    <div
      aria-hidden
      className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br', tone.from, tone.to, className)}
    >
      {/* Đường chân trời Dubai, nét rất mảnh, nằm dưới đáy như một lớp nền. */}
      <svg
        viewBox="0 0 320 90"
        preserveAspectRatio="none"
        className={cn('absolute inset-x-0 bottom-0 h-[38%] w-full opacity-[0.16]', tone.ink)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      >
        <path d="M0 88h320" />
        <path d="M14 88V64h16v24M38 88V72h12v16" />
        <path d="M96 88V50h20v38M120 88V60h14v28" />
        <path d="M160 88V18l6-16 6 16v70" />
        <path d="M196 88V56h18v32M218 88V66h12v22" />
        <path d="M262 88V44h22v44M288 88V62h16v26" />
      </svg>

      {/* Biểu tượng loại dịch vụ — đủ lớn để nhận ra từ xa, đủ mờ để không át chữ. */}
      <Icon className={cn('absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-[58%] opacity-[0.32]', tone.ink)} />
    </div>
  );
}
