/**
 * Lấy từ điển theo ngôn ngữ.
 *
 * Từ điển được import tĩnh nên TypeScript kiểm tra được khoá dịch, và bản build
 * không phải đọc file lúc chạy. Khi thêm tiếng Ả Rập, tạo ar.json rồi thêm vào map.
 */
import en from './dictionaries/en.json';
import vi from './dictionaries/vi.json';
import { DEFAULT_LOCALE, type Locale } from './config';

export type Dictionary = typeof vi;

const DICTIONARIES: Partial<Record<Locale, Dictionary>> = {
  vi,
  en: en as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? (DICTIONARIES[DEFAULT_LOCALE] as Dictionary);
}

export * from './config';
