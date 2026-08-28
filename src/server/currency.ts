/**
 * Tiền tệ hiển thị do người dùng chọn.
 *
 * QUAN TRỌNG: đây chỉ là tiền tệ HIỂN THỊ. Mọi tính toán, ghi sổ và thu tiền
 * vẫn bằng USD (SETTLEMENT_CURRENCY). Nếu để tiền hiển thị lọt vào phần tính
 * toán, sai số quy đổi sẽ làm lệch hoa hồng và đối soát.
 */
import { cookies } from 'next/headers';
import {
  CURRENCY_OPTIONS, DEFAULT_DISPLAY_CURRENCY, getCurrencyOption, isAvailableCurrency,
  type CurrencyOption,
} from '@/config/locales';

export const CURRENCY_COOKIE = 'dw_currency';

export async function getDisplayCurrency(): Promise<CurrencyOption> {
  const store = await cookies();
  const chosen = store.get(CURRENCY_COOKIE)?.value;
  if (chosen && isAvailableCurrency(chosen)) {
    return getCurrencyOption(chosen) as CurrencyOption;
  }
  return getCurrencyOption(DEFAULT_DISPLAY_CURRENCY) as CurrencyOption;
}

export { CURRENCY_OPTIONS };
