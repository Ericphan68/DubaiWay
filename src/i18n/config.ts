/**
 * Cấu hình đa ngôn ngữ.
 *
 * Tiếng Ả Rập đã có sẵn chỗ trong kiểu dữ liệu và trong schema database
 * (bảng *_translations chấp nhận locale 'ar'), nhưng CHƯA bật ra người dùng
 * cho tới khi bản dịch và giao diện RTL được kiểm tra xong. Bật bằng cách
 * thêm 'ar' vào ENABLED_LOCALES — không cần đổi schema.
 */
export const ALL_LOCALES = ['vi', 'en', 'ar'] as const;
export type Locale = (typeof ALL_LOCALES)[number];

/** Ngôn ngữ đang phục vụ người dùng. */
export const ENABLED_LOCALES: readonly Locale[] = ['vi', 'en'];

export const DEFAULT_LOCALE: Locale = 'vi';

/** Ngôn ngữ viết từ phải sang trái. */
export const RTL_LOCALES: readonly Locale[] = ['ar'];

export const LOCALE_LABELS: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ar: 'العربية',
};

/** Mã locale đầy đủ dùng cho Intl.NumberFormat / Intl.DateTimeFormat. */
export const INTL_LOCALES: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-AE',
  ar: 'ar-AE',
};

export function isEnabledLocale(value: string): value is Locale {
  return (ENABLED_LOCALES as readonly string[]).includes(value);
}

export function textDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Chọn ngôn ngữ từ header Accept-Language.
 * Bỏ qua ngôn ngữ chưa bật, và luôn có giá trị dự phòng.
 */
export function resolveLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.trim().toLowerCase(), q: q ? Number.parseFloat(q) : 1 };
    })
    .filter((x) => Number.isFinite(x.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isEnabledLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
