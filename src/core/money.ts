/**
 * Money primitives — TOÀN BỘ tiền trong hệ thống dùng SỐ NGUYÊN theo đơn vị nhỏ nhất
 * (minor units: fils với AED, cent với USD, đồng với VND).
 *
 * Lý do: số thực (float) làm sai lệch phép cộng/nhân tiền. 0.1 + 0.2 !== 0.3.
 * Mọi giá trị tài chính lưu DB bằng BIGINT + mã tiền tệ, không bao giờ dùng NUMERIC/FLOAT.
 */

/** Mã tiền tệ ISO-4217 hệ thống hỗ trợ. Mở rộng bằng cách thêm vào đây + CURRENCY_MINOR_UNITS. */
export const SUPPORTED_CURRENCIES = ['AED', 'USD', 'VND', 'EUR'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Số chữ số thập phân của từng loại tiền (exponent theo ISO-4217). */
export const CURRENCY_MINOR_UNITS: Record<CurrencyCode, number> = {
  AED: 2, // 1 AED = 100 fils
  USD: 2,
  EUR: 2,
  VND: 0, // đồng không có đơn vị nhỏ hơn
};

/** Một khoản tiền. `amount` LUÔN là số nguyên theo đơn vị nhỏ nhất. */
export interface Money {
  /** Số nguyên, đơn vị nhỏ nhất. VD 1.000,50 AED => 100050 */
  readonly amount: number;
  readonly currency: CurrencyCode;
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

function assertInteger(amount: number, ctx: string): void {
  if (!Number.isInteger(amount)) {
    throw new MoneyError(`${ctx}: số tiền phải là số nguyên theo đơn vị nhỏ nhất, nhận được ${amount}`);
  }
  if (!Number.isSafeInteger(amount)) {
    throw new MoneyError(`${ctx}: số tiền vượt quá giới hạn an toàn (${amount})`);
  }
}

export function money(amount: number, currency: CurrencyCode): Money {
  assertInteger(amount, 'money()');
  // Chuẩn hoá -0 về 0. JS phân biệt hai giá trị này và -0 lọt vào sổ cái
  // sẽ gây khác biệt khó hiểu khi so sánh, khi ghi DB và khi hiển thị.
  return Object.freeze({ amount: amount === 0 ? 0 : amount, currency });
}

export function zero(currency: CurrencyCode): Money {
  return money(0, currency);
}

function assertSameCurrency(a: Money, b: Money, op: string): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(`${op}: không thể thao tác giữa ${a.currency} và ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b, 'add');
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b, 'subtract');
  return money(a.amount - b.amount, a.currency);
}

export function sum(items: readonly Money[], currency: CurrencyCode): Money {
  return items.reduce<Money>((acc, m) => add(acc, m), zero(currency));
}

/** Nhân với một số nguyên (VD: đơn giá × số khách). Không làm tròn vì kết quả luôn nguyên. */
export function multiply(a: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new MoneyError(`multiply: số lượng phải là số nguyên không âm, nhận được ${quantity}`);
  }
  return money(a.amount * quantity, a.currency);
}

/**
 * Quy tắc làm tròn duy nhất của hệ thống: HALF_UP trên giá trị tuyệt đối
 * (0,5 làm tròn ra xa số 0). Chọn HALF_UP vì đây là quy ước kế toán phổ thông,
 * dễ giải thích với merchant và khớp cách người dùng tự tính tay.
 */
export function roundHalfUp(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/**
 * Nhân với tỷ lệ phần trăm biểu diễn bằng basis points (1 bp = 0,01%).
 * VD hoa hồng 10% => 1000 bp. Dùng bps để tỷ lệ luôn là số nguyên, không có sai số float.
 */
export function applyRateBps(a: Money, rateBps: number): Money {
  if (!Number.isInteger(rateBps) || rateBps < 0) {
    throw new MoneyError(`applyRateBps: tỷ lệ phải là số nguyên bps không âm, nhận được ${rateBps}`);
  }
  return money(roundHalfUp((a.amount * rateBps) / 10_000), a.currency);
}

/** Chuyển phần trăm dạng người đọc (10 = 10%) sang basis points. */
export function percentToBps(percent: number): number {
  const bps = percent * 100;
  if (!Number.isInteger(bps)) {
    throw new MoneyError(`percentToBps: ${percent}% không biểu diễn được bằng bps nguyên`);
  }
  return bps;
}

export function isZero(a: Money): boolean {
  return a.amount === 0;
}

export function isNegative(a: Money): boolean {
  return a.amount < 0;
}

export function compare(a: Money, b: Money): number {
  assertSameCurrency(a, b, 'compare');
  return a.amount === b.amount ? 0 : a.amount < b.amount ? -1 : 1;
}

/** Đảo dấu — dùng cho bút toán reversal (hoàn tiền, huỷ thưởng). */
export function negate(a: Money): Money {
  return money(-a.amount, a.currency);
}

/**
 * Chia một khoản tiền thành n phần sao cho tổng các phần BẰNG ĐÚNG số ban đầu.
 * Phần dư được rải đều từng đơn vị nhỏ nhất cho các phần đầu — không mất tiền do làm tròn.
 */
export function allocate(a: Money, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new MoneyError(`allocate: số phần phải là số nguyên dương, nhận được ${parts}`);
  }
  const base = Math.trunc(a.amount / parts);
  let remainder = a.amount - base * parts;
  const step = remainder >= 0 ? 1 : -1;
  const result: Money[] = [];
  for (let i = 0; i < parts; i += 1) {
    const extra = remainder !== 0 ? step : 0;
    remainder -= extra;
    result.push(money(base + extra, a.currency));
  }
  return result;
}

/** Định dạng để hiển thị. Chỉ dùng ở tầng UI, không dùng cho tính toán. */
export function formatMoney(a: Money, locale = 'vi-VN'): string {
  const exponent = CURRENCY_MINOR_UNITS[a.currency];
  const major = a.amount / 10 ** exponent;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: a.currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(major);
}

/** Đọc tiền từ DB (BIGINT + currency). */
export function fromMinorUnits(amount: number | string, currency: CurrencyCode): Money {
  return money(typeof amount === 'string' ? Number.parseInt(amount, 10) : amount, currency);
}

/** Tạo tiền từ đơn vị lớn (VD 1000.5 AED) — chỉ dùng ở seed/nhập liệu, không dùng trong tính toán. */
export function fromMajorUnits(value: number, currency: CurrencyCode): Money {
  const exponent = CURRENCY_MINOR_UNITS[currency];
  return money(roundHalfUp(value * 10 ** exponent), currency);
}
