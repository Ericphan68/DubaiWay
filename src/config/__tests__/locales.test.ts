import { describe, expect, it } from 'vitest';
import {
  CURRENCY_OPTIONS, LANGUAGE_OPTIONS, SETTLEMENT_CURRENCY,
  convertFromAed, formatConverted, getCurrencyOption,
  isAvailableCurrency, isAvailableLanguage,
} from '../locales';
import { CURRENCY_MINOR_UNITS } from '@/core/money';

const cur = (code: string) => {
  const c = getCurrencyOption(code);
  if (!c) throw new Error(`thiếu tiền tệ ${code}`);
  return c;
};

describe('Danh sách ngôn ngữ', () => {
  it('có đúng 12 ngôn ngữ, không trùng mã', () => {
    expect(LANGUAGE_OPTIONS).toHaveLength(12);
    expect(new Set(LANGUAGE_OPTIONS.map((l) => l.code)).size).toBe(12);
  });

  it('hiện chỉ mở tiếng Việt và tiếng Anh', () => {
    const open = LANGUAGE_OPTIONS.filter((l) => l.available).map((l) => l.code);
    expect(open).toEqual(['vi', 'en']);
    expect(isAvailableLanguage('vi')).toBe(true);
    expect(isAvailableLanguage('ar')).toBe(false);
    expect(isAvailableLanguage('xx')).toBe(false);
  });

  it('mọi ngôn ngữ đều khai báo locale Intl hợp lệ', () => {
    for (const l of LANGUAGE_OPTIONS) {
      expect(() => new Intl.NumberFormat(l.intl)).not.toThrow();
    }
  });
});

describe('Danh sách tiền tệ', () => {
  it('có đúng 12 tiền tệ, không trùng mã, tất cả đều dùng được', () => {
    expect(CURRENCY_OPTIONS).toHaveLength(12);
    expect(new Set(CURRENCY_OPTIONS.map((c) => c.code)).size).toBe(12);
    expect(CURRENCY_OPTIONS.every((c) => c.available)).toBe(true);
  });

  it('tỷ giá luôn dương và AED là gốc quy đổi', () => {
    expect(cur(SETTLEMENT_CURRENCY).perAed).toBe(1);
    expect(CURRENCY_OPTIONS.every((c) => c.perAed > 0)).toBe(true);
  });

  it('số chữ số thập phân khớp với bảng đơn vị nhỏ nhất của lõi tiền tệ', () => {
    // Nếu lệch, giá hiển thị sẽ sai số chữ số so với số tiền thật khi thu.
    for (const c of CURRENCY_OPTIONS) {
      const core = (CURRENCY_MINOR_UNITS as Record<string, number>)[c.code];
      if (core === undefined) continue; // tiền chỉ dùng để hiển thị
      expect(c.minorUnits, `${c.code}`).toBe(core);
    }
  });
});

describe('Quy đổi hiển thị', () => {
  it('1.450,00 AED giữ nguyên khi hiển thị bằng AED', () => {
    expect(convertFromAed(145_000, cur('AED'))).toBe(1450);
  });

  it('1.450,00 AED ra 10.367.500 VND với tỷ giá 7150', () => {
    expect(convertFromAed(145_000, cur('VND'))).toBe(1450 * 7150);
  });

  it('300,00 AED ra 81,69 USD với tỷ giá 0,2723', () => {
    expect(convertFromAed(30_000, cur('USD'))).toBeCloseTo(81.69, 2);
  });

  it('số 0 quy đổi vẫn là 0 ở mọi tiền tệ', () => {
    for (const c of CURRENCY_OPTIONS) expect(convertFromAed(0, c)).toBe(0);
  });

  it('định dạng theo đúng số chữ số của từng tiền tệ', () => {
    // VND và JPY không có phần thập phân.
    expect(formatConverted(145_000, cur('VND'), 'vi-VN')).not.toContain(',00');
    expect(formatConverted(10_000, cur('JPY'), 'en-US')).not.toContain('.00');
    // USD luôn có 2 chữ số thập phân.
    expect(formatConverted(10_000, cur('USD'), 'en-US')).toMatch(/\.\d{2}/);
  });

  it('nhận biết được tiền tệ không hỗ trợ', () => {
    expect(isAvailableCurrency('AED')).toBe(true);
    expect(isAvailableCurrency('XYZ')).toBe(false);
  });
});
