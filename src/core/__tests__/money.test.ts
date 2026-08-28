import { describe, expect, it } from 'vitest';
import {
  add,
  allocate,
  applyRateBps,
  formatMoney,
  fromMajorUnits,
  money,
  multiply,
  percentToBps,
  roundHalfUp,
  subtract,
  sum,
} from '../money';

describe('money — số nguyên theo đơn vị nhỏ nhất', () => {
  it('từ chối số thập phân', () => {
    expect(() => money(10.5, 'AED')).toThrow(/số nguyên/);
  });

  it('không có sai số float như 0.1 + 0.2', () => {
    // 0,10 AED + 0,20 AED = 0,30 AED chính xác tuyệt đối
    const a = fromMajorUnits(0.1, 'AED'); // 10 fils
    const b = fromMajorUnits(0.2, 'AED'); // 20 fils
    expect(add(a, b).amount).toBe(30);
  });

  it('không cho cộng hai loại tiền khác nhau', () => {
    expect(() => add(money(100, 'AED'), money(100, 'USD'))).toThrow(/AED và USD/);
  });

  it('VND không có đơn vị nhỏ hơn', () => {
    expect(fromMajorUnits(1_000_000, 'VND').amount).toBe(1_000_000);
    expect(fromMajorUnits(1000.5, 'AED').amount).toBe(100050);
  });

  it('nhân với số lượng khách', () => {
    expect(multiply(money(25000, 'AED'), 4).amount).toBe(100000);
  });

  it('cộng dồn danh sách', () => {
    expect(sum([money(100, 'AED'), money(250, 'AED'), money(1, 'AED')], 'AED').amount).toBe(351);
  });

  it('làm tròn HALF_UP, ra xa số 0', () => {
    expect(roundHalfUp(2.5)).toBe(3);
    expect(roundHalfUp(-2.5)).toBe(-3);
    expect(roundHalfUp(2.4)).toBe(2);
  });

  it('applyRateBps: 10% của 100.000 fils = 10.000 fils', () => {
    expect(applyRateBps(money(100000, 'AED'), 1000).amount).toBe(10000);
  });

  it('applyRateBps làm tròn đúng khi lẻ', () => {
    // 10% của 105 = 10,5 → 11 (half-up)
    expect(applyRateBps(money(105, 'AED'), 1000).amount).toBe(11);
  });

  it('percentToBps', () => {
    expect(percentToBps(10)).toBe(1000);
    expect(percentToBps(30)).toBe(3000);
    expect(percentToBps(2.5)).toBe(250);
    expect(() => percentToBps(0.001)).toThrow();
  });

  it('allocate chia hết, không mất tiền do làm tròn', () => {
    const parts = allocate(money(100, 'AED'), 3);
    expect(parts.map((p) => p.amount)).toEqual([34, 33, 33]);
    expect(parts.reduce((s, p) => s + p.amount, 0)).toBe(100);
  });

  it('allocate với số âm vẫn cộng lại đúng', () => {
    const parts = allocate(money(-100, 'AED'), 3);
    expect(parts.reduce((s, p) => s + p.amount, 0)).toBe(-100);
  });

  it('subtract cho ra số âm dùng cho bút toán đảo', () => {
    expect(subtract(money(0, 'AED'), money(3000, 'AED')).amount).toBe(-3000);
  });

  it('formatMoney hiển thị đúng số lẻ', () => {
    expect(formatMoney(money(100050, 'AED'), 'en-AE')).toContain('1,000.50');
  });
});
