import { describe, expect, it } from 'vitest';
import { CATEGORY_GROUPS, categoryIcon, groupCategories } from '../category-groups';
import type { CategorySummary } from '@/server/repositories/types';
import { MEMORY_CATEGORIES as seededCategories } from '@/server/repositories/memory/data';

const cat = (slug: string, serviceCount = 0): CategorySummary => ({
  id: `id-${slug}`, slug, name: slug, icon: null, imageUrl: null, serviceCount,
});

/** Toàn bộ danh mục thật trong kho dữ liệu, ở dạng CategorySummary. */
const allReal = (): CategorySummary[] =>
  seededCategories.map((c) => cat(c.slug));

describe('Khai báo nhóm danh mục', () => {
  it('không có slug nào bị xếp vào hai nhóm', () => {
    const seen = new Set<string>();
    for (const g of CATEGORY_GROUPS) {
      for (const slug of g.slugs) {
        expect(seen.has(slug), `${slug} bị lặp`).toBe(false);
        seen.add(slug);
      }
    }
  });

  it('mọi slug khai báo đều tồn tại trong kho dữ liệu', () => {
    // Nếu sai, nhóm sẽ hiện thiếu ô mà không ai biết.
    const real = new Set<string>(seededCategories.map((c) => c.slug));
    for (const g of CATEGORY_GROUPS) {
      for (const slug of g.slugs) {
        expect(real.has(slug), `${slug} không có trong kho dữ liệu`).toBe(true);
      }
    }
  });

  it('phủ hết 20 danh mục thật, không sót cái nào', () => {
    const declared = new Set<string>(CATEGORY_GROUPS.flatMap((g) => g.slugs));
    const missing = seededCategories.filter((c) => !declared.has(c.slug)).map((c) => c.slug);
    expect(missing).toEqual([]);
    expect(declared.size).toBe(seededCategories.length);
  });
});

describe('Gom danh mục vào nhóm', () => {
  it('không đánh rơi danh mục nào', () => {
    const input = allReal();
    const groups = groupCategories(input, 'vi');
    const output = groups.flatMap((g) => g.items.map((i) => i.slug));
    expect(output.sort()).toEqual(input.map((c) => c.slug).sort());
  });

  it('dồn danh mục lạ vào nhóm Dịch vụ khác thay vì bỏ đi', () => {
    const groups = groupCategories([...allReal(), cat('hot-air-balloon')], 'vi');
    const other = groups.find((g) => g.id === 'other');
    expect(other?.items.map((i) => i.slug)).toContain('hot-air-balloon');
  });

  it('vẫn hiện danh mục lạ khi mọi danh mục quen đều bị tắt', () => {
    const groups = groupCategories([cat('mystery-service')], 'vi');
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('other');
    expect(groups[0].items[0].slug).toBe('mystery-service');
  });

  it('bỏ nhóm rỗng để bảng không có tiêu đề trống', () => {
    const groups = groupCategories([cat('car-rental')], 'vi');
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('car-rental');
  });

  it('danh sách rỗng cho ra không nhóm nào', () => {
    expect(groupCategories([], 'vi')).toEqual([]);
  });

  it('giữ đúng thứ tự khai báo trong nhóm', () => {
    const groups = groupCategories(allReal(), 'vi');
    const tours = groups.find((g) => g.id === 'tours');
    expect(tours?.items.map((i) => i.slug)).toEqual([
      'day-tours', 'multi-day-tours', 'dubai-uae-tours', 'pilgrimage-tours',
      'desert-safari', 'yacht-cruise', 'tour-guides',
    ]);
  });

  it('giữ nguyên số dịch vụ của danh mục', () => {
    const groups = groupCategories([cat('car-rental', 7)], 'vi');
    expect(groups[0].items[0].serviceCount).toBe(7);
  });

  it('đổi tên nhóm theo ngôn ngữ', () => {
    expect(groupCategories(allReal(), 'vi')[0].name).toBe('Tour & trải nghiệm');
    expect(groupCategories(allReal(), 'en')[0].name).toBe('Tours & experiences');
  });
});

describe('Biểu tượng danh mục', () => {
  it('mọi danh mục thật đều có biểu tượng', () => {
    for (const c of seededCategories) {
      expect(typeof categoryIcon(c.slug, 'other'), c.slug).toBe('function');
    }
  });

  it('danh mục lạ vẫn có biểu tượng dự phòng', () => {
    expect(typeof categoryIcon('khong-ton-tai', 'tours')).toBe('function');
    expect(typeof categoryIcon('khong-ton-tai', 'nhom-la')).toBe('function');
  });
});
