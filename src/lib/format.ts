import type { Currency, Price } from '@/types';

const formatters: Record<Currency, Intl.NumberFormat> = {
  VND: new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
};

export function formatCurrency(amount: number, currency: Currency): string {
  return formatters[currency].format(amount);
}

/** Hiển thị "từ 25.900.000₫" — luôn kèm nghĩa giá tham khảo ở UI. */
export function formatPrice(price: Price): string {
  return formatCurrency(price.from, price.currency);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}
