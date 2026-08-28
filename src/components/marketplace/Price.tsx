import type { Money } from '@/core/money';
import { formatMoney } from '@/core/money';
import {
  SETTLEMENT_CURRENCY, formatConverted, getCurrencyOption, type CurrencyOption,
} from '@/config/locales';
import { INTL_LOCALES, type Locale } from '@/i18n';

/**
 * Hiển thị giá theo tiền tệ người dùng chọn.
 *
 * NGUYÊN TẮC: chỉ đổi phần HIỂN THỊ. Số tiền gốc luôn là AED và mọi tính toán
 * (hoa hồng, thưởng, đối soát) vẫn dùng AED. Khi hiển thị bằng tiền khác,
 * thêm dấu ≈ để khách hiểu đây là quy đổi tham khảo, không phải số thu thật.
 */
export function formatDisplayPrice(
  money: Money,
  currency: CurrencyOption,
  locale: Locale,
): { text: string; isConverted: boolean } {
  const intl = INTL_LOCALES[locale];

  // Cùng tiền tệ thì hiển thị thẳng, không có dấu ≈.
  if (money.currency === currency.code) {
    return { text: formatMoney(money, intl), isConverted: false };
  }
  // Chỉ quy đổi được từ tiền quyết toán của hệ thống.
  if (money.currency !== SETTLEMENT_CURRENCY) {
    return { text: formatMoney(money, intl), isConverted: false };
  }
  return { text: `≈ ${formatConverted(money.amount, currency, intl)}`, isConverted: true };
}

export function Price({
  money, currency, locale, className,
}: {
  money: Money;
  currency: CurrencyOption;
  locale: Locale;
  className?: string;
}) {
  const { text, isConverted } = formatDisplayPrice(money, currency, locale);
  const exact = formatMoney(money, INTL_LOCALES[locale]);
  return (
    <span
      className={className}
      // Rê chuột thấy số tiền thật sẽ bị trừ, tránh hiểu nhầm giá quy đổi là giá thu.
      title={isConverted ? exact : undefined}
    >
      {text}
    </span>
  );
}

export { getCurrencyOption };
