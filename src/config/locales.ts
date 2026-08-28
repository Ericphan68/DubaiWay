/**
 * Danh sách ngôn ngữ và tiền tệ hiển thị trên thanh chọn.
 *
 * `available: false` nghĩa là đã có chỗ trong giao diện nhưng CHƯA có bản dịch /
 * chưa bật — hiện mờ và không bấm được, thay vì giấu đi. Người dùng thấy được
 * lộ trình, và khi thêm bản dịch chỉ cần đổi cờ này thành true.
 */

export interface LanguageOption {
  /** Mã dùng trong URL/cookie. */
  readonly code: string;
  /** Tên hiển thị, viết bằng chính ngôn ngữ đó. */
  readonly label: string;
  /** Nhãn phụ trong ngoặc, ví dụ vùng lãnh thổ. */
  readonly region?: string;
  /** Mã BCP-47 cho Intl. */
  readonly intl: string;
  readonly rtl?: boolean;
  readonly available: boolean;
  readonly suggested?: boolean;
}

/** 12 ngôn ngữ theo thị trường khách chính của Dubai. */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt',       intl: 'vi-VN', available: true,  suggested: true },
  { code: 'en', label: 'English',          region: 'US', intl: 'en-US', available: true, suggested: true },
  { code: 'ar', label: 'العربية',           intl: 'ar-AE', rtl: true, available: false },
  { code: 'zh', label: '中文',              region: '简体', intl: 'zh-CN', available: false },
  { code: 'ko', label: '한국어',             intl: 'ko-KR', available: false },
  { code: 'ja', label: '日本語',             intl: 'ja-JP', available: false },
  { code: 'ru', label: 'Русский',          intl: 'ru-RU', available: false },
  { code: 'fr', label: 'Français',         intl: 'fr-FR', available: false },
  { code: 'de', label: 'Deutsch',          intl: 'de-DE', available: false },
  { code: 'es', label: 'Español',          intl: 'es-ES', available: false },
  { code: 'hi', label: 'हिन्दी',              intl: 'hi-IN', available: false },
  { code: 'id', label: 'Bahasa Indonesia', intl: 'id-ID', available: false },
];

export interface CurrencyOption {
  readonly code: string;
  /** Tên tiếng Việt. */
  readonly nameVi: string;
  /** Tên tiếng Anh. */
  readonly nameEn: string;
  /** Số chữ số thập phân (ISO-4217). */
  readonly minorUnits: number;
  /**
   * Tỷ giá quy đổi từ 1 AED. CHỈ dùng để HIỂN THỊ tham khảo.
   * Mọi giao dịch vẫn tính và thu bằng AED — xem ghi chú trong CurrencyPicker.
   */
  readonly perAed: number;
  readonly available: boolean;
  readonly popular?: boolean;
}

/**
 * 12 tiền tệ theo thị trường khách chính.
 *
 * TỶ GIÁ Ở ĐÂY LÀ THAM KHẢO, CẬP NHẬT THỦ CÔNG. Khi nối nguồn tỷ giá thật
 * (ví dụ ECB hoặc nhà cung cấp FX), thay hàm đọc `perAed` bằng lời gọi API và
 * lưu tỷ giá đã dùng vào từng đơn hàng — bảng `bookings` đã có cột fx_rate_x1e6.
 */
export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { code: 'AED', nameVi: 'Dirham UAE',        nameEn: 'U.A.E. Dirham',    minorUnits: 2, perAed: 1,        available: true, popular: true },
  { code: 'VND', nameVi: 'Đồng Việt Nam',     nameEn: 'Vietnamese Dong',  minorUnits: 0, perAed: 7150,     available: true, popular: true },
  { code: 'USD', nameVi: 'Đô la Mỹ',          nameEn: 'U.S. Dollar',      minorUnits: 2, perAed: 0.2723,   available: true, popular: true },
  { code: 'EUR', nameVi: 'Euro',              nameEn: 'Euro',             minorUnits: 2, perAed: 0.2510,   available: true, popular: true },
  { code: 'GBP', nameVi: 'Bảng Anh',          nameEn: 'British Pound',    minorUnits: 2, perAed: 0.2140,   available: true },
  { code: 'SAR', nameVi: 'Riyal Ả Rập Xê Út', nameEn: 'Saudi Riyal',      minorUnits: 2, perAed: 1.0212,   available: true },
  { code: 'INR', nameVi: 'Rupee Ấn Độ',       nameEn: 'Indian Rupee',     minorUnits: 2, perAed: 23.65,    available: true },
  { code: 'CNY', nameVi: 'Nhân dân tệ',       nameEn: 'Chinese Yuan',     minorUnits: 2, perAed: 1.945,    available: true },
  { code: 'KRW', nameVi: 'Won Hàn Quốc',      nameEn: 'Korean Won',       minorUnits: 0, perAed: 372,      available: true },
  { code: 'JPY', nameVi: 'Yên Nhật',          nameEn: 'Japanese Yen',     minorUnits: 0, perAed: 41.5,     available: true },
  { code: 'SGD', nameVi: 'Đô la Singapore',   nameEn: 'Singapore Dollar', minorUnits: 2, perAed: 0.3540,   available: true },
  { code: 'RUB', nameVi: 'Rúp Nga',           nameEn: 'Russian Ruble',    minorUnits: 2, perAed: 23.10,    available: true },
];

/** Tiền tệ hệ thống dùng để tính toán và thu tiền. Không đổi theo lựa chọn hiển thị. */
export const SETTLEMENT_CURRENCY = 'AED';

export const DEFAULT_DISPLAY_CURRENCY = 'AED';

export function getCurrencyOption(code: string): CurrencyOption | undefined {
  return CURRENCY_OPTIONS.find((c) => c.code === code);
}

export function getLanguageOption(code: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((l) => l.code === code);
}

export function isAvailableCurrency(code: string): boolean {
  return CURRENCY_OPTIONS.some((c) => c.code === code && c.available);
}

export function isAvailableLanguage(code: string): boolean {
  return LANGUAGE_OPTIONS.some((l) => l.code === code && l.available);
}

/**
 * Quy đổi số tiền AED (đơn vị nhỏ nhất) sang tiền hiển thị.
 * Trả về số ở đơn vị LỚN để hiển thị, không dùng cho tính toán tài chính.
 */
export function convertFromAed(amountMinorAed: number, target: CurrencyOption): number {
  const majorAed = amountMinorAed / 100;
  return majorAed * target.perAed;
}

/** Định dạng số tiền đã quy đổi theo chuẩn của ngôn ngữ đang chọn. */
export function formatConverted(
  amountMinorAed: number,
  target: CurrencyOption,
  intlLocale: string,
): string {
  const value = convertFromAed(amountMinorAed, target);
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: target.code,
    minimumFractionDigits: target.minorUnits,
    maximumFractionDigits: target.minorUnits,
  }).format(value);
}
