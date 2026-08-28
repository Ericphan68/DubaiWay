/**
 * Xác định ngôn ngữ cho một request phía server.
 *
 * Thứ tự ưu tiên: cookie người dùng tự chọn → header Accept-Language → mặc định.
 * Chọn thủ công phải thắng, nếu không người dùng đổi ngôn ngữ rồi lại bị đẩy về cũ.
 */
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, isEnabledLocale, resolveLocale, type Locale } from '@/i18n';

export const LOCALE_COOKIE = 'dw_locale';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (chosen && isEnabledLocale(chosen)) return chosen;

  const h = await headers();
  return resolveLocale(h.get('accept-language')) ?? DEFAULT_LOCALE;
}
