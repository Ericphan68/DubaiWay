import { describe, expect, it } from 'vitest';
import en from '../dictionaries/en.json';
import vi from '../dictionaries/vi.json';
import {
  DEFAULT_LOCALE, ENABLED_LOCALES, getDictionary, isEnabledLocale, resolveLocale, textDirection,
} from '..';

/** Duyệt sâu để so sánh cấu trúc hai từ điển. */
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('Từ điển', () => {
  it('tiếng Anh có ĐÚNG các khoá như tiếng Việt — không thiếu bản dịch', () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(vi).sort());
  });

  it('không có giá trị rỗng trong bất kỳ từ điển nào', () => {
    const flat = (o: unknown): string[] =>
      typeof o === 'string' ? [o] : Object.values(o as object).flatMap(flat);
    expect(flat(vi).filter((s) => s.trim() === '')).toHaveLength(0);
    expect(flat(en).filter((s) => s.trim() === '')).toHaveLength(0);
  });

  it('không còn chữ lorem ipsum', () => {
    const text = JSON.stringify(vi) + JSON.stringify(en);
    expect(text.toLowerCase()).not.toContain('lorem');
    expect(text.toLowerCase()).not.toContain('ipsum');
  });

  it('có đủ nhãn cho mọi trạng thái booking', () => {
    const statuses = ['draft','pending_payment','paid','confirmed','completed','cancelled','refunded','expired'];
    for (const s of statuses) {
      expect(Object.keys(vi.booking.status)).toContain(s);
      expect(Object.keys(en.booking.status)).toContain(s);
    }
  });

  it('giải thích referral nêu rõ 30% của HOA HỒNG và một tầng', () => {
    expect(vi.referral.explainer).toContain('30% hoa hồng');
    expect(vi.referral.explainer).toContain('một tầng');
    expect(en.referral.explainer).toContain('30% of the commission');
    expect(en.referral.explainer).toContain('single level');
  });
});

describe('Chọn ngôn ngữ', () => {
  it('mặc định là tiếng Việt', () => {
    expect(DEFAULT_LOCALE).toBe('vi');
    expect(resolveLocale(null)).toBe('vi');
  });

  it('đọc được Accept-Language', () => {
    expect(resolveLocale('en-US,en;q=0.9')).toBe('en');
    expect(resolveLocale('vi-VN,vi;q=0.9,en;q=0.8')).toBe('vi');
  });

  it('ưu tiên theo trọng số q', () => {
    expect(resolveLocale('fr;q=0.9,en;q=1.0')).toBe('en');
  });

  it('ngôn ngữ chưa bật thì rơi về mặc định', () => {
    expect(resolveLocale('ar-AE,ar;q=0.9')).toBe('vi');
    expect(resolveLocale('ja-JP')).toBe('vi');
  });

  it('tiếng Ả Rập chưa bật cho người dùng nhưng đã có chỗ sẵn', () => {
    expect(isEnabledLocale('ar')).toBe(false);
    expect(ENABLED_LOCALES).toEqual(['vi', 'en']);
  });
});

describe('Hướng viết chữ (chuẩn bị RTL)', () => {
  it('tiếng Việt và tiếng Anh viết trái sang phải', () => {
    expect(textDirection('vi')).toBe('ltr');
    expect(textDirection('en')).toBe('ltr');
  });

  it('tiếng Ả Rập viết phải sang trái', () => {
    expect(textDirection('ar')).toBe('rtl');
  });
});

describe('getDictionary', () => {
  it('trả đúng từ điển theo ngôn ngữ', () => {
    expect(getDictionary('vi').common.search).toBe('Tìm kiếm');
    expect(getDictionary('en').common.search).toBe('Search');
  });

  it('ngôn ngữ chưa có bản dịch thì rơi về mặc định, không sập', () => {
    expect(getDictionary('ar').common.search).toBe('Tìm kiếm');
  });
});
