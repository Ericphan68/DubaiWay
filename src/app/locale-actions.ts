'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ENABLED_LOCALES, type Locale } from '@/i18n';
import { LOCALE_COOKIE } from '@/server/locale';
import { CURRENCY_COOKIE } from '@/server/currency';
import { isAvailableCurrency, isAvailableLanguage } from '@/config/locales';

/**
 * Đổi ngôn ngữ hiển thị.
 *
 * Lưu vào cookie để lựa chọn của người dùng thắng header Accept-Language —
 * nếu không, đổi ngôn ngữ xong lại bị trình duyệt đẩy về cũ.
 */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const value = String(formData.get('locale') ?? '');
  // Chỉ nhận ngôn ngữ đã có bản dịch. Ngôn ngữ mới liệt kê nhưng chưa bật
  // sẽ bị bỏ qua thay vì ghi bừa vào cookie rồi hiển thị trống.
  if (!isAvailableLanguage(value) || !(ENABLED_LOCALES as readonly string[]).includes(value)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, value as Locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}

/**
 * Đổi tiền tệ HIỂN THỊ.
 *
 * Không ảnh hưởng số tiền thực thu — đơn hàng vẫn tính và thu bằng USD.
 */
export async function setCurrencyAction(formData: FormData): Promise<void> {
  const value = String(formData.get('currency') ?? '');
  if (!isAvailableCurrency(value)) return;

  const store = await cookies();
  store.set(CURRENCY_COOKIE, value, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
