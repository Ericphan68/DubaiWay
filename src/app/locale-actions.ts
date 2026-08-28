'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ENABLED_LOCALES, type Locale } from '@/i18n';
import { LOCALE_COOKIE } from '@/server/locale';

/**
 * Đổi ngôn ngữ hiển thị.
 *
 * Lưu vào cookie để lựa chọn của người dùng thắng header Accept-Language —
 * nếu không, đổi ngôn ngữ xong lại bị trình duyệt đẩy về cũ.
 */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const value = String(formData.get('locale') ?? '');
  // Chỉ nhận ngôn ngữ đang bật; giá trị lạ bị bỏ qua thay vì ghi bừa vào cookie.
  if (!(ENABLED_LOCALES as readonly string[]).includes(value)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, value as Locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
